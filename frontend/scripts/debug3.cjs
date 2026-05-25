const fs = require('fs');
const path = require('path');

const fp = path.resolve(__dirname, '../src/components/ui/button.tsx');

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

function splitTopLevel(s, delim) {
  const parts = [];
  let depth = 0;
  let braceDepth = 0;
  let current = '';
  for (const ch of s) {
    if (ch === '<' || ch === '(' || ch === '[') depth++;
    else if (ch === '>' || ch === ')' || ch === ']') depth--;
    else if (ch === '{') braceDepth++;
    else if (ch === '}') braceDepth--;
    else if (ch === delim && depth === 0 && braceDepth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  const last = current.trim();
  if (last) parts.push(last);
  return parts;
}

let src = fs.readFileSync(fp, 'utf-8');

// Simulate the transformFile function
let result = '';
let pos = 0;

const refIdx = src.indexOf('React.forwardRef', pos);
console.log('refIdx:', refIdx);

const before = src.slice(Math.max(0, refIdx - 80), refIdx);
const declMatch = before.match(/(?:^|\r?\n)([ \t]*)const\s+(\w+)\s*=\s*$/m);
console.log('declMatch:', declMatch ? 'YES' : 'NO');
if (!declMatch) {
  console.log('NO DECL MATCH - copying and breaking');
  result += src.slice(pos, refIdx + 16);
  pos = refIdx + 16;
  return;
}

const indent = declMatch[1] || '';
const name = declMatch[2];
console.log('name:', name, 'indent:', JSON.stringify(indent));

const afterRef = refIdx + 16;
console.log('src[afterRef]:', JSON.stringify(src[afterRef]));

if (src[afterRef] !== '<') {
  console.log('NOT < after forwardRef');
  result += src.slice(pos, afterRef);
  pos = afterRef;
  return;
}

const gt = findMatching(src, afterRef, '<', '>');
console.log('gt:', gt);

const typeArgs = src.slice(afterRef + 1, gt).trim();
const types = splitTopLevel(typeArgs, ',');
const elType = types[0] || 'never';
const propsType = types.slice(1).join(',').trim() || 'Record<string, unknown>';
console.log('typeArgs:', JSON.stringify(typeArgs));
console.log('elType:', elType, 'propsType:', propsType);

const afterGt = src.slice(gt + 1).trimStart();
const wsAfterGt = src.slice(gt + 1).length - afterGt.length;
const fnParenStart = gt + 1 + wsAfterGt;
console.log('fnParenStart:', fnParenStart, 'char:', JSON.stringify(src[fnParenStart]));

if (src[fnParenStart] !== '(') {
  console.log('NOT ( after >');
  result += src.slice(pos, fnParenStart);
  pos = fnParenStart;
  return;
}

const fnParenEnd = findMatching(src, fnParenStart, '(', ')');
console.log('fnParenEnd:', fnParenEnd, 'char:', JSON.stringify(src[fnParenEnd]));

const fnParamsBody = src.slice(fnParenStart + 1, fnParenEnd);
console.log('fnParamsBody:', JSON.stringify(fnParamsBody));

const trimmedParams = fnParamsBody.trim();
const refMatch = trimmedParams.match(/,\s*ref\s*$/);
console.log('refMatch:', refMatch ? 'YES' : 'NO');
if (refMatch) console.log('refMatch[0]:', JSON.stringify(refMatch[0]));
