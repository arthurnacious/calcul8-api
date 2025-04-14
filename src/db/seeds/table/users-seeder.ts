import { faker } from "@faker-js/faker";
import { users } from "@/schemas/public";
import { db } from "@/db/client";
import { hashPassword } from "@/services/auth.service";
interface UserSeederOptions {
  batch?: number;
}

export async function usersSeeder(
  count: number,
  options: UserSeederOptions = {}
) {
  const { batch = 100 } = options;
  await db.delete(users);
  console.log(`Seeding ${count} users in batches of ${batch}...`);

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);

    const userData = Array.from({ length: batchSize }, (_, index) => {
      const uniqueSuffix = `${Date.now()}-${Math.floor(
        Math.random() * 100000
      )}`;
      return {
        name: faker.person.fullName(),
        email: `${faker.internet
          .displayName()
          .toLowerCase()}-${uniqueSuffix}@example.com`,
        emailVerified: Math.random() > 0.3 ? faker.date.past() : null,
        passwordHash: hashPassword("password123"),
        image: Math.random() > 0.5 ? faker.image.avatar() : null,
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${userData.length} users)...`
    );
    await db.insert(users).values(userData);
  }

  console.log(`Successfully seeded ${count} users.`);
  return await db.select().from(users);
}
