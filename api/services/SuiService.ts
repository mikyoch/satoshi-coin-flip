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

  constructor() {
    // @todo: parameterized initialization here?
    this.provider = new JsonRpcProvider(Network.DEVNET);
    this.signer = this.getSigner();
    this.gasCoins = [];
    this.gasCoinSelection = "";
    this.populateGasCoins();
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

  private async populateGasCoins() {
    try {
      const gasCoins = await this.getAllCoins();
      if (gasCoins.length > 5 && this.ensureAvailableCoins(gasCoins, 5, 5000)) {
        // pick the first 5 coins
        this.gasCoins = gasCoins
          .filter((coin, index) => index < 5)
          .map((coin) => coin.id);
      } else {
        // if no suitable coins were found request from the faucet
        const faucetRes: any = await this.provider.requestSuiFromFaucet(
          String(process.env.BANKER_ADDRESS)
        );
        console.log(
          "Banker low on funds... Requested from faucet successfully!"
        );
        this.gasCoins = faucetRes.transferred_gas_objects.map(
          (el: any) => el.id
        );
      }
      this.gasCoinSelection = this.gasCoins[0];
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

    const smallGasCoins = gasCoins.filter((coin) => coin.balance < 5000);

    if (smallGasCoins.length > 0) {
      const largestCoin = await this.getLargestBankCoin();
      console.log("Small coins found, merging...");
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
    return this.gasCoinSelection;
  }

  private getAllCoins(): Promise<{ id: any; balance: any }[]> {
    return new Promise((resolve, reject) => {
      this.provider
        .getObjectsOwnedByAddress(String(process.env.BANKER_ADDRESS))
        .then((res) => {
          let coinObjects = res.filter((x) => x.type.includes("Coin"));
          this.provider
            .getObjectBatch(coinObjects.map((x) => x.objectId))
            .then((res) => {
              const coins: { id: any; balance: any }[] = res.map((x) => {
                return {
                  id: Object(x?.details)?.data?.fields?.id?.id,
                  balance: Object(x?.details)?.data?.fields?.balance,
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

  public async getPlayCoin(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Find the largest coin that is not in gasPayment coins to use as stake
        let gasCoin = await this.getLargestBankCoin();
        if (!gasCoin.id) {
          console.log("Banker low on funds... ");
          await this.provider.requestSuiFromFaucet(
            String(process.env.BANKER_ADDRESS)
          );
          console.log("Requested from faucet successfully!");
        }

        gasCoin = await this.getLargestBankCoin();

        resolve(gasCoin.id);
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
