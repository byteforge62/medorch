"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { AlertCenter } from "@/components/alerts/AlertCenter";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "purple";
      case "DOCTOR":
        return "info";
      case "OT_STAFF":
        return "warning";
      case "PATIENT":
      default:
        return "neutral";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 focus:outline-none lg:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
            M
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            MedOrch
          </span>
          <span className="hidden text-xs text-slate-400 sm:inline-block">
            | OT Operations Platform
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <AlertCenter />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        {user ? (
          <div className="flex items-center space-x-3">
            <div className="hidden text-right sm:block">
              <div className="flex items-center space-x-1.5 justify-end">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {user.name || "User"}
                </span>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-400 truncate max-w-[160px] block">
                {user.email}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              title="Sign Out"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
