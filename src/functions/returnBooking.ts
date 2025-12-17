import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { returnDevice } from "../usecases/returnDevice";
import { getUserFromRequest } from "../auth/validateToken";
import { requireRole } from "../auth/checkRole";

export async function returnBooking(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        // 🔥 1. 验证 Token
        const user = await getUserFromRequest(request);

        // 🔥 2. staff 才能归还
        requireRole(user, "staff");

        const bookingId = request.params.id;
        context.log("Step 1: returnBooking called with ID =", bookingId);

        // 🔥 3. 调用业务逻辑
        const result = await returnDevice(bookingId);
        context.log("Step 4: returnDevice finished:", result);

        return {
            status: 200,
            jsonBody: result
        };

    } catch (err: any) {
        context.log("Step ERROR:", err.message);
        return {
            status: err.statusCode ?? 409,
            jsonBody: { error: err.message }
        };
    }
}

app.http("returnBooking", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "bookings/{id}/return",
    handler: returnBooking
});
