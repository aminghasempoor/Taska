import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Gets the current user from your DB (not just Clerk)
// Returns null if not authenticated
export async function getCurrentUser() {
    const { userId } = await auth();
    if (!userId) return null;

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);

    return user ?? null;
}

// Same but throws if not authenticated — use in protected procedures
export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) throw new Error("UNAUTHORIZED");
    return user;
}