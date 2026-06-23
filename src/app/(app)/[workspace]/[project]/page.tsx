"use client";

import { use } from "react";
import { useProjects, useWorkspaces } from "@/hooks";
import { Board } from "@/components/board/Board";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectPage({
                                        params,
                                    }: {
    params: Promise<{ workspace: string; project: string }>;
}) {
    const { workspace: slug, project: projectId } = use(params);
    const router = useRouter();

    const { data: workspaces } = useWorkspaces();
    const workspace = workspaces?.find((w) => w.slug === slug);
    const { data: projects } = useProjects(workspace?.id ?? "");
    const project = projects?.find((p) => p.id === projectId);

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => router.push(`/${slug}`)}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-sm font-semibold">{project?.name}</h1>
                    <p className="text-xs text-muted-foreground">
                        {project?.identifier}
                    </p>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-hidden pt-4">
                <Board projectId={projectId} />
            </div>
        </div>
    );
}