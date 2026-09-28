const assert = require('node:assert/strict');
const Solver = require('../solver.js');

function nearlyEqual(actual, expected, eps = 1e-8) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < eps, `${value} != ${expected[i]}`));
}

function expressionFor(result, variableIndex) {
  return result.parametricSolution.expressions[variableIndex];
}

const unique = [[2, 1, 5], [1, -1, 1]];
const infinite = [[1, 1, 2], [2, 2, 4]];
const none = [[1, 1, 2], [2, 2, 5]];
const infinite3 = [[1, 2, 1, 4], [2, 4, 2, 8], [0, 1, 1, 3]];
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
  nearlyEqual(result.solution, [2, 1]);

  result = Solver.solve(infinite, method);
  assert.equal(result.classification, 'infinite');
  assert.equal(result.solution, null);
  assert.deepEqual(result.parametricSolution.parameters.map(p => p.name), ['t1']);
  assert.equal(expressionFor(result, 0).constant, 2);
  assert.equal(expressionFor(result, 0).terms[0].parameter, 't1');
  assert.equal(expressionFor(result, 0).terms[0].coefficient, -1);
  assert.deepEqual(expressionFor(result, 1).terms, [{ parameter: 't1', coefficient: 1 }]);

  result = Solver.solve(infinite3, method);
  assert.equal(result.classification, 'infinite');
  assert.deepEqual(result.parametricSolution.parameters.map(p => p.name), ['t1']);
  assert.equal(expressionFor(result, 0).constant, -2);
  assert.equal(expressionFor(result, 0).terms[0].coefficient, 1);
  assert.equal(expressionFor(result, 1).constant, 3);
  assert.equal(expressionFor(result, 1).terms[0].coefficient, -1);
  assert.deepEqual(expressionFor(result, 2).terms, [{ parameter: 't1', coefficient: 1 }]);

  result = Solver.solve(none, method);
  assert.equal(result.classification, 'none');
  assert.equal(result.solution, null);
  assert.equal(result.parametricSolution, null);

  result = Solver.solve(identity5, method);
  assert.equal(result.classification, 'unique');
  nearlyEqual(result.solution, [3, -2, 5, 7, -1]);
}

assert.throws(() => Solver.solve([[1, 2], [3]], 'gauss-jordan'), /mismo número de columnas/);
assert.throws(() => Solver.solve([[1, Infinity]], 'gauss-jordan'), /números finitos/);
assert.throws(() => Solver.solve(Array.from({ length: 6 }, () => [1, 2]), 'gauss-jordan'), /entre 1 y 5 filas/);
assert.throws(() => Solver.solve([[1]], 'gauss-jordan'), /entre 2 y 6 columnas/);

console.log('✅ Todos los tests de la Fase 2 pasaron.');
