import boxen from "boxen";
import type { Help } from "commander";

import { colorize } from "./style.js";
import type { Style } from "./style.js";

export interface EpaulettesOptions {
  accentStyle: Style;
  headingStyle: Style;
  borderColor: string;
  borderStyle:
    | "round"
    | "single"
    | "double"
    | "bold"
    | "singleDouble"
    | "doubleSingle"
    | "classic"
    | "arrow"
    | "none";
}

const defaults: EpaulettesOptions = {
  accentStyle: "cyan",
  headingStyle: "bold",
  borderColor: "gray",
  borderStyle: "round",
};

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
