import type { PageServerLoad, Actions } from './$types';
import { db } from "$lib/server/db/index";
import { cards, events, auths } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { fail, error } from '@sveltejs/kit';
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

ajv.addKeyword("placeholder");
ajv.addKeyword("formType");

export const load: PageServerLoad = async ({ url }) => {
    const id = url.searchParams.get("id");

    if (!id) {
        return error(400, "Card ID is required");
    }

    const card = db.select().from(cards).where(eq(cards.ID, id)).get();

    if (!card) {
        return error(404, "Card not found");
    }

    if (card.submitted) {
        return error(400, "Card already submitted");
    }

    const event = db.select().from(events).where(eq(events.ID, card.eventID)).get();

    if (!event) {
        return error(404, "Event not found");
    }

    const auth = db.select().from(auths).where(eq(auths.ID, card.authID)).get();

    if (!auth) {
        return error(404, "Auth not found");
    }

    const bluredAuth = {
        ID: auth.ID,
        name: auth.name,
        pfp: auth.pfp,
        publicInfo: JSON.parse(auth.publicInfo)
    }

    return { error: null, card, event, auth: bluredAuth };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const cardID = formData.get("cardID");  

        if (typeof cardID !== "string") {
            return fail(400, { error: "Card ID is required" });
        }

        const card = db.select().from(cards).where(eq(cards.ID, cardID)).get();

        if (!card) {
            return fail(404, { error: "Card not found" });
        }

        const event = db.select().from(events).where(eq(events.ID, card.eventID)).get();

        if (!event) {
            return fail(404, { error: "Event not found" });
        }

        // Check if already submitted
        if (card.submitted) {
            return fail(400, { error: "Card already submitted" });
        }

        const submittedData: {
            [k: string]: FormDataEntryValue | boolean; // allow boolean for checkbox values
        } = Object.fromEntries(formData.entries()); 
        delete submittedData.cardID;
        
        try {
            const schema = JSON.parse(event.schema);

            // convert checkbox values to boolean
            for (const key of Object.keys(schema.properties || {})) {
                if (schema.properties?.[key]?.type === "boolean") {
                    submittedData[key] = submittedData[key] === "on" ? false : true;
                }
            }

            const validate = ajv.compile(schema);
            const valid = validate(submittedData);

            if (!valid) {
                return fail(400, { error: "Invalid data", details: validate.errors });
            }
        } catch {
            return fail(400, { error: `Invalid event schema` });
        }

        db.update(cards)
            .set({ data: JSON.stringify(submittedData), submitted: true, submittedAt: Date.now() })
            .where(eq(cards.ID, cardID))
            .run();

        return { success: true };
    }
}