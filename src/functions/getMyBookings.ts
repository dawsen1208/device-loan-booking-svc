import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosBookingRepo } from "../adapters/cosmosBookingRepo";
import { getUserFromRequest } from "../auth/validateToken";

export async function getMyBookings(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const repo = CosmosBookingRepo.getInstance();
        const user = await getUserFromRequest(request);
        const items = await repo.getByUserId(user.sub);
        return { status: 200, jsonBody: items };
    } catch (err: any) {
        return { status: err.statusCode ?? 401, jsonBody: { error: err.message } };
    }
}

app.http("getMyBookings", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "bookings/me",
    handler: getMyBookings
});

