import boxen from "boxen";
import type { Options as BoxenOptions } from "boxen";
import type { Help } from "commander";

import { colorize } from "./style.js";
import type { Style } from "./style.js";

/** Border color accepted by boxen — named ANSI colors with autocomplete, or any string. */
export type BorderColor = NonNullable<BoxenOptions["borderColor"]>;

/** Border style accepted by boxen. */
export type BorderStyle = NonNullable<BoxenOptions["borderStyle"]>;

/** Styling options for Commander.js help output rendered by {@link createHelpConfig}. */
export interface EpaulettesOptions {
  accentStyle: Style;
  headingStyle: Style;
  borderColor: BorderColor;
  borderStyle: BorderStyle;
}

const defaults: EpaulettesOptions = {
  accentStyle: "cyan",
  headingStyle: "bold",
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
  const { accentStyle, headingStyle, borderColor, borderStyle } = { ...defaults, ...options };

  return {
    styleTitle(str: string): string {
      return colorize(headingStyle, str);
    },

    styleOptionText(str: string): string {
      return colorize(accentStyle, str);
    },

    styleSubcommandText(str: string): string {
      return colorize(accentStyle, str);
    },

    styleArgumentText(str: string): string {
      return colorize(accentStyle, str);
    },

    styleCommandText(str: string): string {
      return colorize(accentStyle, str);
    },

    formatItemList(this: Help, heading: string, items: string[], _helper: Help): string[] {
      if (items.length === 0) {
        return [];
      }

      const title = heading.replace(/:$/, "");
      const content = items.join("\n");
      const width = (this.helpWidth ?? 80) - 2;

      const boxedOutput = boxen(content, {
        title: colorize(headingStyle, title),
        titleAlignment: "left",
        borderStyle,
        borderColor,
        width,
      });

      return [...boxedOutput.split("\n"), ""];
    },
  } as const satisfies Partial<Help>;
}
