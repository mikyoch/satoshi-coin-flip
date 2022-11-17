import { SuiService, SuiServiceInterface } from "./SuiService";
import { SuiExecuteTransactionResponse } from "@mysten/sui.js";

class SatoshiGameService {
  private suiService: SuiServiceInterface;

  constructor() {
    this.suiService = new SuiService();
  }

  public createGame(hash: string, minBet: number = 100, maxBet: number = 5000) {
    return new Promise(async (resolve, reject) => {
      try {
        // @todo: check bet values here?
        const coinId = await this.suiService.getLargestBankCoinId();
        this.suiService
          .executeMoveCall(
            String(process.env.PACKAGE_ADDRESS),
            "satoshi_flip",
            [],
            "start_game",
            [Array.from(hash), coinId, maxBet, minBet]
          )
          .then((res) => {
            const effects = res?.EffectsCert
              ? res?.EffectsCert?.effects?.effects
              : res?.effects;

            const status = effects?.status?.status;
            if (status === "success") {
              let newGameResult =
                effects?.events?.find((x) => x.newObject) || {};
              resolve(newGameResult.newObject.objectId);
            } else {
              reject({
                status: "failure",
                details: "Could not read effects",
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
}

export default SatoshiGameService;
