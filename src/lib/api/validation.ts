import z from "zod";

export function parseBody<T extends z.ZodType>(
    schema: T,
    body: unknown
): z.infer<T> {
    return schema.parse(body);
}