// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import {
  Ed25519Keypair,
  GetObjectDataResponse,
  JsonRpcProvider,
  Network,
  RawSigner,
  SuiExecuteTransactionResponse,
  SuiJsonValue,
} from "@mysten/sui.js";

interface SuiServiceInterface {
  getPlayCoin(): Promise<string>;
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
    this.provider = new JsonRpcProvider(Network.DEVNET);
    this.signer = this.getSigner();
    this.gasCoins = [];
    this.playCoins = [];
    this.gasCoinSelection = "";
    this.populateGasCoins().then(() => this.populatePlayCoins());
  }

  private getSigner(): RawSigner {
    let privKeyArray: number[] = JSON.parse(String(process.env.PRIVATE_KEY));

    const keypair = Ed25519Keypair.fromSeed(Uint8Array.from(privKeyArray));
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

  private async createPlayCoins(
    largeCoinId: string,
    numOfCoins: number,
    balancePerCoin: number = 5000,
    gasFees: number = 10000
  ) {
    if (!largeCoinId) {
      const faucetRes: any = await this.requestFromFaucet();
      largeCoinId = faucetRes?.transferred_gas_objects?.[0]?.id;
    }
    console.log(
      `Low supply on play coins, creating ${numOfCoins} from coin with id ${largeCoinId}`
    );
    const playCoins = await this.signer.paySui({
      inputCoins: [largeCoinId],
      recipients: [
        ...Array(numOfCoins).fill(String(process.env.BANKER_ADDRESS)),
      ],
      amounts: [...Array(numOfCoins).fill(balancePerCoin)],
      gasBudget: gasFees,
    });
    // @TODO: what happens with concurent requests? are they going to trigger the check multiple times?
    return playCoins;
  }

  private async populatePlayCoins(gasFees = 10000) {
    try {
      // check if we already have some suitable play coins
      let playCoins = (await this.getAllCoins()).filter(
        (coin) => coin.balance === 5000
      );

      this.playCoins = playCoins.map((coin) => coin.id);

      if (playCoins.length > 0) return playCoins;

      // if not create some
      let largeCoin = await this.getLargestBankCoin();
      let canBeCreated = Math.floor((largeCoin.balance - gasFees) / 5000);
      console.log("Coins that can be created", canBeCreated);
      if (canBeCreated >= 50) {
        // creating arbitrarily 50 coins of 5000 balance each
        await this.createPlayCoins(largeCoin.id, 50, 5000, gasFees);

        playCoins = (await this.getAllCoins()).filter(
          (coin) => coin.balance === 5000
        );

        this.playCoins = playCoins.map((coin) => coin.id);
      }

      return playCoins;
    } catch (e) {
      console.error("Could not populate play coins: ", e);
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
              !this.gasCoins.some((coinId) => coinId === coin.id) &&
              coin.id !== "0x95f938719f601bfde8349727b5d239b5f3320aa1"
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

  public async getPlayCoin(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if we have play coins available
        if (this.playCoins.length === 0) {
          // if none are found create some
          await this.populatePlayCoins();
        }
        // get a play coin from the allocated play coins
        let playCoin = this.playCoins.pop();

        resolve(playCoin || "");
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
