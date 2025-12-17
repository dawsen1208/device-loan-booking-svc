// src/auth/checkRole.ts
import type { AuthUser } from "./validateToken";

export function requireRole(user: AuthUser, role: string) {
    if (!user.roles.includes(role)) {
        const err: any = new Error(`Forbidden: ${role} role required`);
        err.statusCode = 403;
        throw err;
    }
}
