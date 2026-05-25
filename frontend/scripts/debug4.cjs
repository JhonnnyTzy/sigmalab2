const fs = require('fs');

function findMatching(s, start, open, close) {
  let depth = 0;
  let i = start;
  for (; i < s.length; i++) {
    if (s[i] === open) depth++;
    else if (s[i] === close) { depth--; if (depth === 0) { /*console.log('MATCH at', i, 'depth', depth)*/; return i; } }
    if (s[i] === '"') { i++; while (i < s.length && s[i] !== '"') i++; }
    if (s[i] === "'") { i++; while (i < s.length && s[i] !== "'") i++; }
  }
  return -1;
}

const src = fs.readFileSync('src/components/ui/button.tsx', 'utf-8');
const refIdx = src.indexOf('React.forwardRef');
const afterRef = refIdx + 16;
const gt = findMatching(src, afterRef, '<', '>');

// Check what's between gt and potential close
const fnParenStart = gt + 1;
console.log('Checking positions around fnParenStart');
console.log('src[1580]:', JSON.stringify(src[1580]));
console.log('src[1581]:', JSON.stringify(src[1581]));

// Find the ) after ref in the params manually
for (let i = fnParenStart; i < Math.min(fnParenStart + 100, src.length); i++) {
  if (src[i] === '(') console.log('  ( at', i);
  if (src[i] === ')') console.log('  ) at', i, 'context:', JSON.stringify(src.slice(Math.max(0,i-5), i+10)));
  if (src[i] === '{') console.log('  { at', i);
  if (src[i] === '}') console.log('  } at', i);
}

// Now run findMatching
console.log('\nRunning findMatching...');
const result = findMatching(src, fnParenStart, '(', ')');
console.log('findMatching result:', result);
