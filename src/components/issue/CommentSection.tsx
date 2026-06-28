"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useComments, useCreateComment } from "@/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function CommentSection({ issueId }: { issueId: string }) {
    const { user } = useUser();
    const { data: comments = [], isPending } = useComments(issueId);
    const { mutate: createComment, isPending: isSending } = useCreateComment();
    const [body, setBody] = useState("");

    function handleSubmit() {
        if (!body.trim()) return;
        createComment({ body, issueId }, { onSuccess: () => setBody("") });
    }

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">Comments</h3>

            {/* Comment list */}
            {isPending ? (
                <p className="text-muted-foreground text-xs">Loading...</p>
            ) : (
                <AnimatePresence>
                    {comments.length === 0 ? (
                        <p className="text-muted-foreground text-xs">No comments yet.</p>
                    ) : (
                        comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-3"
                            >
                                <Avatar className="h-7 w-7 shrink-0">
                                    <AvatarImage src={user?.imageUrl} />
                                    <AvatarFallback className="text-xs">{user?.firstName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-1 flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium">{user?.fullName ?? user?.firstName}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {formatDistanceToNow(new Date(comment.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm">{comment.body}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            )}

            {/* New comment */}
            <div className="flex gap-3 pt-2">
                <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="text-xs">{user?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-2">
                    <Textarea
                        placeholder="Add a comment..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={2}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                        }}
                    />
                    <Button size="sm" className="self-end" onClick={handleSubmit} disabled={isSending || !body.trim()}>
                        {isSending ? "Posting..." : "Comment"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
