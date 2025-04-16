import { faker } from "@faker-js/faker";
import { tenants, usersToTenants } from "@/schemas/public";
import { db } from "@/db/client";

interface TenantSeederOptions {
  batch?: number;
  assignToUsers?: boolean; // Optionally link tenants to existing users
}

export async function tenantsSeeder(
  count: number,
  options: TenantSeederOptions = {}
) {
  const { batch = 100, assignToUsers = false } = options;
  await db.delete(tenants);
  await db.delete(usersToTenants);

  console.log(`Seeding ${count} tenants in batches of ${batch}...`);
  const usedSubdomains = new Set<string>();
  function generateUniqueSubdomain(): string {
    let subdomain: string;
    let attempts = 0;

    do {
      subdomain = faker.helpers.slugify(faker.company.name()).toLowerCase();
      attempts++;
      if (attempts > 10)
        throw new Error("Too many attempts to generate unique subdomain");
    } while (usedSubdomains.has(subdomain));

    usedSubdomains.add(subdomain);
    return subdomain;
  }

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);

    const tenantData = Array.from({ length: batchSize }, () => ({
      name: faker.company.name(),
      subdomain: generateUniqueSubdomain(),
      isActive: faker.datatype.boolean(0.8), // 80% chance of being active
      createdAt: faker.date.past({ years: 1 }),
    }));

    console.log(
      `Inserting batch ${i / batch + 1} (${tenantData.length} tenants)...`
    );
    const insertedTenants = await db
      .insert(tenants)
      .values(tenantData)
      .returning();

    // Optionally assign tenants to random users
    if (assignToUsers) {
      const users = await db.query.users.findMany();
      if (users.length > 0) {
        const userTenantData = insertedTenants.flatMap((tenant) => {
          const randomUsers = faker.helpers.arrayElements(
            users,
            faker.number.int({ min: 1, max: 5 }) // 1-5 users per tenant
          );
          return randomUsers.map((user) => ({
            userId: user.id,
            tenantId: tenant.id,
            role: faker.helpers.arrayElement([
              "admin",
              "manager",
              "employee",
            ] as const),
          }));
        });

        await db.insert(usersToTenants).values(userTenantData);
      }
    }
  }

  console.log(`Successfully seeded ${count} tenants.`);
  return await db.query.tenants.findMany();
}
