"use client";

import { useState, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { BoardColumn } from "./BoardColumn";
import { IssueCard } from "./IssueCard";
import { IssuePanel } from "@/components/issue/IssuePanel";
import { useIssues, useUpdateIssue } from "@/hooks";
import { useRealtimeBoard } from "@/hooks/useRealtimeBoard";
import { ALL_STATUSES, type IssueStatus } from "@/lib/config";
import type { Issue } from "@/db/schema";

export function Board({ projectId, projectName }: { projectId: string; projectName: string }) {
    useRealtimeBoard(projectId);

    const { data: issues = [], isPending } = useIssues(projectId);
    const { mutate: updateIssue } = useUpdateIssue();

    const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const issuesByStatus = useCallback(() => {
        return ALL_STATUSES.reduce(
            (acc, status) => {
                acc[status] = issues.filter((i) => i.status === status).sort((a, b) => a.position - b.position);
                return acc;
            },
            {} as Record<IssueStatus, Issue[]>
        );
    }, [issues]);

    function handleDragStart(event: DragStartEvent) {
        const issue = issues.find((i) => i.id === event.active.id);
        if (issue) setActiveIssue(issue);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveIssue(null);
        const { active, over } = event;
        if (!over) return;

        const activeIssue = issues.find((i) => i.id === active.id);
        if (!activeIssue) return;

        const overStatus = ALL_STATUSES.includes(over.id as IssueStatus)
            ? (over.id as IssueStatus)
            : issues.find((i) => i.id === over.id)?.status;

        if (!overStatus) return;

        if (activeIssue.status !== overStatus) {
            updateIssue({ id: activeIssue.id, status: overStatus });
        }
    }

    if (isPending) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading board...</p>
            </div>
        );
    }

    const grouped = issuesByStatus();

    return (
        <>
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex h-full gap-4 overflow-x-auto px-6 pb-4">
                    {ALL_STATUSES.map((status) => (
                        <BoardColumn
                            projectName={projectName}
                            key={status}
                            status={status}
                            issues={grouped[status]}
                            projectId={projectId}
                            onIssueClick={setSelectedIssue}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeIssue ? (
                        <div className="rotate-2 opacity-90">
                            <IssueCard issue={activeIssue} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Issue detail panel */}
            <IssuePanel issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
        </>
    );
}
