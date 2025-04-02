import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  date,
  time,
  pgEnum,
  uuid,
  uniqueIndex,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Constants
export const TENANT_SCHEMA_PREFIX = "calcul8_";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "employee",
]);
export const tenantStatusEnum = pgEnum("tenant_status", [
  "active",
  "inactive",
  "suspended",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "trialing",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "pending",
  "failed",
]);
export const employeeStatusEnum = pgEnum("employee_status", [
  "active",
  "inactive",
  "on_leave",
  "terminated",
]);
export const contractTypeEnum = pgEnum("contract_type", [
  "permanent",
  "temporary",
  "contract",
  "probation",
]);
export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
  "canceled",
]);
export const overtimeStatusEnum = pgEnum("overtime_status", [
  "pending",
  "approved",
  "rejected",
]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "half_day",
]);
export const reviewStatusEnum = pgEnum("review_status", [
  "scheduled",
  "in_progress",
  "completed",
]);
export const goalStatusEnum = pgEnum("goal_status", [
  "not_started",
  "in_progress",
  "completed",
  "on_hold",
]);
export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "open",
  "closed",
  "on_hold",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "new",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
]);
export const courseStatusEnum = pgEnum("course_status", [
  "available",
  "scheduled",
  "in_progress",
  "completed",
]);
export const employeeCourseStatusEnum = pgEnum("employee_course_status", [
  "enrolled",
  "in_progress",
  "completed",
  "dropped",
]);
export const benefitStatusEnum = pgEnum("benefit_status", [
  "active",
  "inactive",
]);
export const documentTypeEnum = pgEnum("document_type", [
  "id",
  "passport",
  "visa",
  "certificate",
  "contract",
  "other",
]);
export const offboardingStatusEnum = pgEnum("offboarding_status", [
  "initiated",
  "in_progress",
  "completed",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
]);
export const settlementStatusEnum = pgEnum("settlement_status", [
  "pending",
  "processed",
  "paid",
]);
export const payrollStatusEnum = pgEnum("payroll_status", [
  "draft",
  "processing",
  "completed",
]);
export const payslipStatusEnum = pgEnum("payslip_status", [
  "draft",
  "generated",
  "approved",
  "paid",
]);

/*
  PUBLIC SCHEMA
  Contains shared tables across all tenants
  */

// Users Table
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

// Tenants Table
export const tenants = pgTable("tenants", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  schema: text("schema").unique().notNull(),
  status: tenantStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

// TenantUsers Junction Table
export const tenantUsers = pgTable("tenant_users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").default("employee").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Plans Table
export const plans = pgTable("plans", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  priceMonthly: integer("price_monthly").notNull(),
  priceYearly: integer("price_yearly").notNull(),
  features: text("features"), // JSON stored as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Subscriptions Table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "restrict" }),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Payments Table
export const payments = pgTable("payments", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subscriptionId: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/*
  DYNAMIC TENANT SCHEMA TABLES
  These tables will be created in each tenant's schema
  */

// Function to create tenant-specific tables
export function createTenantSchema(schema: string) {
  // Departments Table
  const departments = pgTable(`${schema}.departments`, {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  });

  // Job Roles Table
  const jobRoles = pgTable(`${schema}.job_roles`, {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  });

  // Employees Table
  const employees = pgTable(`${schema}.employees`, {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    jobRoleId: uuid("job_role_id").references(() => jobRoles.id, {
      onDelete: "set null",
    }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    phone: text("phone"),
    address: text("address"),
    dateOfBirth: date("date_of_birth"),
    joiningDate: date("joining_date").notNull(),
    status: employeeStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  });

  // Contracts Table
  const contracts = pgTable(`${schema}.contracts`, {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    contractType: contractTypeEnum("contract_type")
      .default("permanent")
      .notNull(),
    document: text("document"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  });

  // Salary Structure Table
  const salaryStructures = pgTable(`${schema}.salary_structures`, {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id),
    basicSalary: integer("basic_salary").notNull(),
    houseRentAllowance: integer("house_rent_allowance").default(0).notNull(),
    conveyanceAllowance: integer("conveyance_allowance").default(0).notNull(),
    medicalAllowance: integer("medical_allowance").default(0).notNull(),
    otherAllowances: integer("other_allowances").default(0).notNull(),
    effectiveFrom: timestamp("effective_from").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  });

  // Payroll Period Table
  const payrollPeriods = pgTable(`${schema}.payroll_periods`, {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: payrollStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  });

  // Payslips Table
  const payslips = pgTable(`${schema}.payslips`, {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id),
    payrollPeriodId: uuid("payroll_period_id")
      .notNull()
      .references(() => payrollPeriods.id),
    basicSalary: integer("basic_salary").notNull(),
    totalAllowances: integer("total_allowances").notNull(),
    totalDeductions: integer("total_deductions").notNull(),
    netSalary: integer("net_salary").notNull(),
    status: payslipStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  });

  // Return all tables
  return {
    departments,
    jobRoles,
    employees,
    contracts,
    salaryStructures,
    payrollPeriods,
    payslips,
    // ... include all other tables with the same pattern
  };
}

/*
  Tenant schema creation utility
  */
export function getTenantSchemaSQL(tenantId: string): string {
  const schemaName = `${TENANT_SCHEMA_PREFIX}${tenantId}`;

  return `
  -- Create schema for the tenant
  CREATE SCHEMA IF NOT EXISTS "${schemaName}";
  
  -- Set search_path for subsequent commands
  SET search_path TO "${schemaName}";
  
  -- Enable necessary extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  
  -- Add more schema-specific setup as needed
  `;
}

/*
  Database client initialization with dynamic schema selection
  */
export function getTenantDb(client: any, tenantId: string) {
  const schema = `${TENANT_SCHEMA_PREFIX}${tenantId}`;
  return createTenantSchema(schema);
}
