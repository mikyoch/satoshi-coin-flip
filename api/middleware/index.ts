import { NextFunction, Request, Response } from "express";

// @todo: define in a const files specific error codes
const errorCode = 400;

// handles errors related to non existing endpoints
function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error("Not Found: " + req.originalUrl);
  next(error);
}

// handles generic errors that can happen during execution of the services
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(res.statusCode || 500).send({ error: err });
  console.error("Error Handler:", err);
  // next(err);
}

// used as parameter checking in the /start endpint
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

// used as parameter checking in the /end endpint
function checkEnd(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.body?.gameId) throw new Error('Parameter "gameId" is required');
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

export { notFound, errorHandler, checkStart, checkEnd };
