import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { FirmProfileController } from './controllers/FirmProfileController.js';
import { HealthController } from './controllers/HealthController.js';
import { LeadPersonaController } from './controllers/LeadPersonaController.js';
import { VisitorSessionController } from './controllers/VisitorSessionController.js';
import { getDatabase } from './db/database.js';
import { runSeed } from './db/seed.js';
import { FirmProfileRepository } from './repositories/FirmProfileRepository.js';
import { LeadPersonaRepository } from './repositories/LeadPersonaRepository.js';
import { SuccessCaseRepository } from './repositories/SuccessCaseRepository.js';
import { VisitorSessionRepository } from './repositories/VisitorSessionRepository.js';
import { createApiRouter } from './routes/apiRoutes.js';
import { AppError } from './services/AppError.js';
import { FirmProfileService } from './services/FirmProfileService.js';
import { LeadPersonaService } from './services/LeadPersonaService.js';
import { VisitorSessionService } from './services/VisitorSessionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Express {
  const db = getDatabase();
  runSeed();

  const firmProfileRepository = new FirmProfileRepository(db);
  const leadPersonaRepository = new LeadPersonaRepository(db);
  const successCaseRepository = new SuccessCaseRepository(db);
  const visitorSessionRepository = new VisitorSessionRepository(db);

  const firmProfileService = new FirmProfileService(firmProfileRepository);
  const leadPersonaService = new LeadPersonaService(leadPersonaRepository, successCaseRepository);
  const visitorSessionService = new VisitorSessionService(
    visitorSessionRepository,
    leadPersonaRepository
  );

  const healthController = new HealthController();
  const firmProfileController = new FirmProfileController(firmProfileService);
  const leadPersonaController = new LeadPersonaController(leadPersonaService);
  const visitorSessionController = new VisitorSessionController(visitorSessionService);

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.use(
    '/api',
    createApiRouter({
      healthController,
      firmProfileController,
      leadPersonaController,
      visitorSessionController,
    })
  );

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Rota da API não encontrada.' });
  });

  const frontendDistDir = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistDir)) {
    app.use(express.static(frontendDistDir));

    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }
      const indexHtmlPath = path.join(frontendDistDir, 'index.html');
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
        return;
      }
      next();
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: err.message,
        ...(err.details ? { details: err.details } : {}),
      });
      return;
    }

    if (
      err instanceof SyntaxError &&
      'status' in err &&
      (err as { status?: number }).status === 400
    ) {
      res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
      return;
    }

    console.error('[api-error]', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  });

  return app;
}
