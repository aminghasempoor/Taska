"use client";

import { useState } from "react";
import {
    useProjectMembers,
    useAvailableMembers,
    useAddProjectMember,
    useRemoveProjectMember,
} from "@/hooks";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ManageMembersDialog({
                                        projectId,
                                        workspaceId,
                                    }: {
    projectId:   string;
    workspaceId: string;
}) {
    const [open, setOpen] = useState(false);

    const { data: members   = [] } = useProjectMembers(projectId);
    const { data: available = [] } = useAvailableMembers(projectId, workspaceId);

    const { mutate: addMember, isPending: isAdding } = useAddProjectMember(
        projectId,
        workspaceId
    );
    const { mutate: removeMember, isPending: isRemoving } = useRemoveProjectMember(projectId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
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
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Current members ({members.length})
                        </p>
                        <AnimatePresence>
                            {members.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2">
                                    No members yet.
                                </p>
                            ) : (
                                members.map((member) => (
                                    <motion.div
                                        key={member.userId}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        className="flex items-center gap-3 p-2 rounded-lg
                               hover:bg-muted/50 group"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatarUrl ?? ""} />
                                            <AvatarFallback className="text-xs">
                                                {member.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {member.email}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 opacity-0 group-hover:opacity-100
                                 transition-opacity text-muted-foreground
                                 hover:text-destructive"
                                            onClick={() =>
                                                removeMember({ projectId, userId: member.userId })
                                            }
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
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Add from workspace
                            </p>
                            {available.map((member) => (
                                <motion.div
                                    key={member.userId}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 p-2 rounded-lg
                             hover:bg-muted/50"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatarUrl ?? ""} />
                                        <AvatarFallback className="text-xs">
                                            {member.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {member.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {member.email}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs gap-1.5"
                                        onClick={() =>
                                            addMember({ projectId, userId: member.userId })
                                        }
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
                        <p className="text-xs text-muted-foreground text-center py-2 border-t pt-4">
                            All workspace members are already in this project.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}