import { betterAuth } from "better-auth";
import { database } from "@/lib/db";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000";

if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET must be set in production.");
}

export const auth = betterAuth({
  database,
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET ?? "partyfind-local-development-secret-change-before-deploying",
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
});
