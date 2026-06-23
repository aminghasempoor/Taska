"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { IssueCard } from "./IssueCard";
import { CreateIssueDialog } from "./CreateIssueDialog";
import { STATUS_CONFIG, type IssueStatus } from "@/lib/config";
import type { Issue } from "@/db/schema";

export function BoardColumn({
    status,
    issues,
    projectId,
}: {
    status: IssueStatus;
    issues: Issue[];
    projectId: string;
}) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    const { setNodeRef } = useDroppable({ id: status });

    return (
        <div className="flex w-70 min-w-70 flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm font-medium">{config.label}</span>
                    <span className="text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 text-xs">
                        {issues.length}
                    </span>
                </div>
                <CreateIssueDialog projectId={projectId} defaultStatus={status} />
            </div>

            {/* Droppable area */}
            <div ref={setNodeRef} className="bg-muted/40 flex min-h-30 flex-col gap-2 rounded-lg p-2 transition-colors">
                <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                        {issues.map((issue) => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}
                    </AnimatePresence>
                </SortableContext>
            </div>
        </div>
    );
}
