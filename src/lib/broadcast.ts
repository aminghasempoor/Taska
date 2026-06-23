import { supabase } from "./supabase";
import type { BoardEvent } from "@/hooks/useRealtimeBoard";

export async function broadcastBoardEvent(event: BoardEvent) {
    await supabase.channel(`board:${event.projectId}`).send({
        type: "broadcast",
        event: "board",
        payload: event,
    });
}