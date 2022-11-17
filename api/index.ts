import express, { Express, Request, Response } from "express";
import { notFound, errorHandler, checkStart, checkEnd } from "./middleware";
import * as dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(
  express.urlencoded({
    extended: true,
  })
);

// we can use json requests if we prefer
// app.use(express.json({}));

app.post("/start", checkStart, (req: Request, res: Response) => {
  try {
    console.log("body:", req.body);
    res.status(200);
    res.json({
      gameId: "thisIsAnID",
    });
  } catch (e) {
    console.error("Bad things have happened", e);
  }
});

app.post("/end", checkEnd, (req: Request, res: Response) => {
  console.log("body:", req.body);
  res.status(200);
  res.json({
    playerWon: true,
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Satoshi API saying hello :)");
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
