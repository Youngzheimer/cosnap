import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { db } from "$lib/server/db/index";
import { auths, sessions } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

interface UserPayload {
    id: string;
    name: string;
    pfp: string;
    role: string;
}

export function generateToken(sessionID: string): string {
    const session = db.select().from(sessions).where(eq(sessions.ID, sessionID)).get();

    if (!session) {
        throw new Error("Session not found");
    }

    const auth = db.select().from(auths).where(eq(auths.ID, session.authID)).get();

    if (!auth) {
        throw new Error("Auth not found for session ID");
    }

    const payload: UserPayload = {
        id: auth.ID,
        name: auth.name,
        pfp: auth.pfp,
        role: "photographer" // FIXME: hardcoding role for now since we only have one role
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
}

export function verifyToken(token: string): UserPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch {
        return null;
    }
}