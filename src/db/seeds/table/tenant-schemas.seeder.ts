import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { tenants } from "@/schemas/public";
import { getTenantHRMSchemaSQL } from "@/services/tenant.service";

export async function createTenantSchemas() {
  // Ensure UUID extension exists
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  const allTenants = await db.select().from(tenants);

  for (const tenant of allTenants) {
    await createHrmTablesForTenantSchema(tenant.id);
    console.log(`Created schema and tables for tenant ${tenant.id}`);
  }
}

export async function createHrmTablesForTenantSchema(tenantId: string) {
  const schemaName = `accur8_${tenantId}`;

  await db.execute(sql`
    CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schemaName)}
  `);

  const createStatements = getTenantHRMSchemaSQL(schemaName);

  for (const createSQL of createStatements) {
    await db.execute(createSQL);
  }

  console.log(`HRM schema and tables created for tenant: ${tenantId}`);
}
