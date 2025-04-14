import { relations } from "drizzle-orm";
import {
  decimal,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const tenants = pgTable("tenants", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 63 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToTenants = pgTable(
  "user_tenant",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    role: text("role").$type<"admin" | "manager" | "employee">(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  ({ userId, tenantId }) => [primaryKey({ columns: [userId, tenantId] })]
);

export const plans = pgTable("plans", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

export const plansToTenants = pgTable(
  "plan_tenant",
  {
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  ({ planId, tenantId }) => [primaryKey({ columns: [planId, tenantId] })]
);

export const payments = pgTable("payments", {
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  tenantId: uuid("tenant_id").references(() => tenants.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  tetants: many(tenants),
}));

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  users: many(users),
  plans: many(plansToTenants),
  payments: many(payments),
}));

export const plansRelations = relations(plans, ({ many, one }) => ({
  tenants: many(plansToTenants),
}));

export const paymentsRelations = relations(payments, ({ many, one }) => ({
  tenants: many(tenants),
}));
