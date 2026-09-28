(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.MatrixSolver = factory();
  }
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const EPSILON = 1e-10;

  function cloneMatrix(matrix) {
    return matrix.map(row => row.slice());
  }

  function clean(value) {
    return Math.abs(value) < EPSILON ? 0 : value;
  }

  function rankOf(matrix, tolerance = EPSILON) {
    if (!matrix.length) return 0;
    const work = cloneMatrix(matrix);
    const rows = work.length;
    const cols = work[0].length;
    let rank = 0;
    let pivotRow = 0;

    for (let col = 0; col < cols && pivotRow < rows; col += 1) {
      let best = pivotRow;
      for (let r = pivotRow + 1; r < rows; r += 1) {
        if (Math.abs(work[r][col]) > Math.abs(work[best][col])) best = r;
      }
      if (Math.abs(work[best][col]) <= tolerance) continue;
      [work[pivotRow], work[best]] = [work[best], work[pivotRow]];
      for (let r = pivotRow + 1; r < rows; r += 1) {
        const factor = work[r][col] / work[pivotRow][col];
        for (let c = col; c < cols; c += 1) {
          work[r][c] = clean(work[r][c] - factor * work[pivotRow][c]);
        }
      }
      pivotRow += 1;
      rank += 1;
    }
    return rank;
  }

  function validateAugmented(augmented) {
    if (!Array.isArray(augmented) || augmented.length < 1 || augmented.length > 5) {
      throw new Error('La matriz debe tener entre 1 y 5 filas.');
    }
    const width = Array.isArray(augmented[0]) ? augmented[0].length : 0;
    if (width < 2 || width > 6) {
      throw new Error('La matriz debe tener entre 2 y 6 columnas (hasta 5 variables).');
    }
    const normalized = augmented.map(row => {
      if (!Array.isArray(row) || row.length !== width) {
        throw new Error('Todas las filas deben tener el mismo número de columnas.');
      }
      return row.map(value => {
        const number = Number(value);
        if (!Number.isFinite(number)) throw new Error('Todos los valores deben ser números finitos.');
        return number;
      });
    });
    return { matrix: normalized, variables: width - 1 };
  }

  function recordStep(steps, label, matrix, note = '') {
    steps.push({ label, matrix: cloneMatrix(matrix).map(row => row.map(clean)), note });
  }

  function classify(echelonOrReduced, variables) {
    for (const row of echelonOrReduced) {
      const allCoefficientsZero = row.slice(0, variables).every(v => Math.abs(v) <= EPSILON);
      const rhsNonZero = Math.abs(row[variables]) > EPSILON;
      if (allCoefficientsZero && rhsNonZero) return 'none';
    }
    const rankA = rankOf(echelonOrReduced.map(row => row.slice(0, variables)));
    return rankA === variables ? 'unique' : 'infinite';
  }

  function gaussJordan(augmented) {
    const { matrix, variables } = validateAugmented(augmented);
    const rows = matrix.length;
    const cols = matrix[0].length;
    const work = cloneMatrix(matrix);
    const steps = [];
    let pivotRow = 0;

    recordStep(steps, 'Matriz inicial', work);

    for (let col = 0; col < variables && pivotRow < rows; col += 1) {
      let bestRow = pivotRow;
      for (let r = pivotRow + 1; r < rows; r += 1) {
        if (Math.abs(work[r][col]) > Math.abs(work[bestRow][col])) bestRow = r;
      }

      if (Math.abs(work[bestRow][col]) <= EPSILON) continue;

      if (bestRow !== pivotRow) {
        [work[pivotRow], work[bestRow]] = [work[bestRow], work[pivotRow]];
        recordStep(steps, `Intercambio F${pivotRow + 1} ↔ F${bestRow + 1}`, work);
      }

      const pivot = work[pivotRow][col];
      if (Math.abs(pivot - 1) > EPSILON) {
        for (let c = 0; c < cols; c += 1) work[pivotRow][c] = clean(work[pivotRow][c] / pivot);
        recordStep(steps, `F${pivotRow + 1} ← F${pivotRow + 1} ÷ ${formatNumber(pivot)}`, work);
      }

      for (let r = 0; r < rows; r += 1) {
        if (r === pivotRow) continue;
        const factor = work[r][col];
        if (Math.abs(factor) <= EPSILON) continue;
        for (let c = 0; c < cols; c += 1) {
          work[r][c] = clean(work[r][c] - factor * work[pivotRow][c]);
        }
        recordStep(steps, `F${r + 1} ← F${r + 1} ${formatSignedFactor(-factor)}·F${pivotRow + 1}`, work);
      }
      pivotRow += 1;
    }

    const classification = classify(work, variables);
    const rankA = rankOf(matrix.map(row => row.slice(0, variables)));
    const rankAugmented = rankOf(matrix);

    return {
      method: 'Gauss-Jordan',
      matrixType: 'Matriz reducida (RREF)',
      matrix: work.map(row => row.map(clean)),
      steps,
      variables,
      classification,
      rankA,
      rankAugmented,
      solution: classification === 'unique' ? extractSolution(work, variables) : null,
      parametricSolution: classification === 'infinite' ? extractParametricSolution(work, variables) : null
    };
  }

  function gaussian(augmented) {
    const { matrix, variables } = validateAugmented(augmented);
    const rows = matrix.length;
    const cols = matrix[0].length;
    const work = cloneMatrix(matrix);
    const steps = [];
    let pivotRow = 0;
    const pivots = [];

    recordStep(steps, 'Matriz inicial', work);

    for (let col = 0; col < variables && pivotRow < rows; col += 1) {
      let bestRow = pivotRow;
      for (let r = pivotRow + 1; r < rows; r += 1) {
        if (Math.abs(work[r][col]) > Math.abs(work[bestRow][col])) bestRow = r;
      }
      if (Math.abs(work[bestRow][col]) <= EPSILON) continue;

      if (bestRow !== pivotRow) {
        [work[pivotRow], work[bestRow]] = [work[bestRow], work[pivotRow]];
        recordStep(steps, `Intercambio F${pivotRow + 1} ↔ F${bestRow + 1}`, work);
      }

      pivots.push(col);
      for (let r = pivotRow + 1; r < rows; r += 1) {
        const factor = work[r][col] / work[pivotRow][col];
        if (Math.abs(factor) <= EPSILON) continue;
        for (let c = col; c < cols; c += 1) {
          work[r][c] = clean(work[r][c] - factor * work[pivotRow][c]);
        }
        recordStep(steps, `F${r + 1} ← F${r + 1} ${formatSignedFactor(-factor)}·F${pivotRow + 1}`, work);
      }
      pivotRow += 1;
    }

    const classification = classify(work, variables);
    const rankA = rankOf(matrix.map(row => row.slice(0, variables)));
    const rankAugmented = rankOf(matrix);

    return {
      method: 'Eliminación de Gauss',
      matrixType: 'Matriz escalonada',
      matrix: work.map(row => row.map(clean)),
      steps,
      variables,
      classification,
      rankA,
      rankAugmented,
      solution: classification === 'unique' ? backSubstitute(work, variables, pivots) : null,
      parametricSolution: classification === 'infinite'
        ? extractParametricSolution(gaussJordan(matrix).matrix, variables)
        : null
    };
  }

  function extractSolution(reduced, variables) {
    const solution = Array(variables).fill(0);
    for (const row of reduced) {
      const pivotIndex = row.slice(0, variables).findIndex(v => Math.abs(v) > EPSILON);
      if (pivotIndex !== -1) solution[pivotIndex] = clean(row[variables] / row[pivotIndex]);
    }
    return solution;
  }

  function extractParametricSolution(reduced, variables) {
    const pivotForColumn = Array(variables).fill(-1);
    const freeColumns = [];

    for (let r = 0; r < reduced.length; r += 1) {
      const pivot = reduced[r].slice(0, variables).findIndex(v => Math.abs(v) > EPSILON);
      if (pivot !== -1 && pivotForColumn[pivot] === -1) pivotForColumn[pivot] = r;
    }

    for (let c = 0; c < variables; c += 1) {
      if (pivotForColumn[c] === -1) freeColumns.push(c);
    }

    const parameters = freeColumns.map((column, index) => ({
      column,
      name: `t${index + 1}`
    }));

    const expressions = Array.from({ length: variables }, (_, column) => {
      const pivotRow = pivotForColumn[column];
      if (pivotRow === -1) {
        const parameter = parameters.find(item => item.column === column);
        return { variable: column, constant: 0, terms: [{ parameter: parameter.name, coefficient: 1 }] };
      }

      const row = reduced[pivotRow];
      const terms = freeColumns
        .map((freeColumn, index) => ({
          parameter: parameters[index].name,
          coefficient: clean(-row[freeColumn])
        }))
        .filter(term => Math.abs(term.coefficient) > EPSILON);

      return {
        variable: column,
        constant: clean(row[variables]),
        terms
      };
    });

    return { parameters, expressions };
  }

  function backSubstitute(matrix, variables, pivots) {
    const solution = Array(variables).fill(0);
    for (let i = pivots.length - 1; i >= 0; i -= 1) {
      const row = i;
      const pivotCol = pivots[i];
      let rhs = matrix[row][variables];
      for (let col = pivotCol + 1; col < variables; col += 1) rhs -= matrix[row][col] * solution[col];
      solution[pivotCol] = clean(rhs / matrix[row][pivotCol]);
    }
    return solution;
  }

  function solve(augmented, method = 'gauss-jordan') {
    return method === 'gaussian' ? gaussian(augmented) : gaussJordan(augmented);
  }

  function formatNumber(value, digits = 6) {
    if (Math.abs(value) < EPSILON) return '0';
    const rounded = Number.parseFloat(value.toFixed(digits));
    if (Object.is(rounded, -0)) return '0';
    return String(rounded);
  }

  function formatSignedFactor(value) {
    const n = formatNumber(value);
    return value >= 0 ? `+ ${n}` : `- ${formatNumber(Math.abs(value))}`;
  }

  return {
    EPSILON,
    solve,
    gaussJordan,
    gaussian,
    rankOf,
    formatNumber,
    extractParametricSolution
  };
});
