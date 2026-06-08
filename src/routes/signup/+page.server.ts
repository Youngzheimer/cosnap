import type { Actions } from './$types';
import { db } from "$lib/server/db/index";
import { auths } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const displayID = formData.get("displayID");
        const password = formData.get("password");
        const name = formData.get("name");
        
        if (typeof displayID !== "string" || typeof password !== "string" || typeof name !== "string") {
            return fail(400, { error: "Display ID, password, and name are required" });
        }

        // check if display id is already taken
        const existingAuth = await db.select().from(auths).where(eq(auths.displayID, displayID as string)).get();

        if (existingAuth) {
            return fail(400, { error: "Display ID is already taken" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newAuth = {
            ID: uuidv4(),
            displayID,
            passwordHash,
            name: name,
            pfp: "https://api.dicebear.com/6.x/initials/svg?seed=" + encodeURIComponent(displayID),
            publicInfo: JSON.stringify({}),
            info: JSON.stringify({})
        };

        await db.insert(auths).values(newAuth);

        return { success: "Account created successfully! You can now log in." };
    }
};