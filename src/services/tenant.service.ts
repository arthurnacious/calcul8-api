import { db } from "../db/client";
import { tenants } from "../schemas/public";

export class TenantService {
  static async createTenant(name: string) {
    return db.insert(tenants).values({ name }).returning();
  }
}
