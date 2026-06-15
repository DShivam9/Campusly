const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
} catch (e) {
  require('fs').writeFileSync('ts_errors.txt', e.stdout.toString() + '\n' + e.stderr.toString());
}
try {
  execSync('npx eslint "src/**/*.{ts,tsx}" --format json > lint_out.json', { stdio: 'pipe' });
} catch (e) {}

try {
  const d = require('./lint_out.json');
  const errs = d.filter(x => x.errorCount || x.warningCount).flatMap(x => x.messages.map(m => x.filePath + ':' + m.line + ' ' + m.message));
  require('fs').writeFileSync('eslint_errors.txt', errs.join('\n'));
} catch (e) {
  console.error("ESLint JSON parse failed:", e);
}
