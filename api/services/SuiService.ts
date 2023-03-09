// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import {
  Connection,
  Ed25519Keypair,
  GetObjectDataResponse,
  JsonRpcProvider,
  RawSigner,
  SuiExecuteTransactionResponse,
  SuiJsonValue,
} from "@mysten/sui.js";

interface SuiServiceInterface {
  executeMoveCall(
    packageObjId: string,
    module: string,
    typeArguments: [],
    funName: string,
    funArguments: SuiJsonValue[],
    gasBudget?: number
  ): Promise<SuiExecuteTransactionResponse>;
  getObject(objectId: string): Promise<GetObjectDataResponse>;
}

class SuiService implements SuiServiceInterface {
  private provider: JsonRpcProvider;
  private signer: RawSigner;
  private gasCoins: string[];
  private gasCoinSelection: string;
  private playCoins: string[];

  constructor() {
    // @todo: parameterized initialization here?
    const connectionOptions: Connection = new Connection({
      fullnode: "https://fullnode.devnet.sui.io",
    });
    this.provider = new JsonRpcProvider(connectionOptions);
    this.signer = this.getSigner();
    this.gasCoins = [];
    this.playCoins = [];
    this.gasCoinSelection = "";
    this.populateGasCoins();
  }

  private getSigner(): RawSigner {
    let privKeyArray: number[] = JSON.parse(String(process.env.PRIVATE_KEY));

    const keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(privKeyArray));
    const signer = new RawSigner(keypair, this.provider);
    return signer;
  }

  private ensureAvailableCoins(
    coins: { id: string; balance: number }[],
    minAmount: number,
    minBalance: number
  ) {
    let suitableCoins = 0;
    for (let coin of coins) {
      if (coin.balance >= minBalance) {
        suitableCoins += 1;
      }
    }
    return suitableCoins >= minAmount;
  }

  private async requestFromFaucet() {
    console.log("Banker low on funds, requesting from faucet...");
    const faucetRes: any = await this.provider.requestSuiFromFaucet(
      String(process.env.BANKER_ADDRESS)
    );
    console.log("Requested from faucet successfully!");
    return faucetRes;
  }

  private async populateGasCoins() {
    try {
      const gasCoins = await this.getAllCoins();
      if (gasCoins.length > 5 && this.ensureAvailableCoins(gasCoins, 5, 5000)) {
        // pick the largest 5 coins
        gasCoins.sort((a, b) => b.balance - a.balance);
        this.gasCoins = gasCoins
          .filter((coin, index) => index < 5)
          .map((coin) => coin.id);
      } else {
        // if no suitable coins were found request from the faucet
        const faucetRes: any = await this.requestFromFaucet();
        this.gasCoins = faucetRes.transferred_gas_objects.map(
          (el: any) => el.id
        );
      }
      this.gasCoinSelection = this.gasCoins[0];
      console.log("Gas coins", this.gasCoins);
    } catch (e) {
      console.error("Populating gas coins failed: ", e);
    }
  }

  private async mergeCoins(
    coinsToMerge: { id: string; balance: number }[],
    gasBudget = 10000
  ) {
    return this.signer.payAllSui({
      inputCoins: [...coinsToMerge.map((coin) => coin.id)],
      recipient: String(process.env.BANKER_ADDRESS),
      gasBudget,
    });
  }

  private async checkGasCoinBalances() {
    const allCoins = await this.getAllCoins();

    const gasCoins = allCoins.filter((coin) =>
      this.gasCoins.some((coinId) => coinId === coin.id)
    );

    const smallGasCoins = gasCoins.filter((coin) => coin.balance <= 10000);

    if (smallGasCoins.length > 0) {
      const largestCoin = await this.getLargestBankCoin();
      console.log(`Small coins found, merging into ${largestCoin.id}...`);
      await this.mergeCoins([largestCoin, ...smallGasCoins]);
      await this.populateGasCoins();
    }
  }

  private async getNextGasCoin() {
    // @todo: how do we recover if this call fails?
    await this.checkGasCoinBalances();

    const coinIdIndex = this.gasCoins.findIndex(
      (coinId) => coinId === this.gasCoinSelection
    );
    // select nextIndex + 1 and wrap around if we are at the end
    const nextIndex = (coinIdIndex + 1) % this.gasCoins.length;
    this.gasCoinSelection = this.gasCoins.at(nextIndex) || "";
    console.log("Gas coin", this.gasCoinSelection);
    return this.gasCoinSelection;
  }

  private getAllCoins(): Promise<{ id: any; balance: number }[]> {
    return new Promise((resolve, reject) => {
      this.provider
        .getObjectsOwnedByAddress(String(process.env.BANKER_ADDRESS))
        .then((res) => {
          let coinObjects = res.filter((x) => x.type.includes("Coin"));
          this.provider
            .getObjectBatch(coinObjects.map((x) => x.objectId))
            .then((res) => {
              const coins: { id: any; balance: number }[] = res.map((x) => {
                return {
                  id: Object(x?.details)?.data?.fields?.id?.id,
                  balance: Number(Object(x?.details)?.data?.fields?.balance),
                };
              });
              resolve(coins);
            });
        })
        .catch((e) => {
          console.error("Get all coins error: ", e);
          reject(e);
        });
    });
  }

  private async getLargestBankCoin(): Promise<{ id: string; balance: number }> {
    return new Promise((resolve, reject) => {
      let largestCoin = { id: "", balance: 0 };
      try {
        this.getAllCoins().then((bankCoins) => {
          for (let coin of bankCoins) {
            if (
              coin.balance >= largestCoin.balance &&
              !this.gasCoins.some((coinId) => coinId === coin.id)
            ) {
              largestCoin = coin;
            }
          }

          resolve(largestCoin);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public async getObject(objectId: string): Promise<GetObjectDataResponse> {
    return this.signer.provider.getObject(objectId);
  }

  public async executeMoveCall(
    packageObjId: string,
    module: string,
    typeArguments: [],
    funName: string,
    funArguments: SuiJsonValue[],
    gasBudget: number = 1000
  ): Promise<SuiExecuteTransactionResponse> {
    const response = await this.signer.executeMoveCall({
      packageObjectId: packageObjId,
      module: module,
      typeArguments: typeArguments,
      function: funName,
      arguments: funArguments,
      gasBudget,
      gasPayment: await this.getNextGasCoin(),
    });

    return response;
  }
}

export { SuiService, SuiServiceInterface };
