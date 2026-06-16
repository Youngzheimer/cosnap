import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from "$lib/server/db/index";
import { events } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const actions: Actions = {
    delete: async (event) => {
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

        await db.delete(events).where(eq(events.ID, eventId));

        throw redirect(303, '/events');
    }
};