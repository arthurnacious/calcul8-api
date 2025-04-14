import { getTenantSchema } from "../schemas/tenant";

export type TenantTables = ReturnType<typeof getTenantSchema>["tables"];

export interface TenantContext {
  tables: {
    payslips: ReturnType<typeof getTenantSchema>["tables"]["payslips"];
    employees: ReturnType<typeof getTenantSchema>["tables"]["employees"];
  };
}
