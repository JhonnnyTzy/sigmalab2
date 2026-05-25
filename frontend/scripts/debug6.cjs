const path = require('path');
const fs = require('fs');
const UI_DIR = path.resolve(__dirname, '../src/components/ui');

const files = fs.readdirSync(UI_DIR).filter(f => f.endsWith('.tsx'));
console.log('Files in dir:', files.length, 'ui files');

// Run on button.tsx only
function splitTopLevel(s, d) {
  let dep = 0, bdep = 0, cur = '', parts = [];
  for (const ch of s) {
    if ('<(['.includes(ch)) dep++;
    else if ('>)]'.includes(ch)) dep--;
    else if (ch === '{') bdep++;
    else if (ch === '}') bdep--;
    else if (ch === d && dep === 0 && bdep === 0) { parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function matchParen(s, st, o, c) {
  let d = 0;
  for (let i = st; i < s.length; i++) {
    if (s[i] === o) d++;
    else if (s[i] === c) { d--; if (d === 0) return i; }
    if (s[i] === '"') { i++; while (i < s.length && s[i] !== '"') i++; }
    if (s[i] === "'") { i++; while (i < s.length && s[i] !== "'") i++; }
  }
  return -1;
}

function matchBwd(s, st, o, c) {
  let d = 0;
  for (let i = st; i >= 0; i--) {
    if (s[i] === c) d++;
    else if (s[i] === o) { d--; if (d === 0) return i; }
  }
  return -1;
}

const fp = path.join(UI_DIR, 'button.tsx');
let src = fs.readFileSync(fp, 'utf-8');
let out = '', idx = 0;
let changed = false;

while (idx < src.length) {
  const fwd = src.indexOf('React.forwardRef', idx);
  if (fwd === -1) { out += src.slice(idx); break; }
  console.log('\n=== Processing forwardRef at position', fwd, '===');

  const preCtx = src.slice(Math.max(0, fwd - 100), fwd);
  const constIdx = preCtx.lastIndexOf('const');
  if (constIdx === -1) { out += src.slice(idx, fwd + 16); idx = fwd + 16; console.log('no const found'); continue; }
  console.log('constIdx in preCtx:', constIdx);

  const decl = src.slice(Math.max(0, fwd - 100) + constIdx, fwd + 30);
  const dm = decl.match(/^const\s+(\w+)\s*=\s*React\.forwardRef</);
  if (!dm) { out += src.slice(idx, fwd + 16); idx = fwd + 16; console.log('decl match failed'); continue; }
  console.log('name:', dm[1]);

  const absConst = Math.max(0, fwd - 100) + constIdx;
  const name = dm[1];
  out += src.slice(idx, absConst);
  const indent = src.slice(0, absConst).match(/\n([ \t]*)$/)?.[1] || '';
  console.log('indent:', JSON.stringify(indent));

  const lt = fwd + 16;
  if (src[lt] !== '<') { out += src.slice(absConst); console.log('lt not <'); break; }
  const gt = matchParen(src, lt, '<', '>');
  if (gt === -1) { out += src.slice(absConst); console.log('gt not found'); break; }
  console.log('gt:', gt);

  const ta = src.slice(lt + 1, gt).trim();
  const ts = splitTopLevel(ta, ',');
  const elT = ts[0] || 'never';
  const prT = ts.slice(1).join(',').trim() || 'Record<string, unknown>';
  console.log('elT:', elT, 'prT:', prT);

  const ra = src.indexOf(', ref) =>', gt);
  if (ra === -1) { out += src.slice(absConst); console.log('ref anchor not found'); break; }
  console.log('ra:', ra);
  const pEnd = ra + 6;
  console.log('pEnd:', pEnd, 'char:', JSON.stringify(src[pEnd]));

  const pStart = matchBwd(src, pEnd - 1, '(', ')');
  if (pStart === -1) { out += src.slice(absConst); console.log('params start not found'); break; }
  console.log('pStart:', pStart, 'char:', JSON.stringify(src[pStart]));

  const afterGt = src.slice(gt + 1);
  const ws = afterGt.length - afterGt.trimStart().length;
  const op = gt + 1 + ws;
  console.log('op:', op, 'char:', JSON.stringify(src[op]));
  const oe = matchParen(src, op, '(', ')');
  if (oe === -1) { out += src.slice(absConst); console.log('outer end not found'); break; }
  console.log('oe:', oe);

  const pb = src.slice(pStart + 1, pEnd).trim();
  const rm = pb.match(/^(.*),\s*ref$/s);
  if (!rm) { out += src.slice(absConst); console.log('ref match failed'); break; }
  console.log('realParams:', JSON.stringify(rm[1].trim()));

  const rp = rm[1].trim();
  const refAnn = `: ${prT} & { ref?: React.Ref<${elT}> }`;
  let np;
  if (rp.startsWith('{') && rp.endsWith('}')) {
    const inner = rp.slice(1, -1).trim();
    const items = inner ? splitTopLevel(inner, ',') : [];
    np = '{ ' + [...items, 'ref'].join(', ') + ' }';
  } else {
    np = `${rp}, ref`;
  }
  console.log('newParams:', np);

  const ap = src.slice(pEnd + 1).match(/^\s*=>/);
  if (!ap) { out += src.slice(absConst); console.log('arrow not found'); break; }
  const bs = pEnd + 1 + ap[0].length;
  let bc = src.slice(bs, oe).trimEnd();
  bc = bc.replace(/,\s*$/, '');
  console.log('body first 40:', JSON.stringify(bc.slice(0, 40)));

  out += `${indent}const ${name} = (${np}${refAnn}) => ${bc}`;

  const rem = src.slice(oe + 1);
  const sm = rem.match(/^\s*;\s*/);
  idx = sm ? oe + 1 + sm[0].length : oe + 1;
  changed = true;
  console.log('SUCCESS! idx now:', idx);
}

if (changed) {
  fs.writeFileSync(fp, out, 'utf-8');
  console.log('\nFile written!');
} else {
  console.log('\nNo changes');
}
