import z from "zod";

export type JsonBodyResult =
    | { success: true; data: unknown }
    | { success: false };

export async function readJsonBody(
    request: Pick<Request, "json">,
): Promise<JsonBodyResult> {
    try {
        return {
            success: true,
            data: await request.json(),
        };
    } catch (error) {
        if (error instanceof SyntaxError || error instanceof TypeError) {
            return { success: false };
        }

        throw error;
    }
}

export function parseBody<T extends z.ZodType>(
    schema: T,
    body: unknown
): z.infer<T> {
    return schema.parse(body);
}