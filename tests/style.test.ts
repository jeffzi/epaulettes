import { describe, it, expect, expectTypeOf } from "vitest";

import { colorize, colorStream } from "../src/style.js";

describe("colorize", () => {
  it.each([
    { label: "single style", style: "bold" as const },
    { label: "array of styles", style: ["white", "bold"] as const },
  ])("wraps text with ANSI escape codes ($label)", ({ style }) => {
    const result = colorize(style, "hello");

    // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape detection
    expect(result).toMatch(/\x1b\[/);
    expect(result).toContain("hello");
  });

  it("accepts readonly array of styles", () => {
    expectTypeOf(colorize).toBeCallableWith(["bold", "cyan"] as const, "test");
  });
});

describe("colorStream", () => {
  it("write callback completes without error", async () => {
    const err = await new Promise<Error | null | undefined>((resolve) => {
      colorStream.write(Buffer.from("test"), "utf8", (e) => {
        resolve(e);
      });
    });

    expect(err).toBeNull();
  });

  it("has isTTY set to true", () => {
    expect(colorStream.isTTY).toBe(true);
  });
});
