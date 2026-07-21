# epaulettes demo — regenerate with: npm run demo
#
# Prerequisites: vhs (https://github.com/charmbracelet/vhs)
# Output: assets/demo.png

Set Shell fish
Set FontSize 14
Set Width 700
Set Height 750
Set Padding 20
Set Theme "Catppuccin Mocha"
Set TypingSpeed 0

Type "# Without epaulettes"
Enter
Type "node --import tsx scripts/demo-before.ts"
Enter
Sleep 1s

Enter
Type "# With epaulettes"
Enter
Type "node --import tsx scripts/demo-after.ts"
Enter
Sleep 1s

Screenshot assets/demo.png
