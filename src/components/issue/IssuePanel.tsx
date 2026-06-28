"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateIssue, useDeleteIssue } from "@/hooks";
import { CommentSection } from "./CommentSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_CONFIG, PRIORITY_CONFIG, ALL_STATUSES, type IssueStatus, type IssuePriority } from "@/lib/config";
import { X, Trash2 } from "lucide-react";
import type { Issue } from "@/db/schema";

export function IssuePanel({ issue, onClose }: { issue: Issue | null; onClose: () => void }) {
    const { mutate: updateIssue } = useUpdateIssue();
    const { mutate: deleteIssue } = useDeleteIssue(issue?.projectId ?? "");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Sync local state when issue changes
    useEffect(() => {
        if (issue) {
            setTitle(issue.title);
            setDescription(issue.description ?? "");
        }
    }, [issue?.id]);

    function handleTitleBlur() {
        if (!issue || title === issue.title) return;
        updateIssue({ id: issue.id, title });
    }

    function handleDescriptionBlur() {
        if (!issue || description === issue.description) return;
        updateIssue({ id: issue.id, description });
    }

    function handleDelete() {
        if (!issue) return;
        deleteIssue({ id: issue.id });
        onClose();
    }

    return (
        <AnimatePresence>
            {issue && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/20"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="bg-background fixed top-0 right-0 z-50 flex h-full w-[480px] flex-col overflow-hidden border-l shadow-xl"
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-mono text-xs">ISSUE</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive h-7 w-7"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-4">
                            {/* Title */}
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleBlur}
                                className="h-auto border-none px-0 text-base font-semibold shadow-none focus-visible:ring-0"
                                placeholder="Issue title"
                            />

                            {/* Status + Priority */}
                            <div className="flex gap-2">
                                <Select
                                    value={issue.status}
                                    onValueChange={(v) => updateIssue({ id: issue.id, status: v as IssueStatus })}
                                >
                                    <SelectTrigger className="h-8 flex-1 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALL_STATUSES.map((s) => {
                                            const config = STATUS_CONFIG[s];
                                            const Icon = config.icon;
                                            return (
                                                <SelectItem key={s} value={s}>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                                        {config.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={issue.priority}
                                    onValueChange={(v) => updateIssue({ id: issue.id, priority: v as IssuePriority })}
                                >
                                    <SelectTrigger className="h-8 flex-1 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                                            const Icon = config.icon;
                                            return (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                                        {config.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-muted-foreground text-xs font-medium">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={handleDescriptionBlur}
                                    placeholder="Add a description..."
                                    rows={4}
                                    className="resize-none text-sm"
                                />
                            </div>

                            {/* Comments */}
                            <div className="border-t pt-4">
                                <CommentSection issueId={issue.id} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
