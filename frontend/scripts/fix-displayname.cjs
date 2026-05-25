const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllFiles(fp, ext));
    else if (entry.name.endsWith(ext)) results.push(fp);
  }
  return results;
}

// Fix ui component files
const uiDir = path.resolve(__dirname, '../src/components/ui');
let uiCount = 0;
for (const fp of fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx')).map(f => path.join(uiDir, f))) {
  let src = fs.readFileSync(fp, 'utf-8');
  const orig = src;
  src = src.replace(/([})])((\w+)\.displayName)/g, '$1\n$2');
  if (src !== orig) {
    fs.writeFileSync(fp, src, 'utf-8');
    console.log('Fixed UI:', path.basename(fp));
    uiCount++;
  }
}

// Fix view files with duplicate type
const viewDirs = [
  path.resolve(__dirname, '../src/views'),
  path.resolve(__dirname, '../src/components/sigmalab'),
];
let viewCount = 0;
for (const dir of viewDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const fp of getAllFiles(dir, '.tsx')) {
    let src = fs.readFileSync(fp, 'utf-8');
    const orig = src;
    src = src.replace(/type="(button|submit)"\s+type="(button|submit)"/g, 'type="$1"');
    if (src !== orig) {
      fs.writeFileSync(fp, src, 'utf-8');
      console.log('Fixed view:', path.relative(path.resolve(__dirname, '..'), fp));
      viewCount++;
    }
  }
}

console.log(`Fixed ${uiCount} UI files and ${viewCount} view files`);
