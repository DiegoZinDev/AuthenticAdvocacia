import type { NextFunction, Request, Response } from 'express';
import { VisitorSessionService } from '../services/VisitorSessionService.js';

export class VisitorSessionController {
  private readonly visitorSessionService: VisitorSessionService;

  constructor(visitorSessionService: VisitorSessionService) {
    this.visitorSessionService = visitorSessionService;
  }

  public upsertSession = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const session = this.visitorSessionService.upsertSession(req.body);
      res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  };

  public getSessionById = (
    req: Request<{ sessionId: string }>,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const session = this.visitorSessionService.getSessionById(req.params.sessionId);
      res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  };
}
