"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaces, useProjects } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderKanban, Plus, Settings, LogOut, ChevronsUpDown, Layout } from "lucide-react";
import { CopyInviteLink } from "@/components/sidebar/CopyInviteLink";

export function Sidebar() {
    const router = useRouter();
    const params = useParams<{ workspace: string; projectId: string }>();

    const { user } = useUser();
    const { signOut } = useClerk();
    const { data: workspaces } = useWorkspaces();
    const currentWorkspace = workspaces?.find((w) => w.slug === params.workspace);
    const { data: projects } = useProjects(currentWorkspace?.id ?? "");

    return (
        <aside className="bg-background flex h-screen w-56 shrink-0 flex-col border-r">
            {/* Workspace switcher */}
            <div className="border-b p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-full justify-between px-2 font-medium">
                            <div className="flex items-center gap-2 truncate">
                                <div className="bg-primary/10 flex h-5 w-5 shrink-0 items-center justify-center rounded">
                                    <Layout className="text-primary h-3 w-3" />
                                </div>
                                <span className="truncate text-sm">{currentWorkspace?.name ?? "Select workspace"}</span>
                            </div>
                            <ChevronsUpDown className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                        {workspaces?.map((ws) => (
                            <DropdownMenuItem key={ws.id} onClick={() => router.push(`/${ws.slug}`)} className="gap-2">
                                <div className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded">
                                    <Layout className="text-primary h-3 w-3" />
                                </div>
                                {ws.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/onboarding")} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New workspace
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Projects list */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="mb-1 flex items-center justify-between px-1">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Projects</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => router.push(`/${params.workspace}`)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                </div>

                <AnimatePresence>
                    {projects?.map((project) => {
                        const isActive = params.projectId === project.id;
                        return (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Link href={`/${params.workspace}/${project.id}`}>
                                    <div
                                        className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                                            isActive
                                                ? "bg-accent text-accent-foreground font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                        } `}
                                    >
                                        <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{project.name}</span>
                                        <span className="text-muted-foreground ml-auto text-xs">
                                            {project.identifier}
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {projects?.length === 0 && <p className="text-muted-foreground px-2 py-2 text-xs">No projects yet</p>}
            </div>

            {currentWorkspace && (
                <div className="mt-2 px-1">
                    <CopyInviteLink slug={currentWorkspace.slug} />
                </div>
            )}

            {/* User menu */}
            <div className="border-t p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-full justify-start gap-2 px-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={user?.imageUrl} />
                                <AvatarFallback className="text-xs">{user?.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm">{user?.fullName ?? user?.firstName}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top" className="w-52">
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">{user?.fullName ?? user?.firstName}</p>
                            <p className="text-muted-foreground truncate text-xs">
                                {user?.emailAddresses[0].emailAddress}
                            </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive gap-2"
                            onClick={() => signOut(() => router.push("/"))}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
