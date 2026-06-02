// get card by id
import { db } from "$lib/server/db/index";
import { cards } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
    const { id } = await request.json();

    if (!id) {
        return new Response("card ID is required", { status: 400 });
    }

    const card = db.select().from(cards).where(eq(cards.ID, id)).get();

    if (!card) {
        return new Response("card not found", { status: 404 });
    }

    return new Response(JSON.stringify(card), {
        headers: { "Content-Type": "application/json" },
    });
};