/**
 * Standalone type shim for the runtime-authorization suite.
 *
 * The suite imports from 'vitest' and relies on the vitest global test
 * functions. This file supplies those declarations locally so TypeScript
 * can type-check the suite without a project-wide vitest dependency.
 *
 * Do not add project-wide vitest dependencies or duplicate these
 * declarations elsewhere.
 */

declare module 'vitest' {
  export function afterAll(callback: () => void | Promise<void>): void;
  export function afterEach(callback: () => void | Promise<void>): void;
  export function beforeAll(
    callback: () => void | Promise<void>,
    timeout?: number,
  ): void;
  export function beforeEach(
    callback: () => void | Promise<void>,
    timeout?: number,
  ): void;
  export function describe(description: string, callback: () => void): void;
  export function expect<T>(value: T): {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toContain(item: unknown): void;
    toHaveLength(length: number): void;
    toMatchObject(expected: T): void;
    toStrictEqual(expected: T): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeInstanceOf(constructor: unknown): void;
    toHaveProperty(key: string, value?: unknown): void;
    not: {
      toBe(expected: T): void;
      toEqual(expected: T): void;
      toContain(item: unknown): void;
      toBeNull(): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  export function expectTypeOf<T>(value: T): {
    toBeTypeOf<U>(expected: U): void;
    [key: string]: unknown;
  };
  export function test(description: string, callback: () => void | Promise<void>): void;
  export function test(
    description: string,
    options: { timeout?: number },
    callback: () => void | Promise<void>,
  ): void;
  export function test(callback: () => void | Promise<void>): void;
  export function test<TData>(callback: (data: TData) => void | Promise<void>, options?: { data: TData }): void;
  export const vi: {
    mock<T extends (...args: never[]) => unknown>(fn: T): T;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
    useFakeTimers(options?: { now?: Date | number; toFake?: string[] }): void;
    useRealTimers(): void;
  };
}


