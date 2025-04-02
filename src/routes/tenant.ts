import db from "@/db";
import { tenants, tenantUsers, users } from "@/db/schema";
import {
  createTenantWithAdmin,
  generateTenant,
} from "@/services/tenantService";
import { hash } from "@/utils/auth";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";

const tenant = new Hono();

tenant.post(
  "/",
  validator("json", (value, c) => {
    if (!value.tenantName) return c.text("Tenant name is required", 400);
    if (!value.adminEmail) return c.text("Admin email is required", 400);
    if (!value.adminName) return c.text("Admin name is required", 400);
    if (!value.adminPassword) return c.text("Admin password is required", 400);
    return value;
  }),
  async (c) => {
    const { tenantName, adminEmail, adminName, adminPassword } =
      await c.req.json();

    try {
      const data = await generateTenant(
        tenantName,
        adminEmail,
        adminName,
        adminPassword
      );

      return c.json({ data }, 201);
    } catch (error) {
      console.error("Tenant creation failed:", error);
      return c.json(
        {
          success: false,
          error: "Tenant creation failed",
        },
        500
      );
    }
  }
);

export default tenant;
