import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import SchedulesError from "../src/app/(workspace)/schedules/error";
import SchedulesLoading from "../src/app/(workspace)/schedules/loading";

test("the schedule loading boundary exposes an accessible busy state", () => {
  const html = renderToStaticMarkup(<SchedulesLoading />);

  assert.match(html, /aria-busy="true"/);
  assert.match(html, /aria-label="Loading theatre schedule"/);
  assert.match(html, /animate-pulse/);
});

test("the schedule error boundary offers retry and a safe exit", () => {
  const html = renderToStaticMarkup(
    <SchedulesError
      error={Object.assign(new Error("Example failure"), {
        digest: "test-digest",
      })}
      reset={() => undefined}
    />,
  );

  assert.match(html, /The theatre day could not be loaded/);
  assert.match(html, /No schedule changes were made/);
  assert.match(html, /Reference test-digest/);
  assert.match(html, />Retry theatre day</);
  assert.match(html, /href="\/dashboard"/);
});
