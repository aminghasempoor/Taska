"use client";

import { useProjectMembers } from "@/hooks";
import { useUpdateIssue } from "@/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle, X } from "lucide-react";

export function AssigneePicker({
    projectId,
    issueId,
    assigneeId,
}: {
    projectId: string;
    issueId: string;
    assigneeId: string | null;
}) {
    const { data: members = [] } = useProjectMembers(projectId);
    const { mutate: updateIssue } = useUpdateIssue();

    const assignee = members.find((m) => m.userId === assigneeId);

    function assign(userId: string | null) {
        updateIssue({ id: issueId, assigneeId: userId });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-full justify-start gap-2 text-xs">
                    {assignee ? (
                        <>
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={assignee.avatarUrl ?? ""} />
                                <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{assignee.name}</span>
                        </>
                    ) : (
                        <>
                            <UserCircle className="text-muted-foreground h-4 w-4" />
                            <span className="text-muted-foreground">No assignee</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-52">
                {members.length === 0 ? (
                    <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                        No members in this project yet.
                    </p>
                ) : (
                    members.map((member) => (
                        <DropdownMenuItem key={member.userId} onClick={() => assign(member.userId)} className="gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatarUrl ?? ""} />
                                <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm">{member.name}</span>
                            {member.userId === assigneeId && (
                                <span className="text-muted-foreground ml-auto text-xs">✓</span>
                            )}
                        </DropdownMenuItem>
                    ))
                )}

                {assigneeId && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => assign(null)} className="text-muted-foreground gap-2">
                            <X className="h-4 w-4" />
                            Remove assignee
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
