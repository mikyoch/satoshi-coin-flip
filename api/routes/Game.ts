import express, { Router, Request, Response } from "express";
import services from "../services/";

const GameService = services.SatoshiGameService;

const router: Router = express.Router();
router.get("/games", (req: Request, res: Response) => {
  res.status(200);

  const gameIds = GameService.getGameIds();
  res.json({
    gameIds,
  });
});

router.get("/", (req: Request, res: Response) => {
  res.send("Satoshi API saying hello :)");
});

export default router;
