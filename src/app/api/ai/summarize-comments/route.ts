import { generateText } from "ai";
import { model } from "@/lib/ai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { issueId } = await req.json();

    const issueComments = await db
        .select()
        .from(comments)
        .where(eq(comments.issueId, issueId));

    if (issueComments.length === 0) {
        return Response.json({ summary: "No comments to summarize." });
    }

    const commentText = issueComments
        .map((c, i) => `Comment ${i + 1}: ${c.body}`)
        .join("\n");

    try {
        const { text } = await generateText({
            model,
            system: `You are a project management assistant.
               Summarize discussion threads concisely.
               Focus on decisions made and action items.
               Keep it under 80 words.`,
            prompt: `Summarize these comments on a project issue:\n\n${commentText}`,
        });

        return Response.json({ summary: text });
    } catch (err) {
        console.error("AI summarize error:", err);
        return Response.json(
            { summary: "Could not generate summary. Try again." },
            { status: 200 } // return 200 so the client doesn't throw
        );
    }
}