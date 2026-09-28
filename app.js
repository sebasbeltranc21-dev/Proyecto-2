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
  const stepsHint = document.getElementById('stepsHint');
  const historyContainer = document.getElementById('historyContainer');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const presetButtons = [...document.querySelectorAll('[data-example]')];
  const copyResultBtn = document.getElementById('copyResultBtn');
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  const printResultBtn = document.getElementById('printResultBtn');
  const exportStatus = document.getElementById('exportStatus');
  const HISTORY_KEY = 'matrix-solver-history-v1';
  const MAX_HISTORY = 8;
  let lastResult = null;
  let lastMatrix = null;

  const examples = {
    unique: { equations: 2, variables: 2, matrix: [['2', '1', '5'], ['1', '-1', '1']] },
    fraction: { equations: 2, variables: 2, matrix: [['1/3', '1/2', '5/6'], ['2/3', '-1/2', '1/6']] },
    infinite: { equations: 2, variables: 2, matrix: [['1', '1', '2'], ['2', '2', '4']] },
    none: { equations: 2, variables: 2, matrix: [['1', '1', '2'], ['2', '2', '5']] },
    five: {
      equations: 5,
      variables: 5,
      matrix: [
        ['1', '0', '0', '0', '0', '3'],
        ['0', '1', '0', '0', '0', '-2'],
        ['0', '0', '1', '0', '0', '5'],
        ['0', '0', '0', '1', '0', '7'],
        ['0', '0', '0', '0', '1', '-1']
      ]
    }
  };

  const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v'];

  function variableName(index) {
    return VARIABLE_NAMES[index] || `x${index + 1}`;
  }

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
        input.type = 'text';
        input.inputMode = 'decimal';
        input.autocomplete = 'off';
        input.placeholder = '0 · 1/2';
        input.setAttribute('aria-label', c === variables
          ? `Ecuación ${r + 1}, término independiente`
          : `Ecuación ${r + 1}, variable ${variableName(c)}`);
        input.value = values?.[r]?.[c] ?? '';
        row.appendChild(input);
      }
      matrixContainer.appendChild(row);
    }
  }

  function getMatrixFromInputs() {
    return [...matrixContainer.querySelectorAll('.matrix-row')].map(row =>
      [...row.querySelectorAll('input')].map(input => input.value.trim())
    );
  }

  function resetResults() {
    resultSection.hidden = true;
    inputError.hidden = true;
    inputError.textContent = '';
    stepsContainer.hidden = true;
    stepsHint.hidden = true;
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
        row.innerHTML = `<strong>${variableName(index)}</strong><span>${MatrixSolver.formatNumber(value)}</span>`;
        list.appendChild(row);
      });
      solutionContainer.appendChild(list);
      return;
    }

    if (result.classification === 'infinite') {
      const wrap = document.createElement('div');
      wrap.className = 'parametric-solution';
      const intro = document.createElement('p');
      intro.className = 'empty-note';
      intro.textContent = result.parametricSolution.parameters.length === 1
        ? 'La variable libre se representa con un parámetro.'
        : 'Las variables libres se representan con parámetros.';
      wrap.appendChild(intro);

      const parameterRow = document.createElement('div');
      parameterRow.className = 'parameter-box';
      parameterRow.innerHTML = `<strong>Libres:</strong> ${result.parametricSolution.parameters.map(item => `<span>${variableName(item.column)} = ${item.name}</span>`).join(' · ')}`;
      wrap.appendChild(parameterRow);

      const list = document.createElement('div');
      list.className = 'solution-list';
      result.parametricSolution.expressions.forEach(expression => {
        const row = document.createElement('div');
        row.className = 'solution-row';
        row.innerHTML = `<strong>${variableName(expression.variable)}</strong><span class="expression">${expression.text}</span>`;
        list.appendChild(row);
      });
      wrap.appendChild(list);
      solutionContainer.appendChild(wrap);
      return;
    }

    solutionContainer.innerHTML = '<p class="empty-note">Las ecuaciones son incompatibles. No existe ningún conjunto de valores que satisfaga todo el sistema.</p>';
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
      list.appendChild(card);
    });
    stepsContainer.appendChild(list);
  }

  function solutionText(result) {
    if (result.classification === 'unique') {
      return result.solution
        .map((value, index) => `${variableName(index)} = ${MatrixSolver.formatNumber(value)}`)
        .join('\\n');
    }

    if (result.classification === 'infinite') {
      return result.parametricSolution.expressions
        .map(expression => `${variableName(expression.variable)} = ${expression.text}`)
        .join('\\n');
    }

    return 'El sistema no tiene solución.';
  }

  function matrixText(matrix) {
    return matrix.map(row => row.map(value => MatrixSolver.formatNumber(value)).join('   |   ')).join('\\n');
  }

  function buildReport() {
    if (!lastResult || !lastMatrix) return '';
    const method = lastResult.method;
    const type = lastResult.matrixType;
    const status = statusText(lastResult.classification);
    const lines = [
      'MATRIX SOLVER',
      '==============================',
      `Método: ${method}`,
      `Estado: ${status}`,
      `Rango A: ${lastResult.rankA}`,
      `Rango (A|b): ${lastResult.rankAugmented}`,
      '',
      'MATRIZ DE ENTRADA',
      '------------------------------',
      matrixText(lastMatrix),
      '',
      'SOLUCIÓN',
      '------------------------------',
      solutionText(lastResult),
      '',
      type.toUpperCase(),
      '------------------------------',
      matrixText(lastResult.matrix),
      '',
      'PROCEDIMIENTO',
      '------------------------------'
    ];

    lastResult.steps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step.label}`);
      lines.push(matrixText(step.matrix));
      lines.push('');
    });

    lines.push('Generado por Matrix Solver.');
    return lines.join('\\n');
  }

  function notifyExport(message, isError = false) {
    exportStatus.textContent = message;
    exportStatus.className = `export-status${isError ? ' error' : ''}`;
    exportStatus.hidden = false;
    window.clearTimeout(notifyExport.timer);
    notifyExport.timer = window.setTimeout(() => {
      exportStatus.hidden = true;
    }, 3000);
  }

  async function copyResult() {
    if (!lastResult) return;
    const text = solutionText(lastResult);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      notifyExport('✅ Solución copiada al portapapeles.');
    } catch (error) {
      notifyExport('No se pudo copiar automáticamente. Selecciona y copia el resultado manualmente.', true);
    }
  }

  function downloadReport() {
    if (!lastResult || !lastMatrix) return;
    try {
      const blob = new Blob([buildReport()], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'matrix-solver-reporte.txt';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notifyExport('✅ Reporte descargado.');
    } catch (error) {
      notifyExport('No se pudo generar el reporte.', true);
    }
  }

  function printResult() {
    if (!lastResult) return;
    notifyExport('Se abrió el diálogo de impresión. Puedes elegir “Guardar como PDF”.');
    window.print();
  }

  function saveToHistory(matrix, result, method) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      matrix: matrix.map(row => row.slice()),
      equations: matrix.length,
      variables: matrix[0].length - 1,
      method,
      classification: result.classification,
      createdAt: new Date().toISOString()
    };
    try {
      const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const safeCurrent = Array.isArray(current) ? current : [];
      localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...safeCurrent].slice(0, MAX_HISTORY)));
    } catch (error) {}
    renderHistory();
  }

  function renderHistory() {
    historyContainer.innerHTML = '';
    let items = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      items = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      items = [];
    }

    if (!items.length) {
      historyContainer.innerHTML = '<p class="empty-note">Todavía no hay sistemas guardados.</p>';
      return;
    }

    items.forEach(entry => {
      const item = document.createElement('article');
      item.className = 'history-item';

      const info = document.createElement('div');
      info.className = 'history-info';
      const title = document.createElement('strong');
      title.textContent = `${entry.equations} ecuaciones · ${entry.variables} variables`;
      const meta = document.createElement('span');
      meta.textContent = `${statusText(entry.classification)} · ${entry.method === 'gaussian' ? 'Gauss' : 'Gauss-Jordan'} · ${formatHistoryDate(entry.createdAt)}`;
      info.append(title, meta);

      const badge = document.createElement('span');
      badge.className = `history-status ${entry.classification}`;
      badge.textContent = statusText(entry.classification);

      const actions = document.createElement('div');
      actions.className = 'history-actions';

      const load = document.createElement('button');
      load.type = 'button';
      load.className = 'text-btn';
      load.textContent = 'Cargar';
      load.addEventListener('click', () => loadHistoryEntry(entry));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'history-delete';
      remove.setAttribute('aria-label', 'Eliminar sistema del historial');
      remove.textContent = '×';
      remove.addEventListener('click', () => deleteHistoryEntry(entry.id));

      actions.append(load, remove);
      item.append(info, badge, actions);
      historyContainer.appendChild(item);
    });
  }

  function formatHistoryDate(value) {
    try {
      return new Intl.DateTimeFormat('es-EC', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
    } catch (error) {
      return 'fecha no disponible';
    }
  }

  function loadHistoryEntry(entry) {
    equationsSelect.value = String(entry.equations);
    variablesSelect.value = String(entry.variables);
    methodSelect.value = entry.method;
    buildMatrix(entry.matrix);
    resetResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteHistoryEntry(id) {
    try {
      const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const updated = Array.isArray(current) ? current.filter(entry => entry.id !== id) : [];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {}
    renderHistory();
  }

  function clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {}
    renderHistory();
  }

  function loadExample(name) {
    const example = examples[name];
    if (!example) return;
    equationsSelect.value = String(example.equations);
    variablesSelect.value = String(example.variables);
    buildMatrix(example.matrix);
    resetResults();
  }

  function renderResult(result) {
    resultSection.hidden = false;
    resultBadge.className = `result-badge ${result.classification}`;
    resultBadge.textContent = statusText(result.classification);

    resultSummary.textContent = result.classification === 'unique'
      ? `El sistema tiene una solución única. Los resultados se muestran como fracciones exactas cuando es necesario.`
      : result.classification === 'infinite'
        ? 'El sistema tiene infinitas soluciones. Se muestran en forma paramétrica y con fracciones exactas.'
        : `El sistema no tiene solución porque la matriz de coeficientes y la aumentada tienen rangos distintos (${result.rankA} y ${result.rankAugmented}).`;

    renderSolution(result);
    reducedMatrixContainer.innerHTML = '';
    reducedMatrixContainer.appendChild(renderMatrix(result.matrix));
    rankLabel.textContent = `r(A) = ${result.rankA} · r(A|b) = ${result.rankAugmented}`;
    methodLabel.textContent = result.matrixType;
    renderSteps(result.steps);
  }

  function solveSystem() {
    resetResults();
    const matrix = getMatrixFromInputs();
    try {
      const result = MatrixSolver.solve(matrix, methodSelect.value);
      lastMatrix = matrix.map(row => row.slice());
      lastResult = result;
      renderResult(result);
      saveToHistory(matrix, result, methodSelect.value);
    } catch (error) {
      lastResult = null;
      lastMatrix = null;
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
  renderHistory();

  equationsSelect.addEventListener('change', () => { buildMatrix(); resetResults(); });
  variablesSelect.addEventListener('change', () => { buildMatrix(); resetResults(); });
  solveBtn.addEventListener('click', solveSystem);
  clearBtn.addEventListener('click', clearAll);
  clearHistoryBtn.addEventListener('click', clearHistory);
  copyResultBtn.addEventListener('click', copyResult);
  downloadReportBtn.addEventListener('click', downloadReport);
  printResultBtn.addEventListener('click', printResult);
  presetButtons.forEach(button => {
    button.addEventListener('click', () => loadExample(button.dataset.example));
  });

  exampleBtn.addEventListener('click', () => {
    const order = ['unique', 'fraction', 'infinite', 'none'];
    const current = order.indexOf(exampleBtn.dataset.mode || 'unique');
    exampleBtn.dataset.mode = order[(current + 1) % order.length];
    loadExample();
  });
  toggleStepsBtn.addEventListener('click', () => {
    const isHidden = stepsContainer.hidden;
    stepsContainer.hidden = !isHidden;
    stepsHint.hidden = !isHidden;
    toggleStepsBtn.textContent = isHidden ? 'Ocultar pasos' : 'Mostrar pasos';
    toggleStepsBtn.setAttribute('aria-expanded', String(isHidden));
  });
})();
