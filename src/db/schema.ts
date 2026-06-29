import { pgTable, text, timestamp, uuid, pgEnum, integer } from "drizzle-orm/pg-core";

// ─── Enums ─────────────────────────────────────────────────────────────────

export const workspaceMemberRoleEnum = pgEnum("workspace_member_role", ["owner", "admin", "member"]);

export const issueStatusEnum = pgEnum("issue_status", ["backlog", "todo", "in_progress", "done", "cancelled"]);

export const issuePriorityEnum = pgEnum("issue_priority", ["none", "low", "medium", "high", "urgent"]);

// ─── Users ─────────────────────────────────────────────────────────────────
// Mirrors Clerk user data locally so we can do DB joins
// clerk_id is the source of truth — it comes from Clerk's JWT

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Workspaces ────────────────────────────────────────────────────────────
// One workspace = one team/company
// clerk_org_id links to Clerk's organization

export const workspaces = pgTable("workspaces", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(), // used in URL: /acme/project
    clerkOrgId: text("clerk_org_id").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Workspace Members ─────────────────────────────────────────────────────

export const workspaceMembers = pgTable("workspace_members", {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    role: workspaceMemberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// ─── Projects ──────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    identifier: text("identifier").notNull(), // short code e.g. "ENG", "MKT"
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Issues ────────────────────────────────────────────────────────────────
// position is a float — used for drag-and-drop ordering without rewriting all rows

export const issues = pgTable("issues", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    status: issueStatusEnum("status").notNull().default("backlog"),
    priority: issuePriorityEnum("priority").notNull().default("none"),
    position: integer("position").notNull().default(0),
    projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
    createdBy: uuid("created_by")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Comments ──────────────────────────────────────────────────────────────

export const comments = pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    body: text("body").notNull(),
    issueId: uuid("issue_id")
        .notNull()
        .references(() => issues.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── project member ──────────────────────────────────────────────────────────────

export const projectMembers = pgTable("project_members", {
    id:          uuid("id").primaryKey().defaultRandom(),
    projectId:   uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId:      uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    joinedAt:    timestamp("joined_at").notNull().defaultNow(),
});


// ─── Inferred Types ────────────────────────────────────────────────────────

export type ProjectMember    = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
