import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Маълумот нодуруст аст",
        errors: parsed.error.flatten(),
      });
    }
    req[source] = parsed.data;
    next();
  };
}
