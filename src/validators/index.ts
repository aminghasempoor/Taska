import { z } from "zod";

// ─── User ──────────────────────────────────────────────────────────────────

export const syncUserSchema = z.object({
    clerkId: z.string(),
    email: z.string().email(),
    name: z.string().min(1),
    avatarUrl: z.string().url().optional(),
});

// ─── Workspace ─────────────────────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
    name: z.string().min(1).max(50),
    slug: z
        .string()
        .min(2)
        .max(30)
        .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),
});

// ─── Project ───────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    identifier: z
        .string()
        .min(2)
        .max(5)
        .regex(/^[A-Z]+$/, "Only uppercase letters"),
    workspaceId: z.string().uuid(),
});

// ─── Issue ─────────────────────────────────────────────────────────────────

export const createIssueSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    status: z.enum(["backlog", "todo", "in_progress", "done", "cancelled"]).default("backlog"),
    priority: z.enum(["none", "low", "medium", "high", "urgent"]).default("none"),
    projectId: z.string().uuid(),
    assigneeId: z.string().uuid().optional(),
});

export const updateIssueSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(["backlog", "todo", "in_progress", "done", "cancelled"]).optional(),
    priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    position: z.number().int().optional(),
});

export const deleteIssueSchema = z.object({
    id: z.string().uuid(),
});

export const getIssuesByProjectSchema = z.object({
    projectId: z.string().uuid(),
});

// ─── Comment ───────────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
    body: z.string().min(1).max(2000),
    issueId: z.string().uuid(),
});

export const deleteCommentSchema = z.object({
    id: z.string().uuid(),
});

// ─── Inferred types ────────────────────────────────────────────────────────

export type SyncUserInput = z.infer<typeof syncUserSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type GetIssuesByProjectInput = z.infer<typeof getIssuesByProjectSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
