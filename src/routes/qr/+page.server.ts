import type { PageServerLoad } from './$types';
import { db } from "$lib/server/db/index";
import { cards, events, auths } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ url }) => {
    const id = url.searchParams.get("id");

    if (!id) {
        return {
            error: "Card ID is required",
            card: null,
            event: null,
            auth: null
        }
    }

    const card = db.select().from(cards).where(eq(cards.ID, id)).get();

    if (!card) {
        return {
            error: "Card not found",
            card: null,
            event: null,
            auth: null
        };
    }

    const event = db.select().from(events).where(eq(events.ID, card.eventID)).get();

    if (!event) {
        return {
            error: "Event not found",
            card,
            event: null,
            auth: null
        };
    }

    const auth = db.select().from(auths).where(eq(auths.ID, card.authID)).get();

    if (!auth) {
        return {
            error: "Auth not found",
            card,
            event: null,
            auth: null
        };
    }

    const bluredAuth = {
        ID: auth.ID,
        name: auth.name,
        pfp: auth.pfp,
        publicInfo: JSON.parse(auth.publicInfo)
    }

    return { error: null, card, event, auth: bluredAuth };
};