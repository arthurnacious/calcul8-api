import { db } from "@/db/client";
import { users } from "@/schemas/public";
import { verifyPassword } from "@/services/auth.service";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";

const auth = new Hono();

const loginValidation = z.object({
  email: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
  remember_me: z.boolean().optional(),
});

auth
  .post("/login", async (c) => {
    const body = await c.req.json(); // Get request body
    const validatedData = loginValidation.safeParse(body); // Validate input

    if (!validatedData.success) {
      return c.json({ error: validatedData.error.format() }, 400);
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.data.email),
      with: {
        tetants: true,
      }, //see if i can load roles from the pivot as well here
    });

    if (!user) {
      return c.json({ error: "Invalid Credentials" }, 401);
    }

    const isMatch = verifyPassword(
      validatedData.data.password,
      user.passwordHash
    );

    if (!isMatch) {
      return c.json({ error: "Invalid Credentials" }, 401);
    }

    return c.json({ user });
  })
  .post("/logout", async (c) => {
    return c.json({ message: "NO implementation of logout yet" }, 500);
  });

export default auth;
