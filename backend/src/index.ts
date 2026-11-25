import { createApp } from './app.js';
import { closeDatabase } from './db/database.js';

export const PORT = Number(process.env.PORT ?? 3002);

export function startServer(port: number = PORT) {
  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`[advocacia-autoseller] API listening on http://localhost:${port}`);
  });

  const shutdown = () => {
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

startServer();
