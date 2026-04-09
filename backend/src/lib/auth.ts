import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function requireAuth(request: FastifyRequest): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw request.server.httpErrors.unauthorized("Unauthorized");
  }
}

export function setAuthCookie(app: FastifyInstance, reply: FastifyReply, token: string) {
  const secure = String(app.config.COOKIE_SECURE).toLowerCase() === "true";
  reply.setCookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
}

export function clearAuthCookie(reply: FastifyReply) {
  reply.clearCookie("token", { path: "/" });
}

