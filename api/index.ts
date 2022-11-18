import express, { Express } from "express";
import { notFound, errorHandler } from "./middleware";
import * as dotenv from "dotenv";
dotenv.config();

import startRoutes from "./routes/Start";
import endRoutes from "./routes/End";
import gameRoutes from "./routes/Game";

const app: Express = express();
const port = process.env.PORT;

app.use(
  express.urlencoded({
    extended: true,
  })
);

// we can use json requests if we prefer
// app.use(express.json({}));

app.use(startRoutes);

app.use(endRoutes);

app.use(gameRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
