"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWorkspaces, useCreateWorkspace } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layout } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const { data: workspaces, isPending } = useWorkspaces();

    if (isPending) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
        );
    }

    // No workspaces — send to onboarding
    if (!workspaces || workspaces.length === 0) {
        router.push("/onboarding");
        return null;
    }

    return (
        <div className="mx-auto max-w-2xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
                <Button size="sm" onClick={() => router.push("/onboarding")}>
                    <Plus className="mr-1 h-4 w-4" />
                    New
                </Button>
            </div>

            <motion.div
                className="flex flex-col gap-3"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.07 } },
                }}
            >
                {workspaces.map((ws) => (
                    <motion.div
                        key={ws.id}
                        variants={{
                            hidden: { opacity: 0, y: 12 },
                            visible: { opacity: 1, y: 0 },
                        }}
                    >
                        <Card
                            className="hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => router.push(`/${ws.slug}`)}
                        >
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-md">
                                    <Layout className="text-primary h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{ws.name}</p>
                                    <p className="text-muted-foreground text-xs">taska.app/{ws.slug}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
