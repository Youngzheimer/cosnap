import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/index';
import { auths } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { id } = await request.json();

        if (typeof id !== 'string') {
            return json({ error: 'ID is required' }, { status: 400 });
        }

        const existingAuth = await db.select().from(auths).where(eq(auths.displayID, id)).get();
        const isDuplicate = !!existingAuth;

		return json({ isDuplicate });
	} catch {
		return json({ error: 'Invalid request' }, { status: 400 });
	}
};
