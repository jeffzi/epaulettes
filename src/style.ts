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

/** ANSI text-style names accepted by `node:util` {@link styleText}. */
export type Style = "bold" | "red" | "green" | "yellow" | "dim" | "cyan" | "italic" | "underline";

/** Applies an ANSI {@link Style} to `text`, always emitting escape codes via {@link colorStream}. */
export function colorize(style: Style, text: string): string {
  return styleText(style, text, { stream: colorStream });
}
