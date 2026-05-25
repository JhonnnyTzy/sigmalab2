const fs = require('fs');
const path = require('path');

// Fix `...PROPS, ref` → `ref, ...PROPS` in destructured params
// Also fix duplicate type attributes

const dirs = [
  path.resolve(__dirname, '../src/components/ui'),
  path.resolve(__dirname, '../src/views'),
  path.resolve(__dirname, '../src/components/sigmalab'),
];

let totalFixed = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir, { recursive: true }).filter(f => f.endsWith('.tsx'));
  for (const f of files) {
    const fp = path.join(dir, f);
    let src = fs.readFileSync(fp, 'utf-8');
    const orig = src;

    // Fix: { ...X, ref } or { a, ...X, ref }  ->  { ref, ...X } or { a, ref, ...X }
    src = src.replace(/\{([^}]*?)\.\.\.(\w+)\s*,\s*ref([^}]*)\}/g, (match, before, name, after) => {
      // before: stuff before ...name
      // after: stuff after ref
      // We want: { before ref, ...name after }
      return `{${before}ref, ...${name}${after}}`;
    });

    // Fix duplicate type
    src = src.replace(/type="(button|submit)"\s+type="(button|submit)"/g, 'type="$1"');

    if (src !== orig) {
      fs.writeFileSync(fp, src, 'utf-8');
      console.log(`Fixed: ${f}`);
      totalFixed++;
    }
  }
}

console.log(`\nFixed ${totalFixed} files.`);
