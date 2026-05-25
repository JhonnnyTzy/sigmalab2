const fs = require('fs');
const path = require('path');
const UI_DIR = path.resolve(__dirname, '../src/components/ui');

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
    if (s[i] === "'") { i--; while (i >= 0 && s[i] !== "'") i--; }
  }
  return -1;
}

function matchBwd(s, st, o, c) {
  let d = 1;
  for (let i = st - 1; i >= 0; i--) {
    if (s[i] === c) d++;
    else if (s[i] === o) { d--; if (d === 0) return i; }
  }
  return -1;
}

function transformFile(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  let out = '', idx = 0;
  let changed = false;

  while (idx < src.length) {
    const fwd = src.indexOf('React.forwardRef', idx);
    if (fwd === -1) { out += src.slice(idx); break; }

    // Find `const NAME = React.forwardRef<` before this occurrence
    const preCtx = src.slice(Math.max(0, fwd - 100), fwd);
    // Locate the last `const` before React.forwardRef
    const constIdx = preCtx.lastIndexOf('const');
    if (constIdx === -1) { out += src.slice(idx, fwd + 16); idx = fwd + 16; continue; }

    // Verify it's followed by ` WORD = React.forwardRef<`
    const decl = src.slice(Math.max(0, fwd - 100) + constIdx, fwd + 30);
    const dm = decl.match(/^const\s+(\w+)\s*=\s*React\.forwardRef</);
    if (!dm) { out += src.slice(idx, fwd + 16); idx = fwd + 16; continue; }

    const absConst = Math.max(0, fwd - 100) + constIdx;
    const name = dm[1];

    // Copy up to (but not including) `const`
    out += src.slice(idx, absConst);

    // Find indent before `const` (the whitespace on the same line)
    const indent = src.slice(0, absConst).match(/\n([ \t]*)$/)?.[1] || '';

    // Parse type args
    const lt = fwd + 16;
    if (src[lt] !== '<') { out += src.slice(absConst); break; }
    const gt = matchParen(src, lt, '<', '>');
    if (gt === -1) { out += src.slice(absConst); break; }
    const ta = src.slice(lt + 1, gt).trim();
    const ts = splitTopLevel(ta, ',');
    const elT = ts[0] || 'never';
    const prT = ts.slice(1).join(',').trim() || 'Record<string, unknown>';

    // Find `, ref) =>` anchor
    const ra = src.indexOf(', ref) =>', gt);
    if (ra === -1) { out += src.slice(absConst); break; }
    const pEnd = ra + 5; // `)` in `, ref)`
    const pStart = matchBwd(src, pEnd, '(', ')');
    if (pStart === -1) { out += src.slice(absConst); break; }

    // Outer paren
    const afterGt = src.slice(gt + 1);
    const ws = afterGt.length - afterGt.trimStart().length;
    const op = gt + 1 + ws;
    const oe = matchParen(src, op, '(', ')');
    if (oe === -1) { out += src.slice(absConst); break; }

    // Params
    const pb = src.slice(pStart + 1, pEnd).trim();
    const rm = pb.match(/^(.*),\s*ref$/s);
    if (!rm) { out += src.slice(absConst); break; }
    const rp = rm[1].trim();
    const refAnn = `: ${prT} & { ref?: React.Ref<${elT}> }`;
    let np;
    if (rp.startsWith('{') && rp.endsWith('}')) {
      const inner = rp.slice(1, -1).trim();
      const items = inner ? splitTopLevel(inner, ',') : [];
      const restIdx = items.findIndex(i => i.startsWith('...'));
      if (restIdx >= 0) {
        items.splice(restIdx, 0, 'ref');
      } else {
        items.push('ref');
      }
      np = '{ ' + items.join(', ') + ' }';
    } else {
      np = `${rp}, ref`;
    }

    // Body
    const ap = src.slice(pEnd + 1).match(/^\s*=>/);
    if (!ap) { out += src.slice(absConst); break; }
    const bs = pEnd + 1 + ap[0].length;
    let bc = src.slice(bs, oe);
    // Remove trailing comma but keep the newline so displayName stays on its own line
    bc = bc.replace(/,(?=\s*$)/, '');

    // Preserve original body closer to its original indentation
    out += `${indent}const ${name} = (${np}${refAnn}) => ${bc}`;

    // Skip past `);`
    const rem = src.slice(oe + 1);
    const sm = rem.match(/^\s*;\s*/);
    idx = sm ? oe + 1 + sm[0].length : oe + 1;
    changed = true;
  }

  if (changed) { fs.writeFileSync(fp, out, 'utf-8'); return true; }
  return false;
}

function main() {
  let changed = 0;
  for (const f of fs.readdirSync(UI_DIR).filter(f => f.endsWith('.tsx'))) {
    try {
      if (transformFile(path.join(UI_DIR, f))) {
        console.log(`Fixed: ${f}`);
        changed++;
      }
    } catch (e) { console.error(`ERR ${f}:`, e.message); }
  }
  console.log(`\nDone. ${changed} files modified.`);
}
main();
