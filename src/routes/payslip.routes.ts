import { Hono } from "hono";
import { tenantMiddleware } from "../middlewares/tenant.middleware";
import { db } from "../db/client";
import { and, eq } from "drizzle-orm";

const app = new Hono();

app.use("*", tenantMiddleware);

type TenantContext = {
  tables: {
    payslips: ReturnType<
      typeof import("../schemas/tenant").getTenantSchema
    >["tables"]["payslips"];
    employees: ReturnType<
      typeof import("../schemas/tenant").getTenantSchema
    >["tables"]["employees"];
  };
};

app.get("/", async (c) => {
  const { tables } = c.get("tenant") as TenantContext;

  const result = await db
    .select()
    .from(tables.payslips)
    .leftJoin(
      tables.employees,
      eq(tables.payslips.employeeId, tables.employees.id)
    );

  return c.json(result);
});

app.post("/", async (c) => {
  const { tables } = c.get("tenant") as TenantContext;
  const data = await c.req.json();

  const [newPayslip] = await db
    .insert(tables.payslips)
    .values(data)
    .returning();

  return c.json(newPayslip, 201);
});

export default app;
