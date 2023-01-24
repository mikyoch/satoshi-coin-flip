// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import express, { Router, Request, Response, NextFunction } from "express";
import {
  checkEnd,
  checkRegisterGame,
  checkSign,
  checkSinglePlayerEnd,
  checkStart,
  checkVerify,
} from "../middleware";
import services from "../services/";

const GameService = services.SatoshiGameService;

const router: Router = express.Router();
router.get("/objects", (req: Request, res: Response) => {
  res.status(200);

  const gameIds = GameService.getGameIds();
  res.json({
    gameIds,
  });
});

router.post(
  "/start",
  checkStart,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /game/start with body:", req.body);

    try {
      let { gameId, transactionDigest } = await GameService.createGame(
        req.body.minAmount,
        req.body.maxAmount
      );
      res.status(200);
      res.json({
        gameId,
        transactionDigest,
      });
    } catch (e: any) {
      console.error(
        `Bad things have happened while calling /game/start with minAmount ${req.body.minAmount} and maxAmount ${req.body.maxAmount} :`,
        e
      );
      // Forward the error to the error handler
      res.status(500);
      next(e);
    }
  }
);

router.post(
  "/end",
  checkEnd,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /game/end with body:", req.body);

    try {
      let { playerWon, transactionDigest } = await GameService.endGame(
        req.body.gameId
      );
      res.status(200);
      res.json({
        playerWon,
        transactionDigest,
      });
    } catch (e) {
      console.error(
        `Bad things have happened while calling /game/end with id "${req.body.gameId}":`,
        e
      );
      // Forward the error to the error handler
      res.status(500);
      next(e);
    }
  }
);

router.get(
  "/details",
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /game/details with body:", req.body);

    try {
      let games = GameService.getGames();
      res.status(200);
      res.json({
        games,
      });
    } catch (e) {
      console.error(`Bad things have happened while calling /game/details:`, e);
      // Forward the error to the error handler
      res.status(500);
      next(e);
    }
  }
);

router.post(
  "/register",
  checkRegisterGame,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /game/register with body:", req.body);

    try {
      let registered = GameService.registerGame(req.body.gameId);
      res.status(200);
      res.json({
        registered,
      });
    } catch (e) {
      console.error(
        `Bad things have happened while calling /game/register with id "${req.body.gameId}":`,
        e
      );
      // Forward the error to the error handler
      res.status(500);
      next(e);
    }
  }
);

router.post(
  "/single/end",
  checkSinglePlayerEnd,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /game/single/end with body:", req.body);

    try {
      let { playerWon, transactionDigest } =
        await GameService.endGameSinglePlayer(req.body.gameId, req.body.blsSig);
      res.status(200);
      res.json({
        playerWon,
        transactionDigest,
      });
    } catch (e) {
      console.error(
        `Bad things have happened while calling /game/single/end with id "${req.body.gameId}":`,
        e
      );
      // Forward the error to the error handler
      res.status(500);
      next(e);
    }
  }
);

router.post(
  "/sign",
  checkSign,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sig = await services.BlsService.sign(req?.body?.gameId);

      res.status(200);
      res.json({
        blsSig: Array.from(sig),
      });
    } catch (e) {
      console.error(
        `Error creating bls signature for gameId ${req.body.gameId}`,
        e
      );
      res.status(500);
      next(e);
    }
  }
);

router.post(
  "/verify",
  checkVerify,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const valid = await services.BlsService.verify(
        req?.body?.msg,
        JSON.parse(req?.body?.sig)
      );
      res.status(200);
      res.json({
        valid,
      });
    } catch (e) {
      console.error(
        `Error verifying bls signature for msg ${req.body.msg} and sig ${req.body.sig}`,
        e
      );
      res.status(500);
      next(e);
    }
  }
);

export default router;
