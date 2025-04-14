import { getTenantSchema } from "../schemas/tenant";

export type TenantTables = ReturnType<typeof getTenantSchema>["tables"];
