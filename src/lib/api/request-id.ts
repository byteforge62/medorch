import { randomUUID } from "crypto";

export function getRequestId(request: Request){
    return request.headers.get("x-request-id") ?? randomUUID();
}