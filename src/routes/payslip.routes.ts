import { Hono } from "hono";
import { tenantMiddleware } from "../middlewares/tenant.middleware";
import { db } from "../db/client";
import type { TenantContext } from "@/types/tenant";
import { getTenantSchema } from "@/schemas/tenent-schema";

const app = new Hono();

app.use("*", tenantMiddleware);

app
  .get("/", async (c: TenantContext) => {
    const tenantId = c.get("tenantId");
    const { tables } = getTenantSchema(tenantId);

    const data = await db.select().from(tables.payslips);

    return c.json({ data });
  })
  .post("/", async (c: TenantContext) => {
    const tenantId = c.get("tenantId");
    const { tables } = getTenantSchema(tenantId);

    const data = await c.req.json();

    const [newPayslip] = await db
      .insert(tables.payslips)
      .values(data)
      .returning();

    return c.json(newPayslip, 201);
  });

export default app;
