import express, { Express, Request, Response } from "express";
import { notFound, errorHandler, checkStart, checkEnd } from "./middleware";
import * as dotenv from "dotenv";
dotenv.config();
import SatoshiGameService from "./services/SatoshiGameService";

const app: Express = express();
const GameService = new SatoshiGameService();
const port = process.env.PORT;

app.use(
  express.urlencoded({
    extended: true,
  })
);

// we can use json requests if we prefer
// app.use(express.json({}));

app.post("/start", checkStart, async (req: Request, res: Response) => {
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

app.post("/end", checkEnd, async (req: Request, res: Response) => {
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

app.get("/games", (req: Request, res: Response) => {
  res.status(200);

  const gameIds = GameService.getGameIds();
  res.json({
    gameIds
  })
});

app.get("/", (req: Request, res: Response) => {
  res.send("Satoshi API saying hello :)");
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
