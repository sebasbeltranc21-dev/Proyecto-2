const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

const ids = [...app.matchAll(/getElementById\('([^']+)'\)/g)].map(match => match[1]);
for (const id of new Set(ids)) {
  assert.ok(
    html.includes('id="' + id + '"') || html.includes("id='" + id + "'"),
    'El ID "' + id + '" se usa en app.js pero no existe en index.html'
  );
}

assert.ok(
  html.indexOf('<script src="solver.js"></script>') < html.indexOf('<script src="app.js"></script>'),
  'solver.js debe cargarse antes de app.js'
);
for (const name of ['unique', 'fraction', 'infinite', 'none', 'five']) {
  assert.ok(html.includes('data-example="' + name + '"'), 'Falta preset: ' + name);
}
assert.ok(app.includes('localStorage.getItem(HISTORY_KEY)'));
assert.ok(app.includes('localStorage.setItem(HISTORY_KEY'));

console.log('✅ Contrato de interfaz verificado.');
