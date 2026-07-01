import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";

async function main() {
    const result = await db.select().from(users);
    console.log("Connected! Users:", result);
}

main().catch(console.error);
