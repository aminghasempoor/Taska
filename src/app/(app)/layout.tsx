import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    return (
        <div className="flex h-screen overflow-hidden">
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}
