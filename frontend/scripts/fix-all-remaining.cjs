const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ========== FIX 1: em dashes in JSX text (12) ==========
function fixEmDashes(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  const orig = src;
  // Replace em dash in JSX text (but not in template literals `...`)
  // We target lines that have em dash NOT inside backticks or comments
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip template literals, comments, and string assignments
    if (line.includes('`') || line.includes('//') || line.includes('*')) continue;
    // Replace — with - in JSX text
    if (line.includes('\u2014') && !line.includes('"—"') && !line.includes("'—'")) {
      lines[i] = line.replace(/\u2014/g, '-');
    }
  }
  const result = lines.join('\n');
  if (result !== orig) { fs.writeFileSync(fp, result, 'utf-8'); return true; }
  return false;
}

// ========== FIX 2: bold headings (7) ==========
function fixBoldHeadings(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  const orig = src;
  // font-bold inside heading tags or heading-like classes → font-semibold
  src = src.replace(/(<h[1-6][^>]*?class="[^"]*?)font-bold([^"]*?"[^>]*?>)/g, '$1font-semibold$2');
  if (src !== orig) { fs.writeFileSync(fp, src, 'utf-8'); return true; }
  return false;
}

// ========== FIX 3: three-period ellipsis (4) ==========
function fixEllipsis(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  const orig = src;
  // Replace … (ellipsis) with ... in JSX text
  src = src.replace(/\u2026/g, '...');
  if (src !== orig) { fs.writeFileSync(fp, src, 'utf-8'); return true; }
  return false;
}

// ========== FIX 4: label-has-associated-control (18) ==========
// Fix: <label>Text</label><input> → nest input inside label or add htmlFor+id
function fixLabelControl(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  const orig = src;
  
  // Pattern 1: <label className="...">Text</label>
  //           <div><input/></div> or <input/>
  // → <label className="...">Text<input/></label>
  
  // Pattern 2: <label className="...">Text</label>
  //           <select>...</select>
  // → <label className="...">Text<select>...</select></label>
  
  // Simple approach: find consecutive <label>...ctrl patterns and nest
  // This is tricky with regex, let's use a line-based approach
  
  // Actually, just add htmlFor to existing <label> and id to adjacent control
  // The most common pattern in the codebase:
  // <label className="..." htmlFor="X">Text</label>
  // <input/select/textarea id="X" ... />
  
  // But generating unique IDs is hard. Let me just wrap the control inside label.
  // Find patterns like <label>...</label>\n<div>control</div> or <label>...</label>\ncontrol
  src = src.replace(
    /(<label\b[^>]*>[\s\S]*?<\/label>\s*\n\s*)(<(?:div|span)\b[^>]*>\s*<(input|select|textarea)\b)/g,
    (match, labelTag, wrapperOpen, ctrlTag) => {
      // We need to find the matching close tag of wrapper
      return `${labelTag.slice(0, -7)}` + // remove </label>
        wrapperOpen.replace(/^<(div|span)\b/, '<$1') + // keep wrapper open
        // We can't easily match, just keep as-is but add aria-label
        match;
    }
  );
  
  // Fallback: add aria-label to controls with adjacent labels
  // Much simpler - just add aria-label matching the label text
  const ariaLabelPattern = /(<label\b[^>]*>)\s*([^<>\n]+?)\s*(?::)?\s*<\/label>\s*\n?\s*(?:<(?:div|span)\b[^>]*>\s*)?(<(?:input|select|textarea)\b)/g;
  src = src.replace(ariaLabelPattern, (match, labelOpen, labelText, ctrlOpen) => {
    const label = labelText.replace(/[*:]/g, '').trim();
    if (ctrlOpen.includes('aria-label')) return match;
    // Insert aria-label into the control tag
    const insert = ` aria-label="${label}"`;
    const pos = ctrlOpen.indexOf(' ');
    if (pos === -1) return labelOpen + labelText + '</label>\n' + ctrlOpen + insert;
    return labelOpen + labelText + '</label>\n' + ctrlOpen.slice(0, pos) + insert + ctrlOpen.slice(pos);
  });
  
  if (src !== orig) { fs.writeFileSync(fp, src, 'utf-8'); return true; }
  return false;
}

// ========== MAIN ==========
const fixes = [
  { files: [
    'src/views/encargado/Inventario.tsx',
    'src/views/encargado/Logs.tsx',
    'src/views/incidencias/Crear.tsx',
    'src/views/preventivo/NuevoMantPreventivo.tsx',
    'src/views/correctivo/BandejaIncidencias.tsx',
    'src/views/preventivo/BandejaIncidencias.tsx',
    'src/components/sigmalab/EquipmentDetailModal.tsx',
  ], fn: fixEmDashes, label: 'em dashes' },
  { files: [
    'src/views/correctivo/NuevoCorrectivo.tsx',
    'src/router.tsx',
    'src/routes/__root.tsx',
    'src/views/preventivo/NuevoMantPreventivo.tsx',
    'src/views/Placeholder.tsx',
    'src/views/encargado/Reportes.tsx',
    'src/views/Login.tsx',
  ], fn: fixBoldHeadings, label: 'bold headings' },
  { files: [
    'src/views/correctivo/NuevoCorrectivo.tsx',
    'src/views/preventivo/NuevoMantPreventivo.tsx',
    'src/views/preventivo/Reportes.tsx',
  ], fn: fixEllipsis, label: 'ellipsis' },
  { files: [
    'src/views/correctivo/NuevoCorrectivo.tsx',
    'src/views/preventivo/NuevoMantPreventivo.tsx',
    'src/views/Login.tsx',
  ], fn: fixLabelControl, label: 'label-control' },
];

let total = 0;
for (const fix of fixes) {
  for (const f of fix.files) {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) { console.log(`SKIP (not found): ${f}`); continue; }
    try {
      if (fix.fn(fp)) {
        console.log(`Fixed ${fix.label}: ${f}`);
        total++;
      }
    } catch (e) {
      console.error(`ERR ${fix.label} ${f}: ${e.message}`);
    }
  }
}
console.log(`\nTotal: ${total} files modified`);
