import { Command, Help, Option } from "commander";
import { describe, it, expect } from "vitest";

import { createHelpConfig } from "../src/help.js";

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
      it("applies cyan to option terms", () => {
        const help = createTestCommand().helpInformation();

        expect(help).toContain("\x1b[36m");
      });

      it("applies bold to boxen section titles", () => {
        const help = createTestCommand().helpInformation();

        expect(help).toContain("\x1b[1m");
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

        expect(help).toContain("-h, --help");
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

        expect(help).not.toContain("\x1b[");
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
    it("applies custom accentStyle to option text", () => {
      const help = createTestCommand({ accentStyle: "green" }).helpInformation();

      // green = \x1b[32m, cyan (default) = \x1b[36m
      expect(help).toContain("\x1b[32m");
      expect(help).not.toContain("\x1b[36m");
    });

    it("applies custom headingStyle to section titles", () => {
      const help = createTestCommand({ headingStyle: "underline" }).helpInformation();

      // underline = \x1b[4m
      expect(help).toContain("\x1b[4m");
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
});
