import { SuiService, SuiServiceInterface } from "./SuiService";
import SHA3 from "sha3";
import { GetObjectDataResponse } from "@mysten/sui.js";

class SatoshiGameService {
  private suiService: SuiServiceInterface;
  private secret: string = "";

  constructor() {
    this.suiService = new SuiService();
  }

  private getNewSecretAndHash() {
    const secret = String(Math.floor(Math.random() * 10000000));
    const h = new SHA3(256);
    h.update(secret);
    const hash = h.digest();
    return { secret: secret, hash: Array.from(hash) };
  }

  public createGame(
    minBet: number = 100,
    maxBet: number = 5000
  ): Promise<{ gameId: string; secret: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        // @todo: check bet values here?
        const coinId = await this.suiService.getLargestBankCoinId();
        const { secret, hash } = this.getNewSecretAndHash();
        this.secret = secret;

        this.suiService
          .executeMoveCall(
            String(process.env.PACKAGE_ADDRESS),
            "satoshi_flip",
            [],
            "start_game",
            [Array.from(hash), coinId, maxBet, minBet]
          )
          .then((res: any) => {
            // added any here because I don't understand what problem it has with the type
            const effects = res?.EffectsCert
              ? res?.EffectsCert?.effects?.effects
              : res?.effects;

            const status = effects?.status?.status;
            if (status === "success") {
              let newGameResult =
                effects?.events?.find((x: any) => x.newObject) || {};
              resolve({ gameId: newGameResult.newObject.objectId, secret });
            } else {
              reject({
                status: "failure",
                effects,
              });
            }
          });
      } catch (e) {
        console.error("Could not create game: ", e);
        reject(e);
      }
    });
  }

  // end-game
  public endGame(gameId: string, secret: string) {
    return new Promise((resolve, reject) => {
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

          const outcomeObjId = effects?.sharedObjects?.[0]?.objectId;
          console.log("shared object id", outcomeObjId);

          const outcomeObj: any = await this.suiService
            .getSigner()
            .provider.getObject(outcomeObjId);

          if (status === "success") {
            resolve(
              outcomeObj.details?.data?.fields?.outcome?.fields?.player_won
            );
          } else {
            reject({
              status: "failure",
              effects,
            });
          }
        });
    });
  }
}

export default SatoshiGameService;
