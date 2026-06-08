import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

interface UserPayload {
    id: string;
    role: string;
}

export function generateToken(user: UserPayload): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '30m' });
}

export function verifyToken(token: string): UserPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch {
        return null;
    }
}