import {
  pgSchema,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  numeric,
  boolean,
  integer,
  pgTableCreator,
} from "drizzle-orm/pg-core";
import { users } from "./public"; // Assuming you have a public.users table

export function getTenantSchema(tenantId: string) {
  const schema = pgSchema(`accur8_${tenantId}`);

  // Helper for table references within the same schema
  const ref = (tableName: string) => `${tenantId}_${tableName}`;

  const departments = schema.table("departments", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: text("description"),
  });

  const positions = schema.table("positions", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    departmentId: uuid("department_id").references(() => departments.id),
    description: text("description"),
  });

  const employees = schema.table("employees", {
    id: uuid("id").primaryKey().defaultRandom(),
    publicUserId: uuid("public_user_id").references(() => users.id),
    employeeNumber: varchar("employee_number", { length: 50 }).unique(),
    hireDate: date("hire_date").notNull(),
    departmentId: uuid("department_id").references(() => departments.id),
    positionId: uuid("position_id").references(() => positions.id),
    status: varchar("status", { length: 20 }).default("active"),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    address: text("address"),
  });

  const salaryHistory = schema.table("salary_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    effectiveDate: date("effective_date").notNull(),
  });

  const payslips = schema.table("payslips", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    grossPay: numeric("gross_pay", { precision: 10, scale: 2 }).notNull(),
    deductions: numeric("deductions", { precision: 10, scale: 2 }).default("0"),
    netPay: numeric("net_pay", { precision: 10, scale: 2 }).notNull(),
    paymentDate: date("payment_date"),
  });

  const overtime = schema.table("overtime", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    date: date("date").notNull(),
    hours: numeric("hours", { precision: 5, scale: 2 }).notNull(),
    rateMultiplier: numeric("rate_multiplier", {
      precision: 3,
      scale: 2,
    }).default("1.5"),
    approved: boolean("approved").default(false),
  });

  const leaveTypes = schema.table("leave_types", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).notNull(),
    description: text("description"),
  });

  const leaveAllocations = schema.table("leave_allocations", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    leaveTypeId: uuid("leave_type_id").references(() => leaveTypes.id),
    totalDays: integer("total_days").notNull(),
    allocatedOn: date("allocated_on").notNull(),
  });

  const leaveRequests = schema.table("leave_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    leaveTypeId: uuid("leave_type_id").references(() => leaveTypes.id),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    reason: text("reason"),
    status: varchar("status", { length: 20 }).default("pending"),
    requestedAt: timestamp("requested_at").defaultNow(),
  });

  const attendance = schema.table("attendance", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    date: date("date").notNull(),
    clockIn: timestamp("clock_in"),
    clockOut: timestamp("clock_out"),
    status: varchar("status", { length: 20 }).default("present"),
  });

  const performanceReviews = schema.table("performance_reviews", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    reviewerId: uuid("reviewer_id").references(() => users.id),
    reviewDate: date("review_date").notNull(),
    score: integer("score").$type<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(),
    comments: text("comments"),
  });

  const documents = schema.table("documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    title: varchar("title", { length: 100 }),
    fileUrl: text("file_url").notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow(),
  });

  const trainingSessions = schema.table("training_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
  });

  const employeeTrainings = schema.table("employee_trainings", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    sessionId: uuid("session_id").references(() => trainingSessions.id),
    attended: boolean("attended").default(false),
  });

  const notifications = schema.table("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    message: text("message").notNull(),
    read: boolean("read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  });

  const terminations = schema.table("terminations", {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id").references(() => employees.id),
    reason: text("reason").notNull(),
    terminationDate: date("termination_date").notNull(),
    finalPay: numeric("final_pay", { precision: 10, scale: 2 }),
  });

  return {
    schema,
    tables: {
      departments,
      positions,
      employees,
      salaryHistory,
      payslips,
      overtime,
      leaveTypes,
      leaveAllocations,
      leaveRequests,
      attendance,
      performanceReviews,
      documents,
      trainingSessions,
      employeeTrainings,
      notifications,
      terminations,
    },
  };
}
