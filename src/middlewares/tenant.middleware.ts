import { MiddlewareHandler } from "hono";

export const tenantMiddleware: MiddlewareHandler<{
  Variables: {
    tenantId: string;
  };
}> = async (c, next) => {
  const tenantId = c.req.header("x-tenant-id");
  if (!tenantId) {
    return c.json({ error: "Tenant ID is required" }, 400);
  }

  c.set("tenantId", tenantId);
  await next();
};
