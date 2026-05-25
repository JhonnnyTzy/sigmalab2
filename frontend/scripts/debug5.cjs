const fs = require('path');
const src = require('fs').readFileSync('src/components/ui/button.tsx', 'utf-8');

const fwd = src.indexOf('React.forwardRef');
console.log('fwd:', fwd);

const preCtx = src.slice(Math.max(0, fwd - 100), fwd);
const constIdx = preCtx.lastIndexOf('const');
console.log('constIdx in preCtx:', constIdx);
console.log('preCtx from constIdx:', JSON.stringify(preCtx.slice(constIdx)));

const decl = src.slice(Math.max(0, fwd - 100) + constIdx, fwd + 30);
console.log('decl:', JSON.stringify(decl));
const dm = decl.match(/^const\s+(\w+)\s*=\s*React\.forwardRef</);
console.log('dm:', dm ? `YES name=${dm[1]}` : 'NO');

const lt = fwd + 16;
console.log('src[lt]:', JSON.stringify(src[lt]));
