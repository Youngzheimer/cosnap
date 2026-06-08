import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index';
import { sessions, reftokens } from '$lib/server/db/schema';
import { v4 as uuidv4 } from 'uuid';

const REF_TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 24 * 14; // 14 days

export async function generateSession(authID: string) {
    const sessionID = uuidv4();

    const now = Date.now();

    await db.insert(sessions).values({
        ID: sessionID,
        authID,
        createdAt: now
    });

    const reftokenID = await generateRefToken(sessionID);

    return { sessionID, reftokenID };

}

async function generateRefToken(sessionID: string) {
    const reftokenID = uuidv4();

    const now = Date.now();

    await db.insert(reftokens).values({
        ID: reftokenID,
        sessionID,
        createdAt: now,
        expiresAt: now + REF_TOKEN_EXPIRES_IN,
        used: false,
        usedAt: 0
    });

    return reftokenID;
}

export async function refreshSession(reftokenID: string) {
    const [reftoken] = await db.select().from(reftokens).where(eq(reftokens.ID, reftokenID));

    if (!reftoken || reftoken.expiresAt < Date.now()) {
        throw new Error('Invalid refresh token');
    }

    if (reftoken.used) {
        // This session has been hacked - deactivate all the fkn ref tokens
        await db.update(reftokens).set({ used: true, usedAt: Date.now() }).where(eq(reftokens.sessionID, reftoken.sessionID));
        throw new Error('Refresh token has already been used');
    }

    const sessionID = reftoken.sessionID;

    await db.update(reftokens).set({ used: true, usedAt: Date.now() }).where(eq(reftokens.ID, reftokenID)).run();

    const newReftokenID = await generateRefToken(sessionID);

    return { sessionID, reftokenID: newReftokenID };
}