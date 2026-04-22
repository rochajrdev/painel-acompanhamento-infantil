export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3333),
  HOST: process.env.HOST ?? "0.0.0.0",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret",
  SEED_TECHNICIAN_EMAIL:
    process.env.SEED_TECHNICIAN_EMAIL ?? "tecnico@prefeitura.rio",
  SEED_TECHNICIAN_PASSWORD:
    process.env.SEED_TECHNICIAN_PASSWORD ?? "painel@2024",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/painel"
};