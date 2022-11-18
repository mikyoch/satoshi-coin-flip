import express, { Router, Request, Response } from "express";
import { checkEnd } from "../middleware";
import services from "../services/";

const GameService = services.SatoshiGameService;

const router: Router = express.Router();

router.post("/end", checkEnd, async (req: Request, res: Response) => {
  console.log("body:", req.body);

  try {
    let response = await GameService.endGame(req.body.gameId);
    res.status(200);
    res.json({
      playerWon: response,
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
