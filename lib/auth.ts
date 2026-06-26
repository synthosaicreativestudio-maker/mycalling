import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // telegram configuration will go here when implemented via custom provider
    // MAX ID configuration will go here
  },
  user: {
    additionalFields: {
      grade: {
        type: "number",
        required: false,
      }
    }
  },
  advanced: {
    generateId: false // let Prisma handle default UUIDs
  }
});
