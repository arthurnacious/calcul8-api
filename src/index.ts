import { Hono } from "hono";
import auth from "./routes/auth.routes";
import payslips from "./routes/payslip.routes";

const app = new Hono();

app.route("/auth", auth);
app.route("/payslips", payslips);

export default {
  port: 8000,
  fetch: app.fetch,
};
