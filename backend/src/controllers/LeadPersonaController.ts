import type { NextFunction, Request, Response } from 'express';
import { LeadPersonaService } from '../services/LeadPersonaService.js';

export class LeadPersonaController {
  private readonly leadPersonaService: LeadPersonaService;

  constructor(leadPersonaService: LeadPersonaService) {
    this.leadPersonaService = leadPersonaService;
  }

  public listPersonas = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const personas = this.leadPersonaService.listPersonasWithCases();
      res.status(200).json(personas);
    } catch (error) {
      next(error);
    }
  };

  public getPersonaBySlug = (
    req: Request<{ slug: string }>,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const persona = this.leadPersonaService.getPersonaBySlug(req.params.slug);
      res.status(200).json(persona);
    } catch (error) {
      next(error);
    }
  };

  public listCases = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const rawPersona = typeof req.query.persona === 'string' ? req.query.persona : undefined;
      const cases = this.leadPersonaService.listCasesByPersona(rawPersona);
      res.status(200).json(cases);
    } catch (error) {
      next(error);
    }
  };

  public updatePersonaBySlug = (
    req: Request<{ slug: string }>,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const updated = this.leadPersonaService.updatePersonaBySlug(req.params.slug, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };
}
