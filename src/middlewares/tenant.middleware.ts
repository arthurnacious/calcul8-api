import { Context } from "hono";
import { getTenantSchema } from "../schemas/tenant";
import { TenantTables } from "../types/tenant";

export async function tenantMiddleware(c: Context, next: () => Promise<void>) {
  const tenantId = c.req.header("x-tenant-id");
  if (!tenantId) throw new Error("Tenant ID required");

  const { tables } = getTenantSchema(tenantId);
  c.set("tenant", { tables } as { tables: TenantTables });

  await next();
}
