import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";

const validate = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema instanceof ZodEffects) {
        schema.parse(req.body);
      } else {
        schema.parse(req.body);
      }
      next();
    } catch (error) {
      res.status(400).send({ message: error });
    }
  };
};

export { validate };
