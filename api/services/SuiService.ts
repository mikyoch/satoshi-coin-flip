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
  getLargestBankCoin(): Promise<any>;
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

  public async getLargestBankCoin(): Promise<{ id: string; balance: number }> {
    // this function is no longer called from the GameService so there is no need
    // to perform a check here. Check has been transfered to getPlayCoin function
    // const didFund = await this.fundBankAddressIfGasLow();
    // if (didFund) console.log("Banker account funded successfully");

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

  private async splitCoins(
    coinObjectId: string,
    recipient: string,
    splitObjects: number,
    splitValue: number
  ) {
    const recipients: string[] = Array(splitObjects).fill(recipient);
    const splitAmounts: number[] = Array(splitObjects).fill(splitValue);

    return this.signer.paySui({
      inputCoins: [coinObjectId],
      recipients,
      amounts: splitAmounts,
      gasBudget: 100000,
    });
  }

  public async getPlayCoin(playValue: number = 5000): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let foundPlayCoinId: string = "";
      try {
        const didFund = await this.fundBankAddressIfGasLow();
        if (didFund) console.log("Banker account funded successfully");

        const coins = await this.getBankCoins();
        let foundPlayCoin = coins.find((coin) => coin.balance === playValue);
        if (foundPlayCoin) return resolve(foundPlayCoin.id);

        // Finding the largest coin to use as gas
        const gasCoin = await this.getLargestBankCoin();

        // Checking how many coins of playValue balance can be created
        let maxSplit = Math.floor(gasCoin.balance / playValue);
        // If we can create equal or more than 20 then we attempt to create 20
        // @todo: this is a bit abstract
        // @todo: maybe fund call should be used here instead of using it at the begining of the function
        let finalSplit = 0;
        if (maxSplit >= 20) finalSplit = 20;
        // @todo: maybe we should pass here coins that have balance lower than a threshold. That threshold could be playValue
        // this resolves the issue of only having unsuable coins that have a balance that is lower than the threshold
        this.splitCoins(
          gasCoin.id,
          String(process.env.BANKER_ADDRESS),
          finalSplit,
          playValue
        );

        // Get the updated coin objects and look for the first coin you find that has a value of playValue
        this.getBankCoins().then((bankCoins) => {
          foundPlayCoinId = bankCoins.find(
            (coin) => coin.balance === playValue
          )?.id;

          resolve(foundPlayCoinId);
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
