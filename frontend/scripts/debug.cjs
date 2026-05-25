const fs = require('fs');

function findMatching(s, start, open, close) {
  let depth = 0;
  let i = start;
  for (; i < s.length; i++) {
    if (s[i] === open) depth++;
    else if (s[i] === close) { depth--; if (depth === 0) return i; }
    if (s[i] === '"') { i++; while (i < s.length && s[i] !== '"') i++; }
    if (s[i] === "'") { i++; while (i < s.length && s[i] !== "'") i++; }
  }
  return -1;
}

const src = fs.readFileSync('src/components/ui/button.tsx', 'utf-8');
const refIdx = src.indexOf('React.forwardRef');
console.log('refIdx:', refIdx);
console.log('afterRef:', JSON.stringify(src.slice(refIdx, refIdx + 30)));

const afterRef = refIdx + 16; // length of 'React.forwardRef'
console.log('src[afterRef]:', JSON.stringify(src[afterRef]));

if (src[afterRef] === '<') {
  const gt = findMatching(src, afterRef, '<', '>');
  console.log('gt:', gt);
  const typeArgs = src.slice(afterRef + 1, gt);
  console.log('typeArgs:', JSON.stringify(typeArgs));
  
  // After >
  console.log('after >:', JSON.stringify(src.slice(gt, gt + 30)));
}
