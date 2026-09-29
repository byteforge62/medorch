import { Prisma } from "@/generated/prisma/client";

export function getApiErrorMessage(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return "A record with this value already exists";

            case "P2025":
                return "The requested record was not found";

            case "P2003":
                return "A database error occurred.";

            default:
                return "A database error occured";

        }
    }

    if(error instanceof Error){
        return error.message;
    }

    return "An unexpected error occured."
}