import type { NextFunction, Request, Response } from 'express';
import { FirmProfileService } from '../services/FirmProfileService.js';

export class FirmProfileController {
  private readonly firmProfileService: FirmProfileService;

  constructor(firmProfileService: FirmProfileService) {
    this.firmProfileService = firmProfileService;
  }

  public getProfile = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const profile = this.firmProfileService.getProfile();
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const updated = this.firmProfileService.updateProfile(req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };
}
