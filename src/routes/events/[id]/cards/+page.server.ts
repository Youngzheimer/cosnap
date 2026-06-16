import type { Actions } from './$types';
import { db } from "$lib/server/db/index";
import { events, cards } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const actions: Actions = {
    default: async (event) => {
        const user = event.locals.user;
        const eventId = event.params.id;
        const formData = await event.request.formData();
        const cardNum = formData.get("cardNum");

        if (!eventId) {
            return { error: "Event ID is required" };
        }

        const [eventData] = await db.select().from(events).where(eq(events.ID, eventId));
        
        if (!eventData) {
            return { error: "Event not found" };
        }

        if (eventData.authID !== user!.id) {
            return { error: "Unauthorized access to this event" };
        }

        if (!cardNum || typeof cardNum !== "string" || isNaN(Number(cardNum))) {
            return { error: "Invalid card number" };
        }

        const newCards = Array.from({ length: Number(cardNum) }, (_, i) => ({
            ID: crypto.randomUUID(),
            authID: user!.id,
            eventID: eventId,
            index: i,
            submitted: false,
            submittedAt: 0,
            data: "{}"
        }));

        await db.insert(cards).values(newCards);

        return { success: true };
    }
};