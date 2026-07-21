# epaulettes demo (before) — regenerate with: npm run demo
#
# Prerequisites: vhs (https://github.com/charmbracelet/vhs)
# Output: assets/demo-before.png

Set Shell fish
Set FontSize 14
Set Width 700
Set Height 400
Set Padding 20
Set Theme "Catppuccin Mocha"
Set TypingSpeed 0

Type "node --import tsx scripts/demo-before.ts"
Enter
Sleep 1s

Screenshot assets/demo-before.png
