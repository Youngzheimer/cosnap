import type { Actions, PageServerLoad } from './$types';
import { db } from "$lib/server/db/index";
import { events } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;

    const userEvents = await db.select().from(events).where(eq(events.authID, user!.id)).all();

    return { events: userEvents };
};

export const actions: Actions = {
    // makeEvent: async (event) => {
    // }
};