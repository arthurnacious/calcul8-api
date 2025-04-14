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

    await createHrmTablesForTenantSchema(schemaName);

    console.log(`Created schema and tables for tenant ${tenant.id}`);
  }
}

export async function createHrmTablesForTenantSchema(schemaName: string) {
  await db.execute(sql`
    CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schemaName)}
  `);

  await db.transaction(async (tx) => {
    // Departments
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS ${qualified(schemaName, "departments")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Job Titles
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS ${qualified(schemaName, "job_titles")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(100) NOT NULL,
        department_id UUID REFERENCES ${qualified(
          schemaName,
          "departments"
        )}(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Employees
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS ${qualified(schemaName, "employees")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        public_user_id UUID NOT NULL REFERENCES public.users(id),
        employee_number VARCHAR(50) UNIQUE,
        hire_date DATE NOT NULL,
        department VARCHAR(100),
        job_title_id UUID REFERENCES ${qualified(schemaName, "job_titles")}(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Payslips
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

    // Leave Requests
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS ${qualified(schemaName, "leave_requests")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID NOT NULL REFERENCES ${qualified(
          schemaName,
          "employees"
        )}(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Attendances
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS ${qualified(schemaName, "attendances")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID NOT NULL REFERENCES ${qualified(
          schemaName,
          "employees"
        )}(id),
        clock_in TIMESTAMP,
        clock_out TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  });
}
