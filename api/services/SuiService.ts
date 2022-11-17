import {
  Ed25519Keypair,
  JsonRpcProvider,
  Network,
  RawSigner,
  SuiExecuteTransactionResponse,
  SuiJsonValue,
} from "@mysten/sui.js";

interface SuiServiceInterface {
  getSigner(): RawSigner;
  getLargestBankCoinId(): Promise<any>;
  executeMoveCall(
    packageObjId: string,
    module: string,
    typeArguments: [],
    funName: string,
    funArguments: SuiJsonValue[],
    gasBudget?: number
  ): Promise<SuiExecuteTransactionResponse>;
}

class SuiService implements SuiServiceInterface {
  private provider: JsonRpcProvider;
  private signer: RawSigner;
  private bankCoins: { id: any; balance: any }[] = [];

  constructor() {
    // @todo: parameterized initialization here?
    this.provider = new JsonRpcProvider(Network.DEVNET);
    this.signer = this.getSigner();
  }

  private setSigner() {
    let privKeyArray: number[] = JSON.parse(String(process.env.PRIVATE_KEY));

    const keypair = Ed25519Keypair.fromSeed(Uint8Array.from(privKeyArray));
    const signer = new RawSigner(keypair, this.provider);
    this.signer = signer;
  }

  private setBankCoins(): Promise<{ id: any; balance: any }[]> {
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
              this.bankCoins = coins;
              resolve(coins);
            });
        })
        .catch((e) => {
          console.error("Bank Coins error: ", e);
          reject(e);
        });
    });
  }

  public getSigner(): RawSigner {
    if (!this.signer) {
      this.setSigner();
    }
    return this.signer;
  }

  public getLargestBankCoinId(): Promise<string> {
    return new Promise((resolve, reject) => {
      let coinId: string = "";
      let balance = 0;
      try {
        this.setBankCoins().then(() => {
          for (let coin of this.bankCoins) {
            if (coin.balance >= balance) {
              coinId = coin.id;
              balance = coin.balance;
            }
          }

          resolve(coinId);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public async executeMoveCall(
    packageObjId: string,
    module: string,
    typeArguments: [],
    funName: string,
    funArguments: SuiJsonValue[],
    gasBudget: number = 1000
  ): Promise<SuiExecuteTransactionResponse> {
    this.signer = this.getSigner();
    return this.signer?.executeMoveCall({
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
