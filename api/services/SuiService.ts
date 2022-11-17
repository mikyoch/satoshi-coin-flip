import {
  Ed25519Keypair,
  JsonRpcProvider,
  Network,
  RawSigner,
  SuiExecuteTransactionResponse,
  SuiJsonValue,
} from "@mysten/sui.js";
import { fromB64 } from "@mysten/bcs";

interface SuiServiceInterface {
  getSigner(): RawSigner | null;
  getLargestBankCoinId(): Promise<any>;
  executeMoveCall(
    packageObjId: string,
    module: string,
    typeArguments: [],
    funName: string,
    funArguments: SuiJsonValue[],
    gasBudget?: number
  ): Promise<SuiExecuteTransactionResponse | undefined>;
}

class SuiService implements SuiServiceInterface {
  private provider: JsonRpcProvider;
  private signer: RawSigner | null = null;
  private bankCoins: { id: any; balance: any }[] = [];

  constructor() {
    // @todo: parameterized initialization here?
    this.provider = new JsonRpcProvider(Network.DEVNET);
  }

  private setSigner() {
    const keypair = Ed25519Keypair.fromSeed(
      fromB64(String(process.env.KEY_SEED))
    );
    const signer = new RawSigner(keypair, this.provider);
    this.signer = signer;
  }

  private async setBankCoins() {
    this.provider
      .getObjectsOwnedByAddress(String(process.env.BANKER_ADDRESS))
      .then((res) => {
        let coinObjects = res.filter((x) => x.type.includes("Coin"));
        this.provider
          .getObjectBatch(coinObjects.map((x) => x.objectId))
          .then((res) => {
            const coins = res.map((x) => {
              return {
                id: Object(x?.details)?.data?.fields?.id?.id,
                balance: Object(x?.details)?.data?.fields?.balance,
              };
            });
            this.bankCoins = coins;
            // createGame();
          });
      })
      .catch((e) => {
        // uiStore.setNotification(e.message);
        console.error("Bank Coins error: ", e);
      });
  }

  public getSigner(): RawSigner | null {
    if (!this.signer) {
      this.setSigner();
    }
    return this.signer;
  }

  // @todo: what is the coinId type?
  public async getLargestBankCoinId(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let coinId = null;
      let balance = 0;
      try {
        if (!this.bankCoins) {
          await this.setBankCoins();
        }
        for (let coin of this.bankCoins) {
          if (coin.balance >= balance) {
            coinId = coin.id;
            balance = coin.balance;
          }
        }
      } catch (e) {
        reject(e);
      }

      resolve(coinId);
    });
  }

  public async executeMoveCall(
    packageObjId: string,
    module: string,
    typeArguments: [],
    funName: string,
    funArguments: SuiJsonValue[],
    gasBudget: number = 1000
  ): Promise<SuiExecuteTransactionResponse | undefined> {
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
