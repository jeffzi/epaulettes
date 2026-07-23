import { Command, Help, Option } from "commander";
import { describe, it, expect } from "vitest";

import { createHelpConfig } from "../src/help.js";

function assertDefined<T>(val: T): asserts val is NonNullable<T> {
  expect(val).toBeDefined();
}

const COLORS = {
  GREEN: "\x1b[32m",
  CYAN: "\x1b[36m",
  YELLOW: "\x1b[33m",
  RED: "\x1b[31m",
  WHITE: "\x1b[37m",
  BOLD: "\x1b[1m",
} as const;

function createTestCommand(options?: Parameters<typeof createHelpConfig>[0]): Command {
  return new Command("test-cmd")
    .description("A test command")
    .option("-v, --verbose", "Enable verbose output")
    .option("--output <path>", "Output file path")
    .argument("[paths...]", "File paths to process")
    .configureHelp(createHelpConfig(options))
    .configureOutput({ getOutHasColors: () => true });
}

function createTestCommandNoColor(): Command {
  return new Command("test-cmd")
    .description("A test command")
    .option("-v, --verbose", "Enable verbose output")
    .configureHelp(createHelpConfig())
    .configureOutput({ getOutHasColors: () => false });
}

describe("createHelpConfig", () => {
  describe("default options (no-arg call)", () => {
    describe("boxen borders", () => {
      it("wraps sections in round box-drawing characters", () => {
        const help = createTestCommand().helpInformation();

        expect(help).toContain("╭");
        expect(help).toContain("╮");
        expect(help).toContain("╰");
        expect(help).toContain("╯");
        expect(help).toContain("│");
      });

      it("uses section heading without trailing colon as boxen title", () => {
        const help = createTestCommand().helpInformation();

        expect(help).toMatch(/╭.*Options.*╮/);
      });

      it("wraps Arguments section in boxen border", () => {
        const help = createTestCommand().helpInformation();

        expect(help).toMatch(/╭.*Arguments.*╮/);
      });

      it("wraps Commands section in boxen border when subcommands exist", () => {
        const cmd = createTestCommand();
        cmd.command("deploy").description("Deploy the app");
        const help = cmd.helpInformation();

        expect(help).toMatch(/╭.*Commands.*╮/);
      });
    });

    describe("ANSI styling", () => {
      it("does not apply ANSI styling to boxen panel titles", () => {
        const help = createTestCommand().helpInformation();

        const lines = help.split("\n");
        const titleLineIdx = lines.findIndex(
          (l) => l.includes("╭") && (l.includes("Options") || l.includes("Arguments")),
        );
        expect(titleLineIdx).toBeGreaterThanOrEqual(0);

        const titleLine = lines[titleLineIdx];
        assertDefined(titleLine);
        const titleMatch = titleLine.match(/╭\s*(.+?)\s*─/);
        assertDefined(titleMatch);

        expect(titleMatch[1]).not.toMatch(/\x1b\[/);
      });
    });

    describe("content preservation", () => {
      it("includes option descriptions", () => {
        const help = createTestCommand().helpInformation();

        expect(help).toContain("Enable verbose output");
        expect(help).toContain("Output file path");
      });

      it("includes argument descriptions", () => {
        const help = createTestCommand().helpInformation();

        expect(help).toContain("File paths to process");
      });

      it("includes Commander's built-in -h, --help", () => {
        const help = createTestCommand().helpInformation();

        expect(help).toContain("-h");
        expect(help).toContain("--help");
      });

      it("preserves short-first flag ordering", () => {
        const cmd = new Command("test")
          .option("-D, --diff", "Show diff")
          .configureHelp(createHelpConfig());
        const help = cmd.helpInformation();

        expect(help).toContain("-D, --diff");
      });

      it("displays choices annotation for options with .choices()", () => {
        const cmd = new Command("test")
          .addOption(new Option("--executor <alias>", "Executor alias").choices(["claude", "pi"]))
          .configureHelp(createHelpConfig());
        const help = cmd.helpInformation();

        expect(help).toContain('choices: "claude", "pi"');
      });
    });

    describe("no-color mode", () => {
      it("strips ANSI codes when getOutHasColors returns false", () => {
        const help = createTestCommandNoColor().helpInformation();

        expect(help).not.toMatch(/\x1b\[/);
        expect(help).toContain("╭");
        expect(help).toContain("-v, --verbose");
      });
    });

    describe("formatItemList edge cases", () => {
      it("returns empty array for empty item list", () => {
        const helper = new Help();
        helper.helpWidth = 80;
        const config = createHelpConfig();
        const formatItemList = config.formatItemList!;
        const result = formatItemList.call(helper, "Options:", [], helper);

        expect(result).toStrictEqual([]);
      });

      it("defaults to width 80 when helpWidth is undefined", () => {
        const helper = new Help();
        const config = createHelpConfig();
        const formatItemList = config.formatItemList!;
        const result = formatItemList.call(
          helper,
          "Options:",
          ["  -v, --verbose  Enable verbose output"],
          helper,
        );

        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toContain("╭");
      });
    });
  });

  describe("option overrides", () => {
    it("applies custom accentStyle to subcommand and argument text", () => {
      const cmd = createTestCommand({ accentStyle: "red" });
      cmd.command("deploy").description("Deploy the app");
      const help = cmd.helpInformation();

      expect(help).toContain(COLORS.RED);
    });

    it("applies custom borderStyle", () => {
      const help = createTestCommand({ borderStyle: "double" }).helpInformation();

      expect(help).toContain("╔");
      expect(help).toContain("╗");
      expect(help).toContain("╚");
      expect(help).toContain("╝");
      expect(help).toContain("║");
    });
  });

  describe("styleOptionTerm with split flag coloring", () => {
    describe("default flag coloring (green for short, cyan for long)", () => {
      it("colors short flags green and long flags cyan in combined term", () => {
        const help = createTestCommand().helpInformation();

        const lines = help.split("\n");
        const verboseLine = lines.find((l) => l.includes("-v") && l.includes("--verbose"));

        expect(verboseLine).toBeDefined();
        expect(verboseLine).toContain(COLORS.GREEN);
        expect(verboseLine).toContain(COLORS.CYAN);
      });

      it("colors type annotations yellow by default", () => {
        const help = createTestCommand().helpInformation();

        const lines = help.split("\n");
        const outputLine = lines.find((l) => l.includes("--output"));

        expect(outputLine).toBeDefined();
        expect(outputLine).toContain(COLORS.YELLOW);
      });

      it("applies cyan to long-only flags", () => {
        const help = createTestCommand().helpInformation();

        const lines = help.split("\n");
        const outputLine = lines.find((l) => l.includes("--output"));

        expect(outputLine).toBeDefined();
        expect(outputLine).toContain(COLORS.CYAN);
      });

      it("applies green to short-only flags", () => {
        const config = createHelpConfig();
        const { styleOptionTerm } = config;
        assertDefined(styleOptionTerm);
        const result = styleOptionTerm("-v");

        expect(result).toContain(COLORS.GREEN);
        expect(result).not.toContain(COLORS.CYAN);
      });

      it("leaves comma separator unstyled between flags", () => {
        const help = createTestCommand().helpInformation();

        const lines = help.split("\n");
        const verboseLine = lines.find((l) => l.includes("-v") && l.includes("--verbose"));

        expect(verboseLine).toBeDefined();
        expect(verboseLine).toMatch(/\x1b\[32m-v\x1b\[39m,\s+\x1b\[36m--verbose/);
      });
    });

    describe("custom flag style options", () => {
      it.each([
        {
          label: "shortFlagStyle",
          options: { shortFlagStyle: "red" as const },
          lineMatch: "-v",
          expectedColor: COLORS.RED,
        },
        {
          label: "longFlagStyle",
          options: { longFlagStyle: "green" as const },
          lineMatch: "--verbose",
          expectedColor: COLORS.GREEN,
        },
        {
          label: "typeAnnotationStyle",
          options: { typeAnnotationStyle: "red" as const },
          lineMatch: "--output",
          expectedColor: COLORS.RED,
        },
      ])("applies custom $label", ({ options, lineMatch, expectedColor }) => {
        const help = createTestCommand(options).helpInformation();
        const lines = help.split("\n");
        const line = lines.find((l) => l.includes(lineMatch));

        expect(line).toBeDefined();
        expect(line).toContain(expectedColor);
      });
    });

    describe("fallback and edge cases", () => {
      it("falls back to accentStyle for unmatched input", () => {
        const config = createHelpConfig({ accentStyle: "red" });
        const { styleOptionTerm } = config;
        assertDefined(styleOptionTerm);
        const result = styleOptionTerm("++not-a-flag");

        expect(result).toContain(COLORS.RED);
        expect(result).toContain("++not-a-flag");
      });
    });
  });

  describe("titleStyle and usageStyle", () => {
    it("applies bold yellow to Usage: prefix by default", () => {
      const help = createTestCommand().helpInformation();

      const lines = help.split("\n");
      const usageLine = lines.find((l) => l.includes("Usage:"));

      expect(usageLine).toBeDefined();
      expect(usageLine).toContain(COLORS.YELLOW);
      expect(usageLine).toContain(COLORS.BOLD);
    });

    it("custom titleStyle overrides Usage: prefix style", () => {
      const help = createTestCommand({ titleStyle: "red" }).helpInformation();

      const lines = help.split("\n");
      const usageLine = lines.find((l) => l.includes("Usage:"));

      expect(usageLine).toBeDefined();
      expect(usageLine).toContain(COLORS.RED);
    });

    it("styleUsage method applies styling to strings", () => {
      const config = createHelpConfig();
      const { styleUsage } = config;
      assertDefined(styleUsage);
      const result = styleUsage("test usage");

      expect(result).toMatch(/\x1b\[/);
      expect(result).toContain("test usage");
    });

    it("applies default usageStyle (white + bold) to usage content", () => {
      const help = createTestCommand().helpInformation();

      const lines = help.split("\n");
      const usageLine = lines.find((l) => l.includes("Usage:"));

      expect(usageLine).toBeDefined();
      expect(usageLine).toContain(COLORS.WHITE);
    });

    it("applies custom usageStyle when provided", () => {
      const help = createTestCommand({ usageStyle: "red" }).helpInformation();

      const lines = help.split("\n");
      const usageLine = lines.find((l) => l.includes("Usage:"));

      expect(usageLine).toBeDefined();
      expect(usageLine).toContain(COLORS.RED);
    });

    it("applies custom compound usageStyle with multiple styles", () => {
      const help = createTestCommand({ usageStyle: ["red", "bold"] }).helpInformation();

      const lines = help.split("\n");
      const usageLine = lines.find((l) => l.includes("Usage:"));

      expect(usageLine).toBeDefined();
      expect(usageLine).toContain(COLORS.RED);
      expect(usageLine).toContain(COLORS.BOLD);
    });
  });

  describe("accent style methods", () => {
    it.each([
      { method: "styleSubcommandText", input: "deploy", expectedColor: COLORS.CYAN },
      { method: "styleOptionText", input: "some option", expectedColor: COLORS.CYAN },
      { method: "styleArgumentText", input: "paths", expectedColor: COLORS.YELLOW },
    ] as const)("$method applies its configured style", ({ method, input, expectedColor }) => {
      const config = createHelpConfig();
      const styleFn = config[method];

      assertDefined(styleFn);
      const result = styleFn(input);

      expect(result).toContain(expectedColor);
      expect(result).toContain(input);
    });
  });
});
