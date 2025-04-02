import { Hono } from "hono";
import tenant from "./routes/tenant";

const app = new Hono();

app.route("/tenants", tenant);

export default app;
