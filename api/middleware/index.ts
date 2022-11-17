import { NextFunction, Request, Response } from "express";

// @todo: define in a const files specific error codes
const errorCode = 500;

function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error("Not Found: " + req.originalUrl);
  next(error);
}

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(res.statusCode || 500).send({ error: err.message });
  console.error("Error Handler:", err.message);
  // next(err);
}

function checkStart(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.body?.minBet) throw new Error('Parameter "minBet" is required');
    if (!req?.body?.maxBet) throw new Error('Parameter "maxBet" is required');
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

function checkEnd(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.body?.gameId) throw new Error('Parameter "gameId" is required');
    if (!req?.body?.secret) throw new Error('Parameter "secret" is required');
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

export { notFound, errorHandler, checkStart, checkEnd };
