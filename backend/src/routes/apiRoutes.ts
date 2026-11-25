import { Router } from 'express';
import { FirmProfileController } from '../controllers/FirmProfileController.js';
import { HealthController } from '../controllers/HealthController.js';
import { LeadPersonaController } from '../controllers/LeadPersonaController.js';
import { VisitorSessionController } from '../controllers/VisitorSessionController.js';

export interface ApiControllers {
  healthController: HealthController;
  firmProfileController: FirmProfileController;
  leadPersonaController: LeadPersonaController;
  visitorSessionController: VisitorSessionController;
}

export function createApiRouter(controllers: ApiControllers): Router {
  const router = Router();

  router.get('/health', controllers.healthController.getHealth);

  router.get('/profile', controllers.firmProfileController.getProfile);
  router.put('/profile', controllers.firmProfileController.updateProfile);

  router.get('/personas', controllers.leadPersonaController.listPersonas);
  router.get('/personas/:slug', controllers.leadPersonaController.getPersonaBySlug);
  router.put('/personas/:slug', controllers.leadPersonaController.updatePersonaBySlug);
  router.get('/cases', controllers.leadPersonaController.listCases);

  router.post('/telemetry/session', controllers.visitorSessionController.upsertSession);
  router.get('/telemetry/session/:sessionId', controllers.visitorSessionController.getSessionById);

  return router;
}
