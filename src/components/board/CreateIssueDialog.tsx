"use client";

import { useState } from "react";
import { useCreateIssue } from "@/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { STATUS_CONFIG, PRIORITY_CONFIG, ALL_STATUSES, type IssueStatus, type IssuePriority } from "@/lib/config";

export function CreateIssueDialog({ projectId, defaultStatus }: { projectId: string; defaultStatus?: IssueStatus }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDesc] = useState("");
    const [status, setStatus] = useState<IssueStatus>(defaultStatus ?? "backlog");
    const [priority, setPriority] = useState<IssuePriority>("none");

    const { mutate: createIssue, isPending } = useCreateIssue();

    function handleCreate() {
        if (!title.trim()) return;
        createIssue(
            { title, description, status, priority, projectId },
            {
                onSuccess: () => {
                    setOpen(false);
                    setTitle("");
                    setDesc("");
                    setStatus(defaultStatus ?? "backlog");
                    setPriority("none");
                },
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New issue</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                    <Input
                        placeholder="Issue title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        autoFocus
                    />
                    <Textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDesc(e.target.value)}
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
                            <SelectTrigger className="flex-1">
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

                        <Select value={priority} onValueChange={(v) => setPriority(v as IssuePriority)}>
                            <SelectTrigger className="flex-1">
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

                    <Button onClick={handleCreate} disabled={isPending || !title.trim()}>
                        {isPending ? "Creating..." : "Create issue"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
