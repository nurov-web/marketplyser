import { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : "Хатои дохилӣ";
  res.status(500).json({ message });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Маршрут ёфт нашуд" });
}
