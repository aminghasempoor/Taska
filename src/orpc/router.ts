import { db } from "@/db";
import { users, workspaces, workspaceMembers, projects, issues, comments, projectMembers } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import {
    syncUserSchema,
    createWorkspaceSchema,
    createProjectSchema,
    createIssueSchema,
    updateIssueSchema,
    deleteIssueSchema,
    getIssuesByProjectSchema,
    createCommentSchema,
    deleteCommentSchema,
    addProjectMemberSchema,
    removeProjectMemberSchema,
    getProjectMembersSchema,
} from "@/validators";
import { z } from "zod";
import { clerkProcedure, protectedProcedure } from "./middleware";
import { resend } from "@/lib/resend";
import { InviteEmail } from "@/emails/InviteEmail";

export const router = {
    // ─── User ────────────────────────────────────────────────────────────────
    user: {
        // Uses clerkProcedure — Clerk session valid but user may not be in DB yet
        sync: clerkProcedure.input(syncUserSchema).handler(async ({ input }) => {
            const existing = await db.select().from(users).where(eq(users.clerkId, input.clerkId)).limit(1);

            if (existing.length > 0) return existing[0];

            const [user] = await db
                .insert(users)
                .values({
                    clerkId: input.clerkId,
                    email: input.email,
                    name: input.name,
                    avatarUrl: input.avatarUrl,
                })
                .returning();

            return user;
        }),

        // Uses protectedProcedure — user must exist in DB
        me: protectedProcedure.handler(async ({ context }) => {
            return context.user;
        }),
    },

    // ─── Workspace ───────────────────────────────────────────────────────────
    workspace: {
        create: protectedProcedure.input(createWorkspaceSchema).handler(async ({ input, context }) => {
            const { user } = context;

            // Create workspace
            const [workspace] = await db
                .insert(workspaces)
                .values({
                    name: input.name,
                    slug: input.slug,
                    clerkOrgId: `org_${input.slug}`, // will be replaced with real Clerk org id later
                })
                .returning();

            // Add creator as owner
            await db.insert(workspaceMembers).values({
                workspaceId: workspace.id,
                userId: user!.id,
                role: "owner",
            });

            return workspace;
        }),

        list: protectedProcedure.handler(async ({ context }) => {
            const members = await db
                .select({ workspace: workspaces })
                .from(workspaceMembers)
                .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
                .where(eq(workspaceMembers.userId, context.user!.id));

            return members.map((m) => m.workspace);
        }),

        bySlug: protectedProcedure.input(createWorkspaceSchema.pick({ slug: true })).handler(async ({ input }) => {
            const [workspace] = await db.select().from(workspaces).where(eq(workspaces.slug, input.slug)).limit(1);

            return workspace ?? null;
        }),

        join: protectedProcedure.input(z.object({ slug: z.string() })).handler(async ({ input, context }) => {
            const [workspace] = await db.select().from(workspaces).where(eq(workspaces.slug, input.slug)).limit(1);

            if (!workspace) throw new Error("Workspace not found");

            // Make sure user exists in our DB
            // (they might have signed in but never gone through onboarding)
            const existingUser = await db.select().from(users).where(eq(users.id, context.user!.id)).limit(1);

            if (existingUser.length === 0) throw new Error("User not synced");

            const existing = await db
                .select()
                .from(workspaceMembers)
                .where(
                    and(eq(workspaceMembers.workspaceId, workspace.id), eq(workspaceMembers.userId, context.user!.id))
                )
                .limit(1);

            if (existing.length > 0) return workspace;

            await db.insert(workspaceMembers).values({
                workspaceId: workspace.id,
                userId: context.user!.id,
                role: "member",
            });

            return workspace;
        }),
        invite: protectedProcedure
            .input(
                z.object({
                    email: z.string().email(),
                    workspaceId: z.string().uuid(),
                    slug: z.string(),
                })
            )
            .handler(async ({ input, context }) => {
                const { user } = context;

                // Get workspace details
                const [workspace] = await db
                    .select()
                    .from(workspaces)
                    .where(eq(workspaces.id, input.workspaceId))
                    .limit(1);

                if (!workspace) throw new Error("Workspace not found");

                const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${input.slug}`;

                // Send email via Resend
                const { error } = await resend.emails.send({
                    from: "Taska <onboarding@resend.dev>", // use your domain in production
                    to: input.email,
                    subject: `${user!.name} invited you to ${workspace.name} on Taska`,
                    react: InviteEmail({
                        inviterName: user!.name,
                        workspaceName: workspace.name,
                        joinUrl,
                    }),
                });

                if (error) throw new Error("Failed to send invite email");

                return { success: true };
            }),
    },

    // ─── Project ─────────────────────────────────────────────────────────────
    project: {
        create: protectedProcedure.input(createProjectSchema).handler(async ({ input }) => {
            const [project] = await db.insert(projects).values(input).returning();
            return project;
        }),

        list: protectedProcedure.input(createProjectSchema.pick({ workspaceId: true })).handler(async ({ input }) => {
            return await db
                .select()
                .from(projects)
                .where(eq(projects.workspaceId, input.workspaceId))
                .orderBy(asc(projects.createdAt));
        }),
    },

    projectMember: {
        // Get all members of a project with user details
        list: protectedProcedure.input(getProjectMembersSchema).handler(async ({ input }) => {
            return await db
                .select({
                    id: projectMembers.id,
                    joinedAt: projectMembers.joinedAt,
                    userId: users.id,
                    name: users.name,
                    email: users.email,
                    avatarUrl: users.avatarUrl,
                })
                .from(projectMembers)
                .innerJoin(users, eq(projectMembers.userId, users.id))
                .where(eq(projectMembers.projectId, input.projectId));
        }),

        // Get workspace members NOT yet in the project
        // Used to show who you can still add
        available: protectedProcedure
            .input(z.object({ projectId: z.string().uuid(), workspaceId: z.string().uuid() }))
            .handler(async ({ input }) => {
                // All workspace members
                const wsmembers = await db
                    .select({
                        userId: users.id,
                        name: users.name,
                        email: users.email,
                        avatarUrl: users.avatarUrl,
                    })
                    .from(workspaceMembers)
                    .innerJoin(users, eq(workspaceMembers.userId, users.id))
                    .where(eq(workspaceMembers.workspaceId, input.workspaceId));

                // Already in project
                const pmembers = await db
                    .select({ userId: projectMembers.userId })
                    .from(projectMembers)
                    .where(eq(projectMembers.projectId, input.projectId));

                const inProjectIds = new Set(pmembers.map((m) => m.userId));

                // Return only those NOT already in the project
                return wsmembers.filter((m) => !inProjectIds.has(m.userId));
            }),

        add: protectedProcedure.input(addProjectMemberSchema).handler(async ({ input }) => {
            const [member] = await db.insert(projectMembers).values(input).returning();
            return member;
        }),

        remove: protectedProcedure.input(removeProjectMemberSchema).handler(async ({ input }) => {
            await db
                .delete(projectMembers)
                .where(and(eq(projectMembers.projectId, input.projectId), eq(projectMembers.userId, input.userId)));
            return { success: true };
        }),
    },

    // ─── Issue ───────────────────────────────────────────────────────────────
    issue: {
        create: protectedProcedure.input(createIssueSchema).handler(async ({ input, context }) => {
            const [issue] = await db
                .insert(issues)
                .values({
                    ...input,
                    createdBy: context.user!.id,
                })
                .returning();
            return issue;
        }),

        byProject: protectedProcedure.input(getIssuesByProjectSchema).handler(async ({ input }) => {
            return await db
                .select()
                .from(issues)
                .where(eq(issues.projectId, input.projectId))
                .orderBy(asc(issues.position));
        }),

        update: protectedProcedure.input(updateIssueSchema).handler(async ({ input }) => {
            const { id, ...fields } = input;
            const [issue] = await db
                .update(issues)
                .set({ ...fields, updatedAt: new Date() })
                .where(eq(issues.id, id))
                .returning();
            return issue;
        }),

        delete: protectedProcedure.input(deleteIssueSchema).handler(async ({ input }) => {
            await db.delete(issues).where(eq(issues.id, input.id));
            return { success: true };
        }),
    },

    // ─── Comment ─────────────────────────────────────────────────────────────
    comment: {
        create: protectedProcedure.input(createCommentSchema).handler(async ({ input, context }) => {
            const [comment] = await db
                .insert(comments)
                .values({
                    ...input,
                    authorId: context.user!.id,
                })
                .returning();
            return comment;
        }),

        byIssue: protectedProcedure.input(z.object({ issueId: z.string().uuid() })).handler(async ({ input }) => {
            return await db
                .select()
                .from(comments)
                .where(eq(comments.issueId, input.issueId))
                .orderBy(asc(comments.createdAt));
        }),

        delete: protectedProcedure.input(deleteCommentSchema).handler(async ({ input, context }) => {
            await db.delete(comments).where(
                and(
                    eq(comments.id, input.id),
                    eq(comments.authorId, context.user!.id) // can only delete own comments
                )
            );
            return { success: true };
        }),
    },
};

export type Router = typeof router;
