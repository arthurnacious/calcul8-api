import type { Context } from "hono";

type Variables = {
  tenantId: string;
};

export type TenantContext = Context<{ Variables: Variables }>;
