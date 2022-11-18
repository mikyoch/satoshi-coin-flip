import express, { Router, Request, Response } from "express";
import { checkStart } from "../middleware";
import services from "../services/";

const GameService = services.SatoshiGameService;

const router: Router = express.Router();

router.post("/start", checkStart, async (req: Request, res: Response) => {
    console.log("body:", req.body);
  
    try {
      let gameId = await GameService.createGame(req.body.minBet, req.body.maxBet);
      res.status(200);
      res.json({
        gameId,
      });
    } catch (e) {
      console.error("Bad things have happened:", e);
      res.status(500);
      res.json({
        error: e,
      });
    }
  });

export default router;