import { app } from "./app.js";
import { initializeDatabase, closeDatabase } from "./db/database.js";
import { seedDatabase } from "./db/seed.js";
import { initRealtime } from "./realtime/socket.js";

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

const start = async () => {
  try {
    await initializeDatabase();
    await seedDatabase();
    await app.listen({ port, host });
    initRealtime(app.server);
    app.log.info(`Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDatabase();
  process.exit(0);
});

start();