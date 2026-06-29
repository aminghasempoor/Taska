"use client";

import { useState } from "react";
import { useProjectMembers, useAvailableMembers, useAddProjectMember, useRemoveProjectMember } from "@/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ManageMembersDialog({ projectId, workspaceId }: { projectId: string; workspaceId: string }) {
    const [open, setOpen] = useState(false);

    const { data: members = [] } = useProjectMembers(projectId);
    const { data: available = [] } = useAvailableMembers(projectId, workspaceId);

    const { mutate: addMember, isPending: isAdding } = useAddProjectMember(projectId, workspaceId);
    const { mutate: removeMember, isPending: isRemoving } = useRemoveProjectMember(projectId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Members
                    <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                        {members.length}
                    </Badge>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Project members</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 pt-2">
                    {/* Current members */}
                    <div className="flex flex-col gap-2">
                        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                            Current members ({members.length})
                        </p>
                        <AnimatePresence>
                            {members.length === 0 ? (
                                <p className="text-muted-foreground py-2 text-sm">No members yet.</p>
                            ) : (
                                members.map((member) => (
                                    <motion.div
                                        key={member.userId}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        className="hover:bg-muted/50 group flex items-center gap-3 rounded-lg p-2"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatarUrl ?? ""} />
                                            <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{member.name}</p>
                                            <p className="text-muted-foreground truncate text-xs">{member.email}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={() => removeMember({ projectId, userId: member.userId })}
                                            disabled={isRemoving}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Available to add */}
                    {available.length > 0 && (
                        <div className="flex flex-col gap-2 border-t pt-4">
                            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                Add from workspace
                            </p>
                            {available.map((member) => (
                                <motion.div
                                    key={member.userId}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatarUrl ?? ""} />
                                        <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{member.name}</p>
                                        <p className="text-muted-foreground truncate text-xs">{member.email}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 gap-1.5 text-xs"
                                        onClick={() => addMember({ projectId, userId: member.userId })}
                                        disabled={isAdding}
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {available.length === 0 && members.length > 0 && (
                        <p className="text-muted-foreground border-t py-2 pt-4 text-center text-xs">
                            All workspace members are already in this project.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
