import assert from "node:assert/strict";
import test from "node:test";

import { readJsonBody } from "../src/lib/api/validation";

test("readJsonBody returns parsed JSON", async () => {
  const result = await readJsonBody(
    new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "Example" }),
      headers: { "content-type": "application/json" },
    }),
  );

  assert.deepEqual(result, {
    success: true,
    data: { name: "Example" },
  });
});

test("readJsonBody reports malformed JSON without throwing", async () => {
  const result = await readJsonBody(
    new Request("http://localhost/api/test", {
      method: "POST",
      body: "{",
      headers: { "content-type": "application/json" },
    }),
  );

  assert.deepEqual(result, { success: false });
});

test("readJsonBody propagates unexpected request failures", async () => {
  await assert.rejects(
    readJsonBody({
      json: async () => {
        throw new Error("Unexpected body read failure");
      },
    }),
    /Unexpected body read failure/,
  );
});
