import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosBookingRepo } from "../adapters/cosmosBookingRepo";
import { getUserFromRequest } from "../auth/validateToken";
import { requireRole } from "../auth/checkRole";

export async function getAllBookings(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const repo = CosmosBookingRepo.getInstance();
        const user = await getUserFromRequest(request);
        requireRole(user, "staff");
        const items = await repo.listAll();
        return { status: 200, jsonBody: items };
    } catch (err: any) {
        return { status: err.statusCode ?? 401, jsonBody: { error: err.message } };
    }
}

app.http("getAllBookings", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "bookings",
    handler: getAllBookings
});

