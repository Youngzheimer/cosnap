import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/index";
import { auths } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "$lib/server/jwt";
import { dev } from '$app/environment';
import { redirect } from "@sveltejs/kit";
import { generateSession } from "$lib/server/reftoken";

export const load: PageServerLoad = async () => {
    if (!dev) {
        redirect(302, '/');
    }

    const allAuths = db.select().from(auths).all();

    return { allAuths: allAuths.map(auth => ({ ID: auth.ID, name: auth.name, pfp: auth.pfp })) };
};

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const fromData = await request.formData();
        const ID = fromData.get("ID");

        if (typeof ID !== "string") {
            return { success: false, error: "ID is required" };
        }

        const auth = db.select().from(auths).where(eq(auths.ID, ID)).get();

        if (!auth) {
            return { success: false, error: "Auth not found" };
        }

        const session = await generateSession(auth.ID);

        const jwt = generateToken({ id: auth.ID, role: "photographer" }); // FIXME
        cookies.set("token", jwt, { path: "/" });
        cookies.set("reftoken", session.reftokenID, { path: "/" });
        
        return { success: true };
    }
}