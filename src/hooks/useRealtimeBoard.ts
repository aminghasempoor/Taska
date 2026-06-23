"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { orpc } from "@/orpc/query-client";

export type BoardEvent =
    | { type: "issue.created"; projectId: string }
    | { type: "issue.updated"; projectId: string }
    | { type: "issue.deleted"; projectId: string };

export function useRealtimeBoard(projectId: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!projectId) return;

        // Each project gets its own channel
        const channel = supabase.channel(`board:${projectId}`);

        channel
            .on("broadcast", { event: "board" }, ({ payload }: { payload: BoardEvent }) => {
                // When any board event arrives → invalidate that project's issues
                if (payload.projectId === projectId) {
                    queryClient.invalidateQueries(
                        orpc.issue.byProject.queryOptions({ input: { projectId } })
                    );
                }
            })
            .subscribe();

        // Cleanup on unmount or projectId change
        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId, queryClient]);
}