import { loadFlash } from 'sveltekit-flash-message/server';
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db/index";
import { auths } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { redirect } from "@sveltejs/kit";
import { generateSession } from "$lib/server/reftoken";
import { generateToken } from "$lib/server/jwt";

export const load: PageServerLoad = loadFlash(async () => {
    return {};
});

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const displayID = formData.get("displayID");
        const password = formData.get("password");

        if (typeof displayID !== "string" || typeof password !== "string") {
            return fail(400, { error: "아이디 또는 패스워드가 잘못되었습니다." });
        }

        const auth = await db.select().from(auths).where(eq(auths.displayID, displayID)).get();

        if (!auth) {
            return fail(400, { error: "아이디 또는 패스워드가 잘못되었습니다." });
        }

        const passwordMatch = await bcrypt.compare(password, auth.passwordHash);

        if (!passwordMatch) {
            return fail(400, { error: "아이디 또는 패스워드가 잘못되었습니다." });
        }

        const { sessionID, reftokenID } = await generateSession(auth.ID);
        const token = generateToken(sessionID);

        cookies.set("reftoken", reftokenID, { path: "/", httpOnly: true, sameSite: "strict" });
        cookies.set("token", token, { path: "/", httpOnly: true, sameSite: "strict" });

        throw redirect(302, "/events");
    }
};
