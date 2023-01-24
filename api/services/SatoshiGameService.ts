// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiService, SuiServiceInterface } from "./SuiService";
import SHA3 from "sha3";

class SatoshiGameService {
  private suiService: SuiServiceInterface;
  private gameIdSecretMap: Map<String, String> = new Map<String, String>();
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

  public getGameIds() {
    let gameIds: String[] = [];
    for (let key of this.gameIdSecretMap.keys()) {
      gameIds.push(key);
    }

    return gameIds;
  }

  public getGames() {
    let games: Object[] = [];
    for (let key of this.gameIdMap.keys()) {
      games.push({ gameId: key, details: this.gameIdMap.get(key) });
    }
    return games;
  }

  private getNewSecretAndHash() {
    const secret = String(Math.floor(Math.random() * 10000000));
    const h = new SHA3(256);
    h.update(secret);
    const hash = h.digest();
    return {
      secret: secret,
      hash: Array.from(hash),
      hexSecret: (+secret).toString(16),
      buffer: Array.from((+secret).toString(16)),
    };
  }

  public createGame(
    minAmount: number = 100,
    maxAmount: number = 5000
  ): Promise<{ gameId: string; transactionDigest: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        // @todo: check min and max values here?
        const coinId = await this.suiService.getPlayCoin();
        console.log("Play coin", coinId);
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
