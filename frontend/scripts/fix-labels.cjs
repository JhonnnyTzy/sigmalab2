const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// Add htmlFor to <label> and matching id to adjacent <input>/<select>/<textarea>
// Also add aria-label to controls that have a text label nearby
function fixFile(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  const orig = src;

  // Find <label>Text</label> patterns WITHOUT htmlFor
  // and add htmlFor + id to the label and its adjacent control
  const labelPattern = /<label\s+([^>]*?)>([^<>\n]+?)<\/label>\s*\n?\s*(<(?:div|span)\b[^>]*>\s*)?<(input|select|textarea)\s+([^>]*?)>/g;
  
  let match;
  const matches = [];
  while ((match = labelPattern.exec(src)) !== null) {
    const [full, labelAttrs, labelText, wrapper, tag, ctrlAttrs] = match;
    if (labelAttrs.includes('htmlFor') || ctrlAttrs.includes('id=') || ctrlAttrs.includes('aria-label=')) {
      continue;
    }
    matches.push({ index: match.index, length: full.length, labelAttrs, labelText, tag, ctrlAttrs, full, wrapper });
  }
  
  if (matches.length === 0) return false;
  
  // Apply replacements in reverse order
  let result = src;
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const id = `fld-${i}`;
    const cleanText = m.labelText.replace(/[*\n]/g, '').trim();
    
    // Add htmlFor to label
    const newLabel = `<label ${m.labelAttrs} htmlFor="${id}">${m.labelText}</label>`;
    // Add id + aria-label to control
    const newCtrl = `<${m.tag} ${m.ctrlAttrs} id="${id}" aria-label="${cleanText}">`;
    
    const oldStr = m.full;
    const wrapperStr = m.wrapper || '';
    const newStr = newLabel + '\n' + wrapperStr + newCtrl;
    
    result = result.slice(0, m.index) + newStr + result.slice(m.index + m.length);
  }

  if (result !== orig) {
    fs.writeFileSync(fp, result, 'utf-8');
    return true;
  }
  return false;
}

const files = [
  'src/views/correctivo/NuevoCorrectivo.tsx',
  'src/views/preventivo/NuevoMantPreventivo.tsx',
  'src/views/Login.tsx',
  'src/views/encargado/Usuarios.tsx',
  'src/views/encargado/Inventario.tsx',
  'src/views/encargado/Insumos.tsx',
  'src/views/encargado/Mantenimientos.tsx',
  'src/views/incidencias/Crear.tsx',
  'src/views/incidencias/Bandeja.tsx',
  'src/views/preventivo/MisMantenimientos.tsx',
  'src/views/correctivo/MisCorrectivos.tsx',
  'src/views/encargado/Logs.tsx',
  'src/views/encargado/Perifericos.tsx',
  'src/views/encargado/Equipos.tsx',
  'src/views/encargado/ReportesPasantes.tsx',
  'src/components/sigmalab/ChecklistTable.tsx',
];

let total = 0;
for (const f of files) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) continue;
  try {
    if (fixFile(fp)) {
      console.log(`Fixed: ${f}`);
      total++;
    }
  } catch (e) { console.error(`ERR ${f}: ${e.message}`); }
}
console.log(`\n${total} files modified`);
