import type { Handle } from '@sveltejs/kit';
import { refreshSession } from '$lib/server/reftoken';
import { verifyToken, generateToken } from '$lib/server/jwt';

export const handle: Handle = async ({ event, resolve }) => {
    // get jwt
    const token = event.cookies.get('token');

    if (token) {
        const user = verifyToken(token);

        if (user) {
            event.locals.user = user;
        } else {
            // try to refresh the session with the refresh token
            const reftoken = event.cookies.get('reftoken');

            if (reftoken) {
                try {
                    const { sessionID, reftokenID } = await refreshSession(reftoken);

                    // generate new jwt
                    // FIXME: hardcoding role for now since we only have one role
                    const newToken = generateToken({ id: sessionID, role: "photographer" });
                    event.cookies.set('token', newToken, { httpOnly: true, path: '/' });
                    event.cookies.set('reftoken', reftokenID, { httpOnly: true, path: '/' });

                    event.locals.user = { id: sessionID, role: "photographer" }; // FIXME
                } catch {
                    // invalid refresh token - clear cookies
                    event.cookies.delete('token', { path: '/' });
                    event.cookies.delete('reftoken', { path: '/' });
                }
            }
        }
    }

    return resolve(event);
};