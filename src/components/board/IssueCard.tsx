"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/config";
import type { Issue } from "@/db/schema";
import { useProjectMembers } from "@/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function IssueCard({ issue, onClick }: { issue: Issue; onClick?: () => void }) {
    const { data: members = [] } = useProjectMembers(issue.projectId);
    const assignee = members.find((m) => m.userId === issue.assigneeId);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const StatusIcon = STATUS_CONFIG[issue.status].icon;
    const PriorityIcon = PRIORITY_CONFIG[issue.priority].icon;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <motion.div
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                onClick={onClick}
                className="bg-background hover:border-primary/40 group flex cursor-pointer flex-col gap-2 rounded-lg border px-3 py-2.5 transition-all hover:shadow-sm"
            >
                <p className="text-sm leading-snug font-medium">{issue.title}</p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PriorityIcon className={`h-3.5 w-3.5 ${PRIORITY_CONFIG[issue.priority].color}`} />
                        <StatusIcon className={`h-3.5 w-3.5 ${STATUS_CONFIG[issue.status].color}`} />
                    </div>

                    {/* Assignee avatar */}
                    {assignee && (
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={assignee.avatarUrl ?? ""} />
                            <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
