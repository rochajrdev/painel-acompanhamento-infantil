import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ChildRecord } from "../types/child.types.js";
import { childrenRepository } from "../repositories/children.repository.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedPath = path.resolve(__dirname, "../../../data/seed.json");

export async function loadSeedData(): Promise<ChildRecord[]> {
  const content = await fs.readFile(seedPath, "utf8");
  return JSON.parse(content) as ChildRecord[];
}

export async function seedDatabase(): Promise<void> {
  const totalChildren = await childrenRepository.count();

  if (totalChildren > 0) {
    return;
  }

  const children = await loadSeedData();
  await childrenRepository.upsertMany(children);
}

const isDirectRun = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;

if (isDirectRun) {
  seedDatabase()
    .then(() => {
      console.log("Seed concluído");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}