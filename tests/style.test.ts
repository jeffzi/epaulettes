import { describe, it, expect } from "vitest";

import { colorize, colorStream } from "../src/style.js";

describe("colorize", () => {
  it("wraps text with ANSI escape codes", () => {
    const result = colorize("bold", "hello");

    // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape detection
    expect(result).toMatch(/\x1b\[/);
    expect(result).toContain("hello");
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
