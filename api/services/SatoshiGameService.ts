import { SuiService, SuiServiceInterface } from "./SuiService";
import SHA3 from "sha3";

class SatoshiGameService {
  private suiService: SuiServiceInterface;
  private gameIdSecretMap: Map<String, String> = new Map<String, String>();

  constructor() {
    this.suiService = new SuiService();
  }

  public getGameIds() {
    let gameIds: String[] = [];
    for (let key of this.gameIdSecretMap.keys()) {
      gameIds.push(key);
    }

    return gameIds;
  }

  private getNewSecretAndHash() {
    const secret = String(Math.floor(Math.random() * 10000000));
    const h = new SHA3(256);
    h.update(secret);
    const hash = h.digest();
    return { secret: secret, hash: Array.from(hash) };
  }

  public createGame(
    minAmount: number = 100,
    maxAmount: number = 5000
  ): Promise<{ gameId: string; transactionDigest: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        // @todo: check guess values here?
        // const coinId = await this.suiService.getLargestBankCoin().id;
        const coinId = await this.suiService.getPlayCoin();
        const { secret, hash } = this.getNewSecretAndHash();

        this.suiService
          .executeMoveCall(
            String(process.env.PACKAGE_ADDRESS),
            "satoshi_flip",
            [],
            "start_game",
            [Array.from(hash), coinId, minAmount, maxAmount]
          )
          .then((res: any) => {
            // added any here because I don't understand what problem it has with the type
            const effects = res?.EffectsCert
              ? res?.EffectsCert?.effects?.effects
              : res?.effects;

            const status = effects?.status?.status;
            const transactionDigest = effects?.transactionDigest;
            if (status === "success") {
              let newGameResult =
                effects?.events?.find((x: any) => x.newObject) || {};

              const gameId = newGameResult.newObject.objectId;

              this.gameIdSecretMap.set(gameId, secret);
              resolve({ gameId, transactionDigest });
            } else {
              reject({
                status: "failure",
                effects,
              });
            }
          })
          .catch((e) => {
            reject({
              status: "failure",
              message: e.message || "Transaction failed",
            });
          });
      } catch (e) {
        console.error("Could not create game: ", e);
        reject(e);
      }
    });
  }

  // end-game
  public endGame(
    gameId: string
  ): Promise<{ playerWon: boolean; transactionDigest: string }> {
    return new Promise((resolve, reject) => {
      if (!this.gameIdSecretMap.has(gameId)) {
        reject("Given gameId does not exist");
        return;
      }
      const secret: string = String(this.gameIdSecretMap.get(gameId));

      this.suiService
        .executeMoveCall(
          String(process.env.PACKAGE_ADDRESS),
          "satoshi_flip",
          [],
          "end_game",
          [gameId, secret]
        )
        .then(async (res: any) => {
          const effects = res?.EffectsCert
            ? res?.EffectsCert?.effects?.effects
            : res?.effects;

          const status = effects?.status?.status;
          const transactionDigest = effects?.transactionDigest;

          const outcomeObjId = effects?.sharedObjects?.[0]?.objectId;

          const outcomeObj: any = await this.suiService.getObject(outcomeObjId);

          if (status === "success") {
            resolve({
              playerWon:
                outcomeObj.details?.data?.fields?.outcome?.fields?.player_won,
              transactionDigest,
            });
          } else {
            reject({
              status: "failure",
              effects,
            });
          }
        })
        .catch((e) => {
          reject({
            status: "failure",
            message: e.message || "Transaction failed",
          });
        });
    });
  }
}

export default SatoshiGameService;
