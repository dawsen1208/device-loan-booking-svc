import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { reserveDevice } from "../usecases/reserveDevice";
import { getUserFromRequest } from "../auth/validateToken";

export async function createBooking(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        // 🔥 1. 获取登录用户
        const user = await getUserFromRequest(request); 

        const body = await request.json() as { deviceModel: string };
        if (!body?.deviceModel) {
            return {
                status: 400,
                jsonBody: { error: "deviceModel is required" }
            };
        }

        // 🔥 2. 调用业务逻辑（使用真实用户 ID）
        const booking = await reserveDevice({
            userId: user.sub,     // ← 已替换 test-user
            deviceModel: body.deviceModel
        });

        return {
            status: 201,
            jsonBody: booking
        };

    } catch (err: any) {
        context.error("createBooking error:", err);
        
        // 1. 优先提取 Axios 响应状态码
        if (err.response?.status) {
            return {
                status: err.response.status,
                jsonBody: { 
                    error: `Inventory Service Error: ${err.response.status}`,
                    details: err.response.data 
                }
            };
        }

        // 2. 处理网络错误
        const msg = err?.message || "Unknown error";
        const isNetwork = /ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ECONNRESET|getaddrinfo/i.test(msg);
        
        if (isNetwork) {
             return { status: 502, jsonBody: { error: `Network Error: ${msg}` } };
        }

        // 3. 默认错误
        return { 
            status: err.statusCode ?? 409, 
            jsonBody: { error: msg } 
        };
    }
}

app.http("createBooking", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "bookings",
    handler: createBooking
});
