(() => {
  'use strict';

  const equationsSelect = document.getElementById('equationsSelect');
  const variablesSelect = document.getElementById('variablesSelect');
  const methodSelect = document.getElementById('methodSelect');
  const matrixContainer = document.getElementById('matrixContainer');
  const matrixSizeLabel = document.getElementById('matrixSizeLabel');
  const solveBtn = document.getElementById('solveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exampleBtn = document.getElementById('exampleBtn');
  const inputError = document.getElementById('inputError');
  const resultSection = document.getElementById('resultSection');
  const resultBadge = document.getElementById('resultBadge');
  const resultSummary = document.getElementById('resultSummary');
  const solutionContainer = document.getElementById('solutionContainer');
  const reducedMatrixContainer = document.getElementById('reducedMatrixContainer');
  const stepsContainer = document.getElementById('stepsContainer');
  const toggleStepsBtn = document.getElementById('toggleStepsBtn');
  const rankLabel = document.getElementById('rankLabel');
  const methodLabel = document.getElementById('methodLabel');

  const examples = {
    unique: {
      equations: 2,
      variables: 2,
      matrix: [[2, 1, 5], [1, -1, 1]]
    },
    infinite: {
      equations: 2,
      variables: 2,
      matrix: [[1, 1, 2], [2, 2, 4]]
    },
    none: {
      equations: 2,
      variables: 2,
      matrix: [[1, 1, 2], [2, 2, 5]]
    }
  };

  function populateSelect(select, label) {
    select.innerHTML = '';
    for (let n = 1; n <= 5; n += 1) {
      const option = document.createElement('option');
      option.value = String(n);
      option.textContent = `${n} ${label}${n === 1 ? '' : 's'}`;
      select.appendChild(option);
    }
  }

  function buildMatrix(values) {
    const rows = Number(equationsSelect.value);
    const variables = Number(variablesSelect.value);
    matrixContainer.innerHTML = '';
    matrixSizeLabel.textContent = `${rows}×${variables + 1}`;

    for (let r = 0; r < rows; r += 1) {
      const row = document.createElement('div');
      row.className = 'matrix-row';
      for (let c = 0; c <= variables; c += 1) {
        const input = document.createElement('input');
        input.className = `matrix-cell${c === variables ? ' constant' : ''}`;
        input.type = 'number';
        input.step = 'any';
        input.inputMode = 'decimal';
        input.setAttribute('aria-label', c === variables ? `Ecuación ${r + 1}, término independiente` : `Ecuación ${r + 1}, variable ${String.fromCharCode(120 + c)}`);
        input.value = values?.[r]?.[c] ?? '';
        row.appendChild(input);
      }
      matrixContainer.appendChild(row);
    }
  }

  function getMatrixFromInputs() {
    const rows = [...matrixContainer.querySelectorAll('.matrix-row')];
    return rows.map(row => [...row.querySelectorAll('input')].map(input => {
      const value = input.value.trim();
      return value === '' ? NaN : Number(value);
    }));
  }

  function resetResults() {
    resultSection.hidden = true;
    inputError.hidden = true;
    inputError.textContent = '';
    stepsContainer.hidden = true;
    toggleStepsBtn.textContent = 'Mostrar pasos';
    toggleStepsBtn.setAttribute('aria-expanded', 'false');
  }

  function clearAll() {
    buildMatrix();
    resetResults();
  }

  function showError(message) {
    inputError.textContent = message;
    inputError.hidden = false;
    resultSection.hidden = true;
  }

  function statusText(classification) {
    if (classification === 'unique') return 'Solución única';
    if (classification === 'infinite') return 'Infinitas soluciones';
    return 'Sin solución';
  }

  function renderMatrix(matrix) {
    const wrapper = document.createElement('div');
    wrapper.className = 'output-grid';
    const variables = matrix[0].length - 1;
    matrix.forEach(row => {
      const outRow = document.createElement('div');
      outRow.className = 'output-row';
      row.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = `output-cell${index === variables ? ' constant' : ''}`;
        cell.textContent = MatrixSolver.formatNumber(value);
        outRow.appendChild(cell);
      });
      wrapper.appendChild(outRow);
    });
    return wrapper;
  }

  function renderSolution(result) {
    solutionContainer.innerHTML = '';
    if (result.classification === 'unique') {
      const list = document.createElement('div');
      list.className = 'solution-list';
      result.solution.forEach((value, index) => {
        const row = document.createElement('div');
        row.className = 'solution-row';
        row.innerHTML = `<strong>${String.fromCharCode(120 + index)}</strong><span>${MatrixSolver.formatNumber(value)}</span>`;
        list.appendChild(row);
      });
      solutionContainer.appendChild(list);
    } else if (result.classification === 'infinite') {
      solutionContainer.innerHTML = '<p class="empty-note">El sistema es compatible indeterminado: hay variables libres y, por tanto, infinitas soluciones.</p>';
    } else {
      solutionContainer.innerHTML = '<p class="empty-note">Las ecuaciones son incompatibles. No existe ningún conjunto de valores que satisfaga todo el sistema.</p>';
    }
  }

  function renderSteps(steps) {
    stepsContainer.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'steps-list';
    steps.forEach((step, index) => {
      const card = document.createElement('div');
      card.className = 'step';
      const title = document.createElement('div');
      title.className = 'step-title';
      title.textContent = `${index + 1}. ${step.label}`;
      card.appendChild(title);
      card.appendChild(renderMatrix(step.matrix));
      if (step.note) {
        const note = document.createElement('div');
        note.className = 'step-note';
        note.textContent = step.note;
        card.appendChild(note);
      }
      list.appendChild(card);
    });
    stepsContainer.appendChild(list);
  }

  function renderResult(result) {
    resultSection.hidden = false;
    resultBadge.className = `result-badge ${result.classification}`;
    resultBadge.textContent = statusText(result.classification);
    resultSummary.textContent = result.classification === 'unique'
      ? `El sistema tiene una solución única. Rango de A: ${result.rankA}; rango de la matriz aumentada: ${result.rankAugmented}.`
      : result.classification === 'infinite'
        ? `El sistema tiene infinitas soluciones. Rango de A: ${result.rankA}; rango de la matriz aumentada: ${result.rankAugmented}.`
        : `El sistema no tiene solución porque la matriz de coeficientes y la aumentada tienen rangos distintos (${result.rankA} y ${result.rankAugmented}).`;
    solutionContainer.innerHTML = '';
    renderSolution(result);
    reducedMatrixContainer.innerHTML = '';
    reducedMatrixContainer.appendChild(renderMatrix(result.matrix));
    rankLabel.textContent = `r(A) = ${result.rankA} · r(A|b) = ${result.rankAugmented}`;
    methodLabel.textContent = result.method;
    renderSteps(result.steps);
  }

  function solveSystem() {
    resetResults();
    const matrix = getMatrixFromInputs();
    try {
      if (matrix.some(row => row.some(value => !Number.isFinite(value)))) {
        throw new Error('Completa todos los campos de la matriz con números válidos.');
      }
      const result = MatrixSolver.solve(matrix, methodSelect.value);
      renderResult(result);
    } catch (error) {
      showError(error.message || 'No se pudo resolver el sistema.');
    }
  }

  function loadExample() {
    const example = examples[exampleBtn.dataset.mode || 'unique'];
    equationsSelect.value = String(example.equations);
    variablesSelect.value = String(example.variables);
    buildMatrix(example.matrix);
    resetResults();
  }

  populateSelect(equationsSelect, 'ecuación');
  populateSelect(variablesSelect, 'variable');
  equationsSelect.value = '2';
  variablesSelect.value = '2';
  exampleBtn.dataset.mode = 'unique';
  buildMatrix();

  equationsSelect.addEventListener('change', () => { buildMatrix(); resetResults(); });
  variablesSelect.addEventListener('change', () => { buildMatrix(); resetResults(); });
  solveBtn.addEventListener('click', solveSystem);
  clearBtn.addEventListener('click', clearAll);
  exampleBtn.addEventListener('click', () => {
    const order = ['unique', 'infinite', 'none'];
    const current = order.indexOf(exampleBtn.dataset.mode || 'unique');
    exampleBtn.dataset.mode = order[(current + 1) % order.length];
    loadExample();
  });
  toggleStepsBtn.addEventListener('click', () => {
    const isHidden = stepsContainer.hidden;
    stepsContainer.hidden = !isHidden;
    toggleStepsBtn.textContent = isHidden ? 'Ocultar pasos' : 'Mostrar pasos';
    toggleStepsBtn.setAttribute('aria-expanded', String(isHidden));
  });
})();
