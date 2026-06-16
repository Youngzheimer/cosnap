import type { PageServerLoad } from './$types';
import { db } from "$lib/server/db/index";
import { events, cards } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    const eventId = event.params.id;

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
    
    const cardList = await db.select().from(cards).where(eq(cards.eventID, eventId));
    
    return { event: eventData, cards: cardList };
};