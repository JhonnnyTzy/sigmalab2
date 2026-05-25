const fs = require('fs');
const src = fs.readFileSync('src/components/ui/button.tsx', 'utf-8');

const refIdx = src.indexOf('React.forwardRef');
console.log('refIdx:', refIdx);

const before = src.slice(Math.max(0, refIdx - 80), refIdx);
console.log('before:', JSON.stringify(before));

// Try decl match
const declMatch = before.match(/(?:^|\r?\n)([ \t]*)const\s+(\w+)\s*=\s*$/m);
console.log('declMatch:', declMatch ? 'YES' : 'NO');
if (declMatch) {
  console.log('  indent:', JSON.stringify(declMatch[1]));
  console.log('  name:', declMatch[2]);
}
