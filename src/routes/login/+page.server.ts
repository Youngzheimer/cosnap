import type { Actions } from "./$types";
import { db } from "$lib/server/db/index";
import { auths } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { generateSession } from "$lib/server/reftoken";
import { generateToken } from "$lib/server/jwt";

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const displayID = formData.get("displayID");
        const password = formData.get("password");

        if (typeof displayID !== "string" || typeof password !== "string") {
            return fail(400, { error: "Display ID and password are required" });
        }

        const auth = await db.select().from(auths).where(eq(auths.displayID, displayID)).get();

        if (!auth) {
            return fail(400, { error: "Invalid display ID or password" });
        }

        const passwordMatch = await bcrypt.compare(password, auth.passwordHash);

        if (!passwordMatch) {
            return fail(400, { error: "Invalid display ID or password" });
        }

        const { sessionID, reftokenID } = await generateSession(auth.ID);
        const token = generateToken({ id: auth.ID, role: "user" });

        cookies.set("sessionID", sessionID, { path: "/", httpOnly: true, sameSite: "strict" });
        cookies.set("reftokenID", reftokenID, { path: "/", httpOnly: true, sameSite: "strict" });
        cookies.set("token", token, { path: "/", httpOnly: true, sameSite: "strict" });

        return { success: "Logged in successfully!" };
    }
};
