import { faker } from "@faker-js/faker";
import db from "@/db";
import { plans } from "@/db/schema";

interface RoleSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function subscriptionPlansTableSeeder(
  batch: number = 100,
  options: RoleSeederOptions = {}
) {
  await db.delete(plans);

  // We'll seed all the roles defined in the userRole enum
  const subscriptionValues = Object.values([
    "Basic",
    "Premium",
    "Enterprise",
    "Ultimate",
  ]);
  console.log(`Seeding ${subscriptionValues.length} roles...`);

  const planData = subscriptionValues.map((plan) => {
    const date = faker.date.past();
    return {
      name: plan,
      priceMonthly: faker.number.int({ min: 100, max: 1000 }),
      priceYearly: faker.number.int({ min: 10000, max: 100000 }),
      features: JSON.stringify({
        isActive: true,
        isTrial: false,
        trialDays: faker.number.int({ min: 0, max: 30 }),
      }),
      createdAt: date,
    };
  });

  await db.insert(plans).values(planData);

  console.log(`Successfully seeded ${planData.length} roles.`);

  // Return the created roles for reference in other seeders
  return await db.select().from(plans);
}
