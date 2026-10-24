const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsDir = path.resolve(__dirname, '../js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
let hasError = false;

console.log('--- Verifying Syntax across JS files ---');
files.forEach(f => {
  const code = fs.readFileSync(path.join(jsDir, f), 'utf8');
  try {
    new vm.Script(code);
    console.log(`  PASS: ${f}`);
  } catch (err) {
    console.error(`  FAIL: ${f} -> ${err.message}`);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log(`All ${files.length} JavaScript files passed syntax verification.\n`);
}
