import { createORPCReactQueryUtils } from "@orpc/react-query";
import { client } from "./client";

export const orpc = createORPCReactQueryUtils(client);