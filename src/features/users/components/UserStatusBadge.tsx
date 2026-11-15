import { Badge } from "@/components/ui/Badge";

type UserStatus =
    | "PENDING"
    | "ACTIVE"
    | "SUSPENDED"
    | "REJECTED";

const statusConfig: Record<
    UserStatus,
    {
        label: string;
        variant: "success" | "warning" | "danger" | "neutral";
    }
> = {
    PENDING: {
        label: "Pending",
        variant: "warning",
    },
    ACTIVE: {
        label: "Active",
        variant: "success",
    },
    SUSPENDED: {
        label: "Suspended",
        variant: "danger",
    },
    REJECTED: {
        label: "Rejected",
        variant: "neutral",
    },
};

export function UserStatusBadge({
    status,
}: {
    status: UserStatus;
}) {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
}