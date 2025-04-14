import {
  pgSchema,
  serial,
  varchar,
  date,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./public";

export function getTenantSchema(tenantId: string) {
  const schema = pgSchema(`tenant_${tenantId}`);

  const employees = schema.table("employees", {
    id: serial("id").primaryKey(),
    publicUserId: integer("public_user_id").references(() => users.id),
    employeeNumber: varchar("employee_number", { length: 50 }).unique(),
    hireDate: date("hire_date").notNull(),
    department: varchar("department", { length: 100 }),
    position: varchar("position", { length: 100 }),
  });

  const salaryHistory = schema.table("salary_history", {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id").references(() => employees.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    effectiveDate: date("effective_date").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
  });

  const payslips = schema.table("payslips", {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id").references(() => employees.id),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
    deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
    netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
    paymentDate: date("payment_date"),
  });

  const overtime = schema.table("overtime", {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id").references(() => employees.id),
    date: date("date").notNull(),
    hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
    rateMultiplier: decimal("rate_multiplier", {
      precision: 3,
      scale: 2,
    }).default("1.5"),
    approved: boolean("approved").default(false),
  });

  return {
    schema,
    tables: {
      employees,
      salaryHistory,
      payslips,
      overtime,
    },
  };
}
