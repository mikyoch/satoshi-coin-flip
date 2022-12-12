import express, { Express } from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware";
import * as dotenv from "dotenv";
dotenv.config();

import gameRoutes from "./routes/Game";

// Initializing port and express instance
const app: Express = express();
const port = process.env.PORT;

// Initializing CORS
console.log(`Will try to JSON parse: ${process.env.TRUSTED_ORIGINS}, which is of type: ${typeof process.env.TRUSTED_ORIGINS}`);
const trustedOrigins = JSON.parse(String(process.env.TRUSTED_ORIGINS));
console.log(`trustedOrigins are: ${trustedOrigins}`);

app.use(
  cors(
  //   {
  //   origin: trustedOrigins,
  // }
  )
);

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
