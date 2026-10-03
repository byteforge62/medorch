"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { UserRole } from "@/generated/prisma/client";

type ActionItem = {
  title: string;
  description: string;
  href: string;
  roles: UserRole[];
  icon: React.ReactNode;
};

const actions: ActionItem[] = [
  {
    title: "Schedule Surgery",
    description: "Book new procedure & assign OT room",
    href: "/schedules",
    roles: ["ADMIN", "DOCTOR", "OT_STAFF"],
    icon: (
      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: "Manage OT Rooms",
    description: "Update room status & maintenance",
    href: "/ot-rooms",
    roles: ["ADMIN", "OT_STAFF"],
    icon: (
      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
  },
  {
    title: "Equipment Registry",
    description: "Check readiness & serial numbers",
    href: "/equipment",
    roles: ["ADMIN", "DOCTOR", "OT_STAFF"],
    icon: (
      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    title: "User Management",
    description: "Manage accounts, roles & status",
    href: "/users",
    roles: ["ADMIN"],
    icon: (
      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export function QuickActions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "PATIENT";

  const allowedActions = actions.filter((action) =>
    action.roles.includes(userRole as UserRole),
  );

  if (allowedActions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Operational Actions</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {allowedActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-start space-x-3 rounded-xl border border-slate-200 p-3.5 transition-all hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
          >
            <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">{action.icon}</div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{action.title}</h5>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
