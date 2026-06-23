import { db } from "@/db";
import { users, workspaces, workspaceMembers, projects, issues, comments } from "@/db/schema";
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
} from "@/validators";
import { z } from "zod";
import { clerkProcedure, protectedProcedure } from "./middleware";

export const router = {

    // ─── User ────────────────────────────────────────────────────────────────
    user: {
        // Uses clerkProcedure — Clerk session valid but user may not be in DB yet
        sync: clerkProcedure
            .input(syncUserSchema)
            .handler(async ({ input }) => {
                const existing = await db
                    .select()
                    .from(users)
                    .where(eq(users.clerkId, input.clerkId))
                    .limit(1);

                if (existing.length > 0) return existing[0];

                const [user] = await db
                    .insert(users)
                    .values({
                        clerkId:   input.clerkId,
                        email:     input.email,
                        name:      input.name,
                        avatarUrl: input.avatarUrl,
                    })
                    .returning();

                return user;
            }),

        // Uses protectedProcedure — user must exist in DB
        me: protectedProcedure
            .handler(async ({ context }) => {
                return context.user;
            }),
    },

    // ─── Workspace ───────────────────────────────────────────────────────────
    workspace: {
        create: protectedProcedure
            .input(createWorkspaceSchema)
            .handler(async ({ input, context }) => {
                const { user } = context;

                // Create workspace
                const [workspace] = await db
                    .insert(workspaces)
                    .values({
                        name:       input.name,
                        slug:       input.slug,
                        clerkOrgId: `org_${input.slug}`, // will be replaced with real Clerk org id later
                    })
                    .returning();

                // Add creator as owner
                await db.insert(workspaceMembers).values({
                    workspaceId: workspace.id,
                    userId:      user!.id,
                    role:        "owner",
                });

                return workspace;
            }),

        list: protectedProcedure
            .handler(async ({ context }) => {
                const members = await db
                    .select({ workspace: workspaces })
                    .from(workspaceMembers)
                    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
                    .where(eq(workspaceMembers.userId, context.user!.id));

                return members.map((m) => m.workspace);
            }),

        bySlug: protectedProcedure
            .input(createWorkspaceSchema.pick({ slug: true }))
            .handler(async ({ input }) => {
                const [workspace] = await db
                    .select()
                    .from(workspaces)
                    .where(eq(workspaces.slug, input.slug))
                    .limit(1);

                return workspace ?? null;
            }),
    },

    // ─── Project ─────────────────────────────────────────────────────────────
    project: {
        create: protectedProcedure
            .input(createProjectSchema)
            .handler(async ({ input }) => {
                const [project] = await db
                    .insert(projects)
                    .values(input)
                    .returning();
                return project;
            }),

        list: protectedProcedure
            .input(createProjectSchema.pick({ workspaceId: true }))
            .handler(async ({ input }) => {
                return await db
                    .select()
                    .from(projects)
                    .where(eq(projects.workspaceId, input.workspaceId))
                    .orderBy(asc(projects.createdAt));
            }),
    },

    // ─── Issue ───────────────────────────────────────────────────────────────
    issue: {
        create: protectedProcedure
            .input(createIssueSchema)
            .handler(async ({ input, context }) => {
                const [issue] = await db
                    .insert(issues)
                    .values({
                        ...input,
                        createdBy: context.user!.id,
                    })
                    .returning();
                return issue;
            }),

        byProject: protectedProcedure
            .input(getIssuesByProjectSchema)
            .handler(async ({ input }) => {
                return await db
                    .select()
                    .from(issues)
                    .where(eq(issues.projectId, input.projectId))
                    .orderBy(asc(issues.position));
            }),

        update: protectedProcedure
            .input(updateIssueSchema)
            .handler(async ({ input }) => {
                const { id, ...fields } = input;
                const [issue] = await db
                    .update(issues)
                    .set({ ...fields, updatedAt: new Date() })
                    .where(eq(issues.id, id))
                    .returning();
                return issue;
            }),

        delete: protectedProcedure
            .input(deleteIssueSchema)
            .handler(async ({ input }) => {
                await db.delete(issues).where(eq(issues.id, input.id));
                return { success: true };
            }),
    },

    // ─── Comment ─────────────────────────────────────────────────────────────
    comment: {
        create: protectedProcedure
            .input(createCommentSchema)
            .handler(async ({ input, context }) => {
                const [comment] = await db
                    .insert(comments)
                    .values({
                        ...input,
                        authorId: context.user!.id,
                    })
                    .returning();
                return comment;
            }),

        byIssue: protectedProcedure
            .input(deleteCommentSchema.pick({ id: true }).extend({ issueId: z.string().uuid() }))
            .handler(async ({ input }) => {
                return await db
                    .select()
                    .from(comments)
                    .where(eq(comments.issueId, input.issueId))
                    .orderBy(asc(comments.createdAt));
            }),

        delete: protectedProcedure
            .input(deleteCommentSchema)
            .handler(async ({ input, context }) => {
                await db
                    .delete(comments)
                    .where(
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