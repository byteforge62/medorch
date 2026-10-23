import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SessionProvider } from "next-auth/react";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

import { Header } from "@/components/layout/Header";
import { PRIMARY_NAVIGATION_ID, Sidebar } from "@/components/layout/Sidebar";
import { ScheduleCard, ScheduleItem } from "@/components/schedules/ScheduleCard";
import { ScheduleStatusActions } from "@/components/schedules/ScheduleStatusActions";

const session = {
  user: { name: "QA Tester", email: "qa@example.com", role: "ADMIN" },
  expires: "2999-01-01T00:00:00.000Z",
} as never;

function renderHeader(sidebarOpen: boolean): string {
  return renderToStaticMarkup(
    <SessionProvider session={session}>
      <Header sidebarOpen={sidebarOpen} />
    </SessionProvider>,
  );
}

function buttonTagWith(html: string, marker: string): string {
  const match = html.match(new RegExp(`<button[^>]*${marker}[^>]*>`));
  assert.ok(match, `expected a <button> containing ${marker}`);
  return match![0];
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : null;
}

function scheduleFixture(
  procedure: string,
  overrides: Partial<ScheduleItem> = {},
): ScheduleItem {
  return {
    id: `id-${procedure}`,
    patientId: "patient-1",
    departmentId: "department-1",
    otRoomId: "room-1",
    surgeonId: "surgeon-1",
    procedure,
    scheduledDate: "2026-10-23",
    startTime: "2026-10-23T14:30:00.000Z",
    endTime: "2026-10-23T16:00:00.000Z",
    status: "SCHEDULED",
    priority: "ELECTIVE",
    ...overrides,
  };
}

function renderCards(...procedures: string[]): string {
  return procedures
    .map((procedure) =>
      renderToStaticMarkup(
        <ScheduleCard
          schedule={scheduleFixture(procedure)}
          canManageSchedules
          onEdit={() => undefined}
          onStatusUpdated={() => undefined}
        />,
      ),
    )
    .join("");
}

function ariaLabels(html: string): string[] {
  return [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]);
}

test("navigation toggle exposes drawer state and a resolvable controls target", () => {
  assert.ok(
    PRIMARY_NAVIGATION_ID.length > 0,
    "PRIMARY_NAVIGATION_ID must be a stable non-empty id",
  );

  const closed = buttonTagWith(renderHeader(false), "aria-controls");
  assert.equal(attr(closed, "aria-controls"), PRIMARY_NAVIGATION_ID);
  assert.equal(attr(closed, "aria-expanded"), "false");
  assert.equal(attr(closed, "aria-label"), "Open navigation menu");

  const open = buttonTagWith(renderHeader(true), "aria-controls");
  assert.equal(attr(open, "aria-controls"), PRIMARY_NAVIGATION_ID);
  assert.equal(attr(open, "aria-expanded"), "true");
  assert.equal(attr(open, "aria-label"), "Close navigation menu");
});

test("sidebar carries the id targeted by the navigation toggle", () => {
  const html = renderToStaticMarkup(
    <SessionProvider session={session}>
      <PathnameContext.Provider value="/dashboard">
        <Sidebar isOpen onClose={() => undefined} />
      </PathnameContext.Provider>
    </SessionProvider>,
  );
  const aside = html.match(/<aside[^>]*>/);
  assert.ok(aside, "sidebar must render an <aside>");
  assert.equal(attr(aside[0], "id"), PRIMARY_NAVIGATION_ID);
});

test("repeated schedule controls expose unique, contextual accessible names", () => {
  const html = renderCards("Appendectomy", "Knee Arthroscopy");
  const labels = ariaLabels(html);

  const duplicates = labels.filter((label, i) => labels.indexOf(label) !== i);
  assert.deepEqual(
    duplicates,
    [],
    `accessible names must be unique, found duplicates: ${duplicates.join(", ")}`,
  );

  for (const procedure of ["Appendectomy", "Knee Arthroscopy"]) {
    for (const expected of [
      `Edit ${procedure}`,
      `View details for ${procedure}`,
      `Cancel schedule for ${procedure}`,
      `Confirm schedule for ${procedure}`,
    ]) {
      assert.ok(
        labels.includes(expected),
        `expected accessible name "${expected}" (got: ${labels.join(" | ")})`,
      );
    }
  }
});

test("accessible-name fix does not change visible button text", () => {
  const html = renderCards("Appendectomy");
  assert.ok(/>Edit</.test(html), "visible Edit text must remain");
  assert.ok(/>Cancel</.test(html), "visible Cancel text must remain");
  assert.ok(/>View details</.test(html), "visible View details text must remain");
});

test("status actions without a schedule label keep the generic accessible name", () => {
  // Both current consumers (ScheduleCard, ScheduleDetails) pass a label, but
  // the component must stay valid for any consumer that omits it.
  const html = renderToStaticMarkup(
    <ScheduleStatusActions
      scheduleId="schedule-1"
      currentStatus="SCHEDULED"
      onStatusUpdated={() => undefined}
    />,
  );
  const labels = ariaLabels(html);
  assert.ok(
    labels.includes("Cancel schedule") && labels.includes("Confirm schedule"),
    `expected generic fallback names, got: ${labels.join(" | ")}`,
  );
});
