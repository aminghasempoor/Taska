"use client";

import {useEffect, useState} from "react";
import { useCreateIssue } from "@/hooks";
import { useGenerateDescription, useSuggestPriority } from "@/hooks/useAI";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import {
    STATUS_CONFIG, PRIORITY_CONFIG, ALL_STATUSES,
    type IssueStatus, type IssuePriority,
} from "@/lib/config";

export function CreateIssueDialog({
                                      projectId,
                                      projectName,
                                      defaultStatus,
                                  }: {
    projectId:    string;
    projectName:  string;
    defaultStatus?: IssueStatus;
}) {
    const [open, setOpen]         = useState(false);
    const [title, setTitle]       = useState("");
    const [description, setDesc]  = useState("");
    const [status, setStatus]     = useState<IssueStatus>(defaultStatus ?? "backlog");
    const [priority, setPriority] = useState<IssuePriority>("none");

    const { mutate: createIssue, isPending } = useCreateIssue();

    const {
        generate,
        completion,
        isLoading: isGenerating,
    } = useGenerateDescription();

    const {
        suggest,
        suggestion,
        isLoading: isSuggesting,
    } = useSuggestPriority();

    // Sync streaming completion into description field
    const displayDescription = isGenerating ? completion : description;

    async function handleGenerateDescription() {
        if (!title.trim()) return;

        await generate(title, projectName);
    }

    useEffect(() => {
        if (completion) {
            setDesc(completion);
        }
    }, [completion]);

    async function handleSuggestPriority() {
        if (!title.trim()) return;
        await suggest(title, description);
        if (suggestion) {
            setPriority(suggestion.priority as IssuePriority);
        }
    }

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

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New issue</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 pt-2">
                    {/* Title */}
                    <Input
                        placeholder="Issue title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />

                    {/* Description with AI generate button */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">
                                Description
                            </label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs gap-1.5 text-purple-600 hover:text-purple-700
                           hover:bg-purple-50"
                                onClick={handleGenerateDescription}
                                disabled={!title.trim() || isGenerating}
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3 w-3" />
                                )}
                                {isGenerating ? "Generating..." : "AI generate"}
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Describe the issue..."
                            value={displayDescription}
                            onChange={(e) => setDesc(e.target.value)}
                            rows={4}
                            className="resize-none text-sm"
                        />
                    </div>

                    {/* Status + Priority */}
                    <div className="flex gap-2">
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as IssueStatus)}
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ALL_STATUSES.map((s) => {
                                    const config = STATUS_CONFIG[s];
                                    const Icon   = config.icon;
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

                        <div className="flex flex-col gap-1 flex-1">
                            <Select
                                value={priority}
                                onValueChange={(v) => setPriority(v as IssuePriority)}
                            >
                                <SelectTrigger className="w-full">
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

                            {/* AI priority suggestion */}
                            <button
                                onClick={handleSuggestPriority}
                                disabled={!title.trim() || isSuggesting}
                                className="text-xs text-purple-600 hover:text-purple-700
                           flex items-center gap-1 disabled:opacity-40"
                            >
                                {isSuggesting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3 w-3" />
                                )}
                                {isSuggesting ? "Thinking..." : "AI suggest"}
                            </button>

                            {/* Show reason */}
                            {suggestion && !isSuggesting && (
                                <p className="text-xs text-muted-foreground leading-tight">
                                    {suggestion.priority}<br />
                                    {suggestion.reason}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={handleCreate}
                        disabled={isPending || !title.trim()}
                    >
                        {isPending ? "Creating..." : "Create issue"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}