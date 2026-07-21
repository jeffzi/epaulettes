import { Writable } from "node:stream";
import { styleText } from "node:util";

export const colorStream = Object.assign(
  new Writable({
    write(_, __, cb) {
      cb();
    },
  }),
  { isTTY: true } as const,
);

export type Style = "bold" | "red" | "green" | "yellow" | "dim" | "cyan" | "italic" | "underline";

export function colorize(style: Style, text: string): string {
  return styleText(style, text, { stream: colorStream });
}
