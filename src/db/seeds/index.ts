import { createTenantSchemas } from "./table/tenant-schemas.seeder";
import { tenantsSeeder } from "./table/tenant-seeder";
import { usersSeeder } from "./table/users-seeder";

export interface SeedOptions {
  users?: number;
  tenants?: number;
  batch?: number;
}

async function seed(options: SeedOptions = {}) {
  const { users = 0, tenants = 0, batch = 100 } = options;

  if (batch === 0) {
    throw new Error("Batch size cannot be 0");
  }

  console.time("Seeding database");

  if (users > 0) {
    console.log(`\n--- Seeding ${users} users ---`);
    await usersSeeder(users, { batch });
  }

  if (tenants > 0) {
    console.log(`\n--- Seeding ${tenants} users ---`);
    await tenantsSeeder(tenants, { batch, assignToUsers: true });
  }

  await createTenantSchemas();
  console.timeEnd("Seeding database");
}

async function main() {
  await seed({
    users: 2,
    tenants: 50,
    batch: 1500,
  });
}

main().catch(console.error);
