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
            <div className="flex items-center justify-center h-full">
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
        <div className="max-w-2xl mx-auto px-6 py-16">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
                <Button
                    size="sm"
                    onClick={() => router.push("/onboarding")}
                >
                    <Plus className="h-4 w-4 mr-1" />
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
                            hidden:  { opacity: 0, y: 12 },
                            visible: { opacity: 1, y: 0 },
                        }}
                    >
                        <Card
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => router.push(`/${ws.slug}`)}
                        >
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                                    <Layout className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{ws.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        taska.app/{ws.slug}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}