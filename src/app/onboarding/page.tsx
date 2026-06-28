"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSyncUser, useCreateWorkspace } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const { mutateAsync: syncUser } = useSyncUser();
    const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [step, setStep] = useState<"syncing" | "workspace">("syncing");
    const [error, setError] = useState("");

    // Step 1: sync Clerk user to our DB
    useEffect(() => {
        if (!isLoaded || !user) return;

        syncUser({
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: user.fullName ?? user.firstName ?? "User",
            avatarUrl: user.imageUrl,
        }).then(() => setStep("workspace"));
    }, [isLoaded, user, syncUser]);

    // Auto-generate slug from workspace name
    function handleNameChange(value: string) {
        setName(value);
        setSlug(
            value
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .slice(0, 30)
        );
    }

    async function handleCreate() {
        if (!name.trim() || !slug.trim()) return;
        setError("");

        try {
            const workspace = await createWorkspace({ name, slug });
            router.push(`/${workspace.slug}`);
        } catch (e: any) {
            setError(e?.message ?? "Something went wrong");
        }
    }

    if (step === "syncing") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground">
                    Setting up your account...
                </motion.p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Create your workspace</CardTitle>
                        <CardDescription>A workspace is where your team manages projects and issues.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">Workspace name</label>
                            <Input
                                placeholder="Acme Inc."
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">URL slug</label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-sm">taska.app/</span>
                                <Input placeholder="acme" value={slug} onChange={(e) => setSlug(e.target.value)} />
                            </div>
                            <p className="text-muted-foreground text-xs">Lowercase letters, numbers and hyphens only</p>
                        </div>

                        {error && <p className="text-destructive text-sm">{error}</p>}

                        <Button
                            onClick={handleCreate}
                            disabled={isPending || !name.trim() || !slug.trim()}
                            className="w-full"
                        >
                            {isPending ? "Creating..." : "Create workspace"}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
