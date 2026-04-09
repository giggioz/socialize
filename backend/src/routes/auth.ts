import type { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import { z } from "zod";
import { collections } from "../lib/collections.js";
import { clearAuthCookie, requireAuth, setAuthCookie } from "../lib/auth.js";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const { users } = collections(app.db);
    const user = await users.findOne({ username: body.username });
    if (!user) return reply.code(401).send({ error: "Invalid credentials" });

    const ok = await argon2.verify(user.passwordHash, body.password);
    if (!ok) return reply.code(401).send({ error: "Invalid credentials" });

    const token = await reply.jwtSign({ userId: String(user._id), username: user.username });
    setAuthCookie(app, reply, token);
    return reply.send({ ok: true });
  });

  app.post("/logout", async (_request, reply) => {
    clearAuthCookie(reply);
    return reply.send({ ok: true });
  });

  app.get(
    "/me",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      return { userId: request.user.userId, username: request.user.username };
    },
  );
};

