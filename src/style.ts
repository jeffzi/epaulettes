import { Writable } from "node:stream";
import { styleText } from "node:util";

/**
 * No-op writable stream with `isTTY: true`.
 *
 * Passed to `styleText` so ANSI codes are emitted regardless of the real
 * output stream's TTY status — color decisions are deferred to Commander's
 * `getOutHasColors` callback instead.
 */
export const colorStream = Object.assign(
  new Writable({
    write(_, __, cb) {
      cb();
    },
  }),
  { isTTY: true } as const,
);

/** Re-export of `node:util`'s `InspectColor` — every modifier, foreground, and background ANSI style that `styleText` accepts. */
export type { InspectColor as Style } from "node:util";

/** One style or an array of styles for compound formatting (e.g. `["white", "bold"]`). */
export type StyleSpec =
  | import("node:util").InspectColor
  | readonly import("node:util").InspectColor[];

/** Applies an ANSI {@link StyleSpec} to `text`, always emitting escape codes via {@link colorStream}. */
export function colorize(style: StyleSpec, text: string): string {
  return styleText(style, text, { stream: colorStream });
}
