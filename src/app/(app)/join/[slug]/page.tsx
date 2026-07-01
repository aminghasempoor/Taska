"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/orpc/client";
import { motion } from "framer-motion";

export default function JoinPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();

    const {
        mutate: join,
        isPending,
        isError,
    } = useMutation({
        mutationFn: () => client.workspace.join({ slug }),
        onSuccess: (workspace) => {
            router.push(`/${workspace.slug}`);
        },
    });

    // Auto-join on mount
    useEffect(() => {
        join();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 text-center"
            >
                {isError ? (
                    <>
                        <p className="text-destructive font-medium">Invalid invite link.</p>
                        <p className="text-muted-foreground text-sm">Ask your team for a new one.</p>
                    </>
                ) : (
                    <>
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                        <p className="text-muted-foreground text-sm">
                            {isPending ? "Joining workspace..." : "Redirecting..."}
                        </p>
                    </>
                )}
            </motion.div>
        </div>
    );
}
