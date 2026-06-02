// get event by id
import { db } from "$lib/server/db/index";
import { events } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
    const { id } = await request.json();

    if (!id) {
        return new Response("event ID is required", { status: 400 });
    }

    const event = db.select().from(events).where(eq(events.ID, id)).get();

    if (!event) {
        return new Response("event not found", { status: 404 });
    }

    return new Response(JSON.stringify(event), {
        headers: { "Content-Type": "application/json" },
    });
};