import { RPCHandler } from "@orpc/server/fetch";
import { router } from "@/orpc/router";

const handler = new RPCHandler(router);

async function handleRequest(request: Request) {
    const { response } = await handler.handle(request, {
        prefix: "/api",
        context: {},
    });
    return response ?? new Response("Not found", { status: 404 });
}

export const GET  = handleRequest;
export const POST = handleRequest;