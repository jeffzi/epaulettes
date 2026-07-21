# epaulettes

Styled help for [Commander.js](https://github.com/tj/commander.js) CLIs.

## What it does

Commander.js prints help as flat text. Epaulettes wraps each section (Arguments, Options, Commands)
in box-drawing borders and applies configurable ANSI styles to headings and option names.

<table>
<tr>
<th>Before</th>
<th>After</th>
</tr>
<tr>
<td><img src="assets/demo-before.png" alt="Commander.js default help output" /></td>
<td><img src="assets/demo-after.png" alt="Commander.js help output styled with epaulettes" /></td>
</tr>
</table>

Color decisions defer to Commander's own `getOutHasColors`. When `--no-color` is active, Commander
strips ANSI codes while borders remain.

## Installation

```bash
npm install @jeffzi/epaulettes commander
```

Requires **Node.js 22+**. ESM only (no CommonJS). Commander 15+ is a peer dependency.

## Quick example

```typescript
import { Command } from "commander";
import { createHelpConfig } from "@jeffzi/epaulettes";

const program = new Command()
  .name("my-cli")
  .description("My awesome CLI tool")
  .option("-v, --verbose", "Enable verbose output")
  .option("-o, --output <path>", "Output file path")
  .configureHelp(createHelpConfig());

program.parse();
```

## Customization

Pass an options object to override defaults:

```typescript
import { createHelpConfig } from "@jeffzi/epaulettes";

// green names, underlined headings, blue double-line borders
const helpConfig = createHelpConfig({
  accentStyle: "green",
  headingStyle: "underline",
  borderColor: "blue",
  borderStyle: "double",
});

program.configureHelp(helpConfig);
```

### Options

| Property       | Type          | Default   | Description                                                                                          |
| -------------- | ------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `accentStyle`  | `Style`       | `"cyan"`  | ANSI style for option/argument/command names                                                         |
| `headingStyle` | `Style`       | `"bold"`  | ANSI style for section headings                                                                      |
| `borderColor`  | `BorderColor` | `"gray"`  | Border color — named ANSI colors with autocomplete, or any string                                    |
| `borderStyle`  | `BorderStyle` | `"round"` | Box-drawing style name or `{ topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left }` |

**`Style`** (subset of `node:util` `styleText` formats) — `"bold"` | `"red"` | `"green"` |
`"yellow"` | `"dim"` | `"cyan"` | `"italic"` | `"underline"`

**`BorderColor`** — `"black"` | `"red"` | `"green"` | `"yellow"` | `"blue"` | `"magenta"` |
`"cyan"` | `"white"` | `"gray"` | `"grey"` | `"blackBright"` | `"redBright"` | `"greenBright"` |
`"yellowBright"` | `"blueBright"` | `"magentaBright"` | `"cyanBright"` | `"whiteBright"` | or any
string

**`BorderStyle`** — `"round"` | `"single"` | `"double"` | `"bold"` | `"singleDouble"` |
`"doubleSingle"` | `"classic"` | `"arrow"` | `"none"` | or a `{ topLeft, top, topRight, right,
bottomRight, bottom, bottomLeft, left }` object with single-character strings

## License

[MIT](LICENSE)
