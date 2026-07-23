import boxen from "boxen";
import type { Options as BoxenOptions } from "boxen";
import type { Help } from "commander";

import { colorize } from "./style.js";
import type { StyleSpec } from "./style.js";

/** Border color accepted by boxen — named ANSI colors with autocomplete, or any string. */
export type BorderColor = NonNullable<BoxenOptions["borderColor"]>;

/** Border style accepted by boxen. */
export type BorderStyle = NonNullable<BoxenOptions["borderStyle"]>;

/** Styling options for Commander.js help output rendered by {@link createHelpConfig}. */
export interface EpaulettesOptions {
  accentStyle: StyleSpec;
  titleStyle: StyleSpec;
  shortFlagStyle: StyleSpec;
  longFlagStyle: StyleSpec;
  typeAnnotationStyle: StyleSpec;
  usageStyle: StyleSpec;
  borderColor: BorderColor;
  borderStyle: BorderStyle;
}

const defaults: EpaulettesOptions = {
  accentStyle: "cyan",
  titleStyle: ["yellow", "bold"],
  shortFlagStyle: "green",
  longFlagStyle: "cyan",
  typeAnnotationStyle: "yellow",
  usageStyle: ["white", "bold"],
  borderColor: "gray",
  borderStyle: "round",
};

/**
 * Creates a Commander.js {@link Help} configuration that wraps each help
 * section in a boxen border with styled headings and accent-colored terms.
 *
 * Returns a partial `Help` object suitable for `Command.configureHelp()`.
 */
export function createHelpConfig(options?: Partial<EpaulettesOptions>): Partial<Help> {
  const opts = { ...defaults, ...options };

  /**
   * Parse option term with regex and apply per-part coloring.
   * Pattern: `/^(-\w)?(?:,\s*)?(--[\w-]+)?(?:\s+(.+))?$/`
   * Matches: `-v, --verbose <path>` → `-v` (short), `, ` (separator), `--verbose` (long), ` ` (space), `<path>` (type)
   * Falls back to accentStyle if pattern doesn't match.
   */
  function styleOptionTerm(str: string): string {
    const match = str.match(/^(-\w)?(?:,\s*)?(--[\w-]+)?(?:\s+(.+))?$/);

    if (!match) {
      return colorize(opts.accentStyle, str);
    }

    const [, shortFlag, longFlag, typeAnnotation] = match;
    const parts: string[] = [];

    if (shortFlag) {
      parts.push(colorize(opts.shortFlagStyle, shortFlag));
    }

    if (shortFlag && longFlag) {
      parts.push(", ");
    }

    if (longFlag) {
      parts.push(colorize(opts.longFlagStyle, longFlag));
    }

    if (typeAnnotation) {
      parts.push(" ", colorize(opts.typeAnnotationStyle, typeAnnotation));
    }

    return parts.join("");
  }

  const accentColorize = (str: string) => colorize(opts.accentStyle, str);

  return {
    styleTitle(str: string): string {
      return colorize(opts.titleStyle, str);
    },

    styleUsage(str: string): string {
      return colorize(opts.usageStyle, str);
    },

    styleOptionTerm(str: string): string {
      return styleOptionTerm(str);
    },

    styleOptionText(str: string): string {
      return accentColorize(str);
    },

    styleSubcommandText(str: string): string {
      return accentColorize(str);
    },

    styleArgumentText(str: string): string {
      return colorize(opts.typeAnnotationStyle, str);
    },

    formatItemList(this: Help, heading: string, items: string[], _helper: Help): string[] {
      if (items.length === 0) {
        return [];
      }

      const title = heading.replace(/:$/, "");
      const content = items.join("\n");
      const width = (this.helpWidth ?? 80) - 2;

      const boxedOutput = boxen(content, {
        title,
        titleAlignment: "left",
        borderStyle: opts.borderStyle,
        borderColor: opts.borderColor,
        width,
      });

      return [...boxedOutput.split("\n"), ""];
    },
  } as const satisfies Partial<Help>;
}
