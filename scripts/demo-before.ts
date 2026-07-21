import { Command } from "commander";

const program = new Command()
  .name("my-cli")
  .description("My awesome CLI tool")
  .option("-v, --verbose", "Enable verbose output")
  .option("-o, --output <path>", "Output file path")
  .argument("[paths...]", "File paths to process");

program.command("deploy").description("Deploy the app");

program.outputHelp();
