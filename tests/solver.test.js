const assert = require('node:assert/strict');
const Solver = require('../solver.js');

function nearlyEqual(actual, expected, eps = 1e-8) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < eps, `${value} != ${expected[i]}`));
}

const unique = [[2, 1, 5], [1, -1, 1]];
const uniqueExpected = [2, 1];
const infinite = [[1, 1, 2], [2, 2, 4]];
const none = [[1, 1, 2], [2, 2, 5]];
const identity5 = [
  [1, 0, 0, 0, 0, 3],
  [0, 1, 0, 0, 0, -2],
  [0, 0, 1, 0, 0, 5],
  [0, 0, 0, 1, 0, 7],
  [0, 0, 0, 0, 1, -1]
];

for (const method of ['gauss-jordan', 'gaussian']) {
  let result = Solver.solve(unique, method);
  assert.equal(result.classification, 'unique');
  nearlyEqual(result.solution, uniqueExpected);

  result = Solver.solve(infinite, method);
  assert.equal(result.classification, 'infinite');
  assert.equal(result.solution, null);

  result = Solver.solve(none, method);
  assert.equal(result.classification, 'none');
  assert.equal(result.solution, null);

  result = Solver.solve(identity5, method);
  assert.equal(result.classification, 'unique');
  nearlyEqual(result.solution, [3, -2, 5, 7, -1]);
}

assert.throws(() => Solver.solve([[1, 2], [3]], 'gauss-jordan'), /mismo número de columnas/);
assert.throws(() => Solver.solve([[1, Infinity]], 'gauss-jordan'), /números finitos/);
assert.throws(() => Solver.solve(Array.from({ length: 6 }, () => [1, 2]), 'gauss-jordan'), /entre 1 y 5 filas/);
assert.throws(() => Solver.solve([[1]], 'gauss-jordan'), /entre 2 y 6 columnas/);

console.log('✅ Todos los tests del solver pasaron.');
