const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext) {
  const results = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) results.push(...getAllFiles(fp, ext));
      else if (entry.name.endsWith(ext)) results.push(fp);
    }
  } catch {}
  return results;
}

const dirs = [
  path.resolve(__dirname, '../src/views'),
  path.resolve(__dirname, '../src/components/sigmalab'),
  path.resolve(__dirname, '../src/components/ui'),
];

let total = 0;
for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const fp of getAllFiles(dir, '.tsx')) {
    let src = fs.readFileSync(fp, 'utf-8');
    const orig = src;
    // Remove duplicate type="..." where the second one appears after any attributes
    src = src.replace(/type="(button|submit)"\s+((?:[^\s>]+\s+)*)type="\1"/g, 'type="$1" $2');
    if (src !== orig) {
      fs.writeFileSync(fp, src, 'utf-8');
      console.log('Fixed:', path.relative(path.resolve(__dirname, '..'), fp));
      total++;
    }
  }
}
console.log(`Fixed ${total} files`);
