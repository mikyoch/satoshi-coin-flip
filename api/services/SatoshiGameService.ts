// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiService, SuiServiceInterface } from "./SuiService";
class SatoshiGameService {
  private suiService: SuiServiceInterface;
  private gameIdMap: Map<
    String,
    {
      date_created: String;
      game_ended: boolean;
      player_won: boolean | null;
      date_ended: String | null;
    }
  > = new Map<
    String,
    {
      date_created: String;
      game_ended: boolean;
      player_won: boolean | null;
      date_ended: String | null;
    }
  >();

  constructor() {
    this.suiService = new SuiService();
  }

  public getGames() {
    let games: Object[] = [];
    for (let key of this.gameIdMap.keys()) {
      games.push({ gameId: key, details: this.gameIdMap.get(key) });
    }
    return games;
  }

  public registerGame(gameId: string) {
    try {
      this.gameIdMap.set(gameId, {
        date_created: new Date().toUTCString(),
        game_ended: false,
        player_won: null,
        date_ended: null,
      });
      return true;
    } catch (e) {
      console.error("Encountered error while registering game", e);
      return false;
    }
  }

  // end-game for single player satoshi
  public endGameSinglePlayer(
    gameId: string,
    blsSig: Uint8Array
  ): Promise<{ playerWon: boolean; transactionDigest: string }> {
    return new Promise((resolve, reject) => {
      // Limiting the use of endGame call to only gameIds created within the scope of the application
      if (!this.gameIdMap.has(gameId)) {
        reject("Given gameId does not exist");
        return;
      }
      // const secret: string = String(this.gameIdSecretMap.get(gameId));

      this.suiService
        .executeMoveCall(
          String(process.env.PACKAGE_ADDRESS),
          "single_player_satoshi",
          [],
          "play",
          [gameId, Array.from(blsSig), String(process.env.HOUSE_DATA)]
        )
        .then(async (res: any) => {
          const effects = res?.EffectsCert
            ? res?.EffectsCert?.effects?.effects
            : res?.effects;

          const status = effects?.status?.status;
          const newObjEvents = effects.events.filter((el: any) => el.newObject);
          const transactionDigest = effects?.transactionDigest;

          const outcomeObjId = newObjEvents?.[0]?.newObject?.objectId;

          const outcomeObj: any = await this.suiService.getObject(outcomeObjId);

          if (status === "success") {
            this.gameIdMap.set(gameId, {
              game_ended: true,
              player_won: outcomeObj?.details?.data?.fields?.player_won,
              date_ended: new Date().toUTCString(),
              date_created: this.gameIdMap.get(gameId)?.date_created || "N/A",
            });
            resolve({
              playerWon: outcomeObj?.details?.data?.fields?.player_won,
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
