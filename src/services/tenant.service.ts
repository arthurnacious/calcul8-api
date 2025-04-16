import { sql } from "drizzle-orm";

export function getTenantHRMSchemaSQL(schemaName: string) {
  const qualifiedTable = (tableName: string) =>
    sql`${sql.identifier(schemaName)}.${sql.identifier(tableName)}`;

  return [
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("departments")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("positions")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        department_id UUID REFERENCES ${qualifiedTable("departments")}(id),
        description TEXT
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("employees")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        public_user_id UUID REFERENCES public.users(id),
        employee_number VARCHAR(50) UNIQUE,
        hire_date DATE NOT NULL,
        department_id UUID REFERENCES ${qualifiedTable("departments")}(id),
        position_id UUID REFERENCES ${qualifiedTable("positions")}(id),
        status VARCHAR(20) DEFAULT 'active',
        email VARCHAR(255),
        phone VARCHAR(30),
        address TEXT
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("salary_history")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        effective_date DATE NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("payslips")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        gross_pay DECIMAL(10, 2) NOT NULL,
        deductions DECIMAL(10, 2) DEFAULT 0,
        net_pay DECIMAL(10, 2) NOT NULL,
        payment_date DATE
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("overtime")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        date DATE NOT NULL,
        hours DECIMAL(5, 2) NOT NULL,
        rate_multiplier DECIMAL(3, 2) DEFAULT 1.5,
        approved BOOLEAN DEFAULT FALSE
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("leave_types")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) NOT NULL,
        description TEXT
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("leave_allocations")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        leave_type_id UUID REFERENCES ${qualifiedTable("leave_types")}(id),
        total_days INTEGER NOT NULL,
        allocated_on DATE NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("leave_requests")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        leave_type_id UUID REFERENCES ${qualifiedTable("leave_types")}(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("attendance")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        date DATE NOT NULL,
        clock_in TIME,
        clock_out TIME,
        status VARCHAR(20) DEFAULT 'present'
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("performance_reviews")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        reviewer_id UUID REFERENCES public.users(id),
        review_date DATE NOT NULL,
        score INTEGER CHECK (score BETWEEN 1 AND 10),
        comments TEXT
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("documents")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        title VARCHAR(100),
        file_url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("training_sessions")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(100) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("employee_trainings")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        session_id UUID REFERENCES ${qualifiedTable("training_sessions")}(id),
        attended BOOLEAN DEFAULT FALSE
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("notifications")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTable("terminations")} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID REFERENCES ${qualifiedTable("employees")}(id),
        reason TEXT NOT NULL,
        termination_date DATE NOT NULL,
        final_pay DECIMAL(10, 2)
      )
    `,
  ];
}
