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

  constructor() {
    // @todo: parameterized initialization here?
    this.provider = new JsonRpcProvider(Network.DEVNET);
    this.signer = this.getSigner();
  }

  private getSigner(): RawSigner {
    let privKeyArray: number[] = JSON.parse(String(process.env.PRIVATE_KEY));

    const keypair = Ed25519Keypair.fromSeed(Uint8Array.from(privKeyArray));
    const signer = new RawSigner(keypair, this.provider);
    return signer;
  }

  private getBankCoins(): Promise<{ id: any; balance: any }[]> {
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
          console.error("Bank Coins error: ", e);
          reject(e);
        });
    });
  }

  private async fundBankAddressIfGasLow(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const bankCoins = await this.getBankCoins();
        // @todo: eventually make the check more "clever" by checking how much balance the coins have
        if (bankCoins.length > 3) return resolve(false);

        console.log(
          "Banker account found with less than 4 gas objects, requesting SUI from faucet..."
        );
        await this.signer.provider.requestSuiFromFaucet(
          String(process.env.BANKER_ADDRESS)
        );
        resolve(true);
      } catch (e) {
        console.error("Could not check or fund bank address", e);
        reject(e);
      }
    });
  }

  private async getLargestBankCoin(): Promise<{ id: string; balance: number }> {
    // @todo: check here that the largest coin is not used as the gasPayment coin and if it is pick another one
    return new Promise((resolve, reject) => {
      let largestCoin = { id: "", balance: 0 };
      try {
        this.getBankCoins().then((bankCoins) => {
          for (let coin of bankCoins) {
            if (coin.balance >= largestCoin.balance) {
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

  public async getPlayCoin(playValue: number = 5000): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let foundPlayCoinId: string = "";
      try {
        const didFund = await this.fundBankAddressIfGasLow();
        if (didFund) console.log("Banker account funded successfully");

        // @todo: Find the largest coin that is not the current gasPayment coin to use as stake
        const gasCoin = await this.getLargestBankCoin();

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
    await this.fundBankAddressIfGasLow();

    return this.signer.executeMoveCall({
      packageObjectId: packageObjId,
      module: module,
      typeArguments: typeArguments,
      function: funName,
      arguments: funArguments,
      gasBudget,
    });
  }
}

export { SuiService, SuiServiceInterface };
