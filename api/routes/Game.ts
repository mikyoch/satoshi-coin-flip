import express, { Router, Request, Response } from "express";
import { checkEnd, checkStart } from "../middleware";
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

router.post("/start", checkStart, async (req: Request, res: Response) => {
  console.log("body:", req.body);

  try {
    let gameId = await GameService.createGame(req.body.minBet, req.body.maxBet);
    res.status(200);
    res.json({
      gameId,
    });
  } catch (e) {
    console.error(
      `Bad things have happened while calling /game/start with minBet ${req.body.minBet} and maxBet ${req.body.maxBet} :`,
      e
    );
    res.status(500);
    res.json({
      error: e,
    });
  }
});

router.post("/end", checkEnd, async (req: Request, res: Response) => {
  console.log("body:", req.body);

  try {
    let response = await GameService.endGame(req.body.gameId);
    res.status(200);
    res.json({
      playerWon: response,
    });
  } catch (e) {
    console.error(
      `Bad things have happened while calling /game/end with id "${req.body.gameId}":`,
      e
    );
    res.status(500);
    res.json({
      error: e,
    });
  }
});

export default router;
