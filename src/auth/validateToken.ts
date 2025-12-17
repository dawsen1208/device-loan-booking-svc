// src/auth/validateToken.ts
import { HttpRequest } from "@azure/functions";
import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;
const ROLE_CLAIM = "https://cdls-api/roles";

const JWKS = createRemoteJWKSet(
    new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
);

export interface AuthUser {
    sub: string;
    email?: string;
    roles: string[];
}

export async function getUserFromRequest(req: HttpRequest): Promise<AuthUser> {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const err: any = new Error("Missing Bearer token");
        err.statusCode = 401;
        throw err;
    }

    const token = authHeader.replace("Bearer ", "").trim();

    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `https://${AUTH0_DOMAIN}/`,
            audience: AUTH0_AUDIENCE
        });

        const roles = (payload[ROLE_CLAIM] as string[]) ?? [];

        return {
            sub: payload.sub as string,
            email: payload.email as string | undefined,
            roles
        };

    } catch (e) {
        const err: any = new Error("Invalid or expired token");
        err.statusCode = 401;
        throw err;
    }
}
