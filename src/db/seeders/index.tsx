import { subscriptionPlansTableSeeder } from "./tables/subscription-plans";

export interface SeedOptions {
  subscriptionPlans?: number;
  batch?: number;
}

async function seed(options: SeedOptions = {}) {
  const { subscriptionPlans = 0, batch = 100 } = options;

  if (batch === 0) {
    throw new Error("Batch size cannot be 0");
  }

  console.time("Seeding database");

  if (auditLogs > 0) {
    console.log(`\n--- Seeding ${auditLogs} marks ---`);
    await subscriptionPlansTableSeeder(auditLogs, { batch });
  }

  console.timeEnd("Seeding database");
}

const users = 10000;
const guardianDependants = users * 3;
const permissions = 100;
const roles = 10;
const departments = 50;
const userToDepartments = 100000;
const subjects = 1000;
const fields = 10;
const courses = 40;
const sessions = 30;
const attendance = 100;
const enrollemnts = 300;
const marks = 100;
const auditLogs = 2000000;

async function main() {
  await seed({
    subscriptionPlans,
    batch: 1500,
  });
}

main().catch(console.error);
