"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";

export function CopyInviteLink({ slug }: { slug: string }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        const url = `${window.location.origin}/join/${slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs text-muted-foreground
                 hover:text-foreground h-7 px-2"
            onClick={handleCopy}
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600">Link copied!</span>
                </>
            ) : (
                <>
                    <Link2 className="h-3.5 w-3.5" />
                    Copy invite link
                </>
            )}
        </Button>
    );
}