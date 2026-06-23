import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/query-client";
import { broadcastBoardEvent } from "@/lib/broadcast";

// ─── User ──────────────────────────────────────────────────────────────────

export function useMe() {
    return useQuery(orpc.user.me.queryOptions());
}

export function useSyncUser() {
    const queryClient = useQueryClient();
    return useMutation({
        ...orpc.user.sync.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(orpc.user.me.queryOptions());
        },
    });
}

// ─── Workspace ─────────────────────────────────────────────────────────────

export function useWorkspaces() {
    return useQuery(orpc.workspace.list.queryOptions());
}

export function useCreateWorkspace() {
    const queryClient = useQueryClient();
    return useMutation({
        ...orpc.workspace.create.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(orpc.workspace.list.queryOptions());
        },
    });
}

// ─── Project ───────────────────────────────────────────────────────────────

export function useProjects(workspaceId: string) {
    return useQuery(orpc.project.list.queryOptions({ input: { workspaceId } }));
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        ...orpc.project.create.mutationOptions(),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(
                orpc.project.list.queryOptions({
                    input: { workspaceId: variables.workspaceId },
                })
            );
        },
    });
}

// ─── Issue ─────────────────────────────────────────────────────────────────

export function useIssues(projectId: string) {
    return useQuery(orpc.issue.byProject.queryOptions({ input: { projectId } }));
}

export function useCreateIssue() {
    const queryClient = useQueryClient();
    return useMutation({
        ...orpc.issue.create.mutationOptions(),
        onSuccess: (_, variables) => {
            // Invalidate own cache
            queryClient.invalidateQueries(
                orpc.issue.byProject.queryOptions({
                    input: { projectId: variables.projectId },
                })
            );
            // Broadcast to other users
            broadcastBoardEvent({
                type: "issue.created",
                projectId: variables.projectId,
            });
        },
    });
}

export function useUpdateIssue() {
    const queryClient = useQueryClient();
    return useMutation({
        ...orpc.issue.update.mutationOptions(),
        onSuccess: (data) => {
            queryClient.invalidateQueries(
                orpc.issue.byProject.queryOptions({
                    input: { projectId: data!.projectId },
                })
            );
            broadcastBoardEvent({
                type: "issue.updated",
                projectId: data!.projectId,
            });
        },
    });
}

export function useDeleteIssue(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        ...orpc.issue.delete.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(orpc.issue.byProject.queryOptions({ input: { projectId } }));
            broadcastBoardEvent({
                type: "issue.deleted",
                projectId,
            });
        },
    });
}
