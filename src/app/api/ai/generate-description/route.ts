import { model } from "@/lib/ai";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { title, projectName } = await req.json();

    const result = streamText({
        model,
        system: `You are a helpful project management assistant. 
             Write clear, concise issue descriptions for software projects.
             Use markdown formatting.
             Be specific and actionable.
             Keep it under 150 words.`,
        prompt: `Write a description for this issue in project "${projectName}":
             Title: "${title}"

             Include:
             - What needs to be done
             - Why it matters
             - Acceptance criteria (2-3 bullet points)`,
    });

    return new Response(result.textStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
