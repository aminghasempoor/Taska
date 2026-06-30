"use client";

import { useState } from "react";
import { useInviteMember } from "@/hooks";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, Check } from "lucide-react";

export function InviteDialog({
                                 workspaceId,
                                 slug,
                             }: {
    workspaceId: string;
    slug:        string;
}) {
    const [open,  setOpen]  = useState(false);
    const [email, setEmail] = useState("");
    const [sent,  setSent]  = useState(false);

    const { mutate: invite, isPending } = useInviteMember();

    function handleInvite() {
        if (!email.trim()) return;

        invite(
            { email, workspaceId, slug },
            {
                onSuccess: () => {
                    setSent(true);
                    setEmail("");
                    setTimeout(() => {
                        setSent(false);
                        setOpen(false);
                    }, 2000);
                },
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs
                     text-muted-foreground hover:text-foreground h-7 px-2"
                >
                    <Mail className="h-3.5 w-3.5" />
                    Invite by email
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Invite teammate</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 pt-2">
                    <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                        autoFocus
                    />

                    <Button
                        onClick={handleInvite}
                        disabled={isPending || !email.trim() || sent}
                        className="gap-2"
                    >
                        {sent ? (
                            <>
                                <Check className="h-4 w-4" />
                                Invite sent!
                            </>
                        ) : isPending ? (
                            "Sending..."
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send invite
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        They&#39;ll receive an email with a link to join this workspace.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}