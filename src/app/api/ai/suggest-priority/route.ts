import { generateText } from "ai";
import { model } from "@/lib/ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { title, description } = await req.json();

    const { text } = await generateText({
        model,
        system: `You are a project management assistant.
             You MUST respond with ONLY a valid JSON object, no markdown, no explanation.
             Example: {"priority":"high","reason":"Major feature is broken"}`,
        prompt: `Suggest priority for this issue:
             Title: "${title}"
             Description: "${description || "No description provided"}"
             
             Priority levels:
             urgent = production down, data loss, security breach
             high   = major feature broken, significant user impact
             medium = feature partially broken, workaround exists
             low    = minor issue, cosmetic, nice to have
             none   = unclear or trivial
             
             Respond with JSON only: {"priority":"...","reason":"..."}`,
    });

    try {
        // Strip markdown code blocks if model wraps in ```json
        const clean  = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        return Response.json(parsed);
    } catch {
        // Fallback if model doesn't follow instructions
        return Response.json({ priority: "none", reason: "Could not determine priority." });
    }
}