import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight">Taska</h1>
        <p className="text-muted-foreground text-lg">
          Project management for modern teams
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
  );
}