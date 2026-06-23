import { os } from "@orpc/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/db/schema";

export type Context = {
    user?: User;
};

// Unprotected — just checks Clerk session exists, doesn't require DB user
export const baseProcedure = os.$context<Context>();

// Clerk-only protection — JWT must be valid but user doesn't need to be in DB yet
export const clerkProcedure = baseProcedure.use(async ({ context, next }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("UNAUTHORIZED");
    return next({ context });
});

// Full protection — requires both Clerk session AND user in DB
export const protectedProcedure = baseProcedure.use(async ({ context, next }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("UNAUTHORIZED");
    return next({ context: { ...context, user } });
});
