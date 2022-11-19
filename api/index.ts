import express, { Express } from "express";
import { notFound, errorHandler } from "./middleware";
import * as dotenv from "dotenv";
dotenv.config();

import gameRoutes from "./routes/Game";

// Initializing port and express instance
const app: Express = express();
const port = process.env.PORT;

// Accepted body of requests in x-www-form-urlencoded 
app.use(
  express.urlencoded({
    extended: true,
  })
);

// we can use json requests if we prefer
// app.use(express.json({}));

// --------- Routes "/game" --------- 
app.use("/game", gameRoutes);

// --------- Error handling middleware ---------
app.use(notFound);
app.use(errorHandler);

// --------- Starts the API ---------
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
