/**
 * Minimal `expect`-style assertion helper for suites that run under Node's
 * built-in test runner (`node --import tsx --test`). It exists so runtime
 * suites can stay assertion-compatible with their original vitest form
 * without adding a project-wide vitest dependency.
 *
 * Only the matchers actually used by the runtime suites are implemented;
 * extend deliberately if a new matcher is needed.
 */
import assert from 'node:assert/strict';

type MatcherName =
  | 'toBe'
  | 'toEqual'
  | 'toBeNull'
  | 'toBeDefined'
  | 'toBeUndefined'
  | 'toContain'
  | 'toBeInstanceOf'
  | 'toBeGreaterThan';

export interface Expectation {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toBeNull(): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toContain(item: unknown): void;
  toBeInstanceOf(constructor: unknown): void;
  toBeGreaterThan(value: number): void;
  not: Omit<Expectation, 'not'>;
}

function evaluate(actual: unknown, matcher: MatcherName, expected: unknown): void {
  switch (matcher) {
    case 'toBe':
      assert.strictEqual(actual, expected);
      return;
    case 'toEqual':
      assert.deepStrictEqual(actual, expected);
      return;
    case 'toBeNull':
      assert.strictEqual(actual, null);
      return;
    case 'toBeDefined':
      assert.notStrictEqual(actual, undefined);
      return;
    case 'toBeUndefined':
      assert.strictEqual(actual, undefined);
      return;
    case 'toContain':
      assert.ok(
        typeof actual === 'string'
          ? actual.includes(String(expected))
          : Array.from(actual as Iterable<unknown>).includes(expected),
        `expected value to contain ${String(expected)}`,
      );
      return;
    case 'toBeInstanceOf':
      assert.ok(
        actual instanceof (expected as new (...args: never[]) => unknown),
        `expected value to be instance of ${String(expected)}`,
      );
      return;
    case 'toBeGreaterThan':
      assert.ok(
        Number(actual) > Number(expected),
        `expected ${String(actual)} to be greater than ${String(expected)}`,
      );
      return;
  }
}

function makeExpectation(actual: unknown, negated: boolean): Expectation {
  const run = (matcher: MatcherName, expected?: unknown): void => {
    if (!negated) {
      evaluate(actual, matcher, expected);
      return;
    }
    try {
      evaluate(actual, matcher, expected);
    } catch {
      return;
    }
    assert.fail(`expected NOT ${matcher} to fail, but it passed`);
  };

  const expectation: Expectation = {
    toBe: (expected) => run('toBe', expected),
    toEqual: (expected) => run('toEqual', expected),
    toBeNull: () => run('toBeNull'),
    toBeDefined: () => run('toBeDefined'),
    toBeUndefined: () => run('toBeUndefined'),
    toContain: (item) => run('toContain', item),
    toBeInstanceOf: (constructor) => run('toBeInstanceOf', constructor),
    toBeGreaterThan: (value) => run('toBeGreaterThan', value),
    // Built lazily: an eagerly-constructed `not` would nest forever.
    get not() {
      return makeExpectation(actual, !negated);
    },
  };

  return expectation;
}

export function expect(actual: unknown): Expectation {
  return makeExpectation(actual, false);
}
