import { usersSeeder } from "./table/users-seeder";

export interface SeedOptions {
  users?: number;
  batch?: number;
}

async function seed(options: SeedOptions = {}) {
  const { users = 0, batch = 100 } = options;

  if (batch === 0) {
    throw new Error("Batch size cannot be 0");
  }

  console.time("Seeding database");

  if (users > 0) {
    console.log(`\n--- Seeding ${users} users ---`);
    await usersSeeder(users, { batch });
  }

  console.timeEnd("Seeding database");
}

const users = 10000;

async function main() {
  await seed({
    users,
    batch: 1500,
  });
}

main().catch(console.error);
