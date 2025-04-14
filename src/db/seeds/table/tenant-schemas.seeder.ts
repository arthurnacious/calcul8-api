import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { tenants } from "@/schemas/public";

const qualified = (schema: string, table: string) =>
  sql.raw(`"${schema}"."${table}"`);

export async function createTenantSchemas() {
  // Ensure UUID extension exists
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  const allTenants = await db.select().from(tenants);

  for (const tenant of allTenants) {
    const schemaName = `tenant_${tenant.id}`;

    // 1. Create the tenant schema
    await db.execute(sql`
      CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schemaName)}
    `);

    // 2. Create tables within the tenant schema
    await db.transaction(async (tx) => {
      // Employees table
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS ${qualified(schemaName, "employees")} (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          public_user_id UUID NOT NULL REFERENCES public.users(id),
          employee_number VARCHAR(50) UNIQUE,
          hire_date DATE NOT NULL,
          department VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Payslips table
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS ${qualified(schemaName, "payslips")} (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          employee_id UUID NOT NULL REFERENCES ${qualified(
            schemaName,
            "employees"
          )}(id),
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          gross_pay DECIMAL(10,2) NOT NULL,
          net_pay DECIMAL(10,2) NOT NULL
        )
      `);
    });

    console.log(`Created schema and tables for tenant ${tenant.id}`);
  }
}
