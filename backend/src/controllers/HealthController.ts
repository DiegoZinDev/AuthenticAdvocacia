import type { NextFunction, Request, Response } from 'express';

export class HealthController {
  public getHealth = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      res.status(200).json({
        status: 'ok',
        service: 'advocacia-autoseller',
        db: 'node:sqlite',
      });
    } catch (error) {
      next(error);
    }
  };
}
