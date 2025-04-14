import { Context } from "hono";
import { getTenantSchema } from "../schemas/tenant";
import { TenantContext, TenantTables } from "../types/tenant";

declare module "hono" {
  interface ContextVariableMap {
    tenant: TenantContext; // Global type for c.get/c.set
  }
}

export async function tenantMiddleware(c: Context, next: () => Promise<void>) {
  const tenantId = c.req.header("x-tenant-id");
  if (!tenantId) throw new Error("Tenant ID required");

  const { tables } = getTenantSchema(tenantId);
  c.set("tenant", { tables } satisfies TenantContext);

  await next();
}
