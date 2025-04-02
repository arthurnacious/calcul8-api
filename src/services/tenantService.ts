import { hash } from "@/utils/auth";
import db from "../db";
import { eq, sql } from "drizzle-orm";
import { plans, subscriptions, tenants, tenantUsers, users } from "@/db/schema";

export async function generateTenant(
  tenantName: string,
  adminEmail: string,
  adminName: string,
  adminPassword: string
) {
  return await db.transaction(async (tx) => {
    const tenantId = crypto.randomUUID();
    const schemaName = `calcul8_${tenantId}`;

    const [newTenant] = await db
      .insert(tenants)
      .values({
        name: tenantName,
        schema: schemaName,
        status: "active",
      })
      .returning();

    const hashedPassword = hash(adminPassword);
    let [user] = await tx
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (!user) {
      [user] = await tx
        .insert(users)
        .values({
          email: adminEmail,
          name: adminName,
          hashedPassword,
        })
        .returning();
    }

    await tx.insert(tenantUsers).values({
      userId: user.id,
      tenantId: newTenant.id,
      role: "admin",
    });

    const [plan] = await tx
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.name, "Basic")); ///or whatever that was selected

    await tx.insert(subscriptions).values({
      planId: plan.id,
      startDate: new Date(),
      endDate: new Date(),
      status: "active",
      tenantId: newTenant.id,
    });

    // Create tenant schema
    await db.execute(sql`CREATE SCHEMA ${sql.identifier(schemaName)}`);

    return {
      tenant: newTenant,
      schema: schemaName,
      user: user,
    };
  });
}
