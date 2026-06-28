"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProjects, useCreateProject } from "@/hooks";
import { useWorkspaces } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";

export default function WorkspacePage({ params }: { params: Promise<{ workspace: string }> }) {
    const { workspace: slug } = use(params);
    const router = useRouter();

    const { data: workspaces } = useWorkspaces();
    const workspace = workspaces?.find((w) => w.slug === slug);

    const { data: projectList, isPending } = useProjects(workspace?.id ?? "");
    const { mutate: createProject, isPending: isCreating } = useCreateProject();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [identifier, setIdentifier] = useState("");

    function handleNameChange(value: string) {
        setName(value);
        setIdentifier(
            value
                .toUpperCase()
                .replace(/[^A-Z]/g, "")
                .slice(0, 4)
        );
    }

    function handleCreate() {
        if (!workspace || !name || !identifier) return;
        createProject(
            { name, identifier, workspaceId: workspace.id },
            {
                onSuccess: (project) => {
                    setOpen(false);
                    setName("");
                    setIdentifier("");
                    router.push(`/${slug}/${project.id}`);
                },
            }
        );
    }

    if (isPending) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading projects...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{workspace?.name}</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">Projects</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-1 h-4 w-4" />
                            New project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New project</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 pt-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    placeholder="Engineering"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium">Identifier</label>
                                <Input
                                    placeholder="ENG"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value.toUpperCase().slice(0, 4))}
                                />
                                <p className="text-muted-foreground text-xs">Used as issue prefix e.g. ENG-1, ENG-2</p>
                            </div>
                            <Button onClick={handleCreate} disabled={isCreating}>
                                {isCreating ? "Creating..." : "Create project"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {projectList?.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">No projects yet. Create one above.</p>
            ) : (
                <motion.div
                    className="flex flex-col gap-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.07 } },
                    }}
                >
                    {projectList?.map((project) => (
                        <motion.div
                            key={project.id}
                            variants={{
                                hidden: { opacity: 0, y: 12 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <Card
                                className="hover:bg-accent cursor-pointer transition-colors"
                                onClick={() => router.push(`/${slug}/${project.id}`)}
                            >
                                <CardContent className="flex items-center gap-4 py-4">
                                    <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-md">
                                        <FolderKanban className="text-primary h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{project.name}</p>
                                        <p className="text-muted-foreground text-xs">{project.identifier}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
