const form = document.getElementById('analysis-form');
const uploadGrid = document.getElementById('upload-grid');
const modeButtons = document.querySelectorAll('.mode-btn');
const markingScheme = document.getElementById('exam-type');
const customMarks = document.getElementById('custom-marks');
const statusMessage = document.getElementById('status-message');
const loadingOverlay = document.getElementById('loading-overlay');

const fileInputs = [
  document.getElementById('single-file'),
  document.getElementById('response-file'),
  document.getElementById('answer-key-file')
].filter(Boolean);

const selectedFileLabels = {
  'single-file': document.getElementById('single-file-name'),
  'response-file': document.getElementById('response-file-name'),
  'answer-key-file': document.getElementById('answer-key-file-name')
};

function updateMode(mode) {
  if (!uploadGrid) {
    return;
  }

  uploadGrid.dataset.mode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
}

function updateFileName(input, label) {
  const file = input.files && input.files[0];
  label.textContent = file ? file.name : 'No file selected';
}

function showStatus(message, isError = false) {
  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#ff7b7b' : '#2dd4bf';
}

function showLoading() {
  if (!loadingOverlay) {
    return;
  }

  loadingOverlay.classList.add('show');
  loadingOverlay.setAttribute('aria-hidden', 'false');
}

function hideLoading() {
  if (!loadingOverlay) {
    return;
  }

  loadingOverlay.classList.remove('show');
  loadingOverlay.setAttribute('aria-hidden', 'true');
}

function initUploadExperience() {
  if (!form || !markingScheme) {
    return;
  }

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => updateMode(button.dataset.mode));
  });

  markingScheme.addEventListener('change', () => {
    const isCustom = markingScheme.value === 'custom';
    if (customMarks) {
      customMarks.classList.toggle('hidden', !isCustom);
    }
  });

  fileInputs.forEach((input) => {
    const zone = input.closest('.drop-zone');
    const label = selectedFileLabels[input.id];

    if (!zone || !label) {
      return;
    }

    input.addEventListener('change', () => updateFileName(input, label));

    ['dragenter', 'dragover'].forEach((eventName) => {
      zone.addEventListener(eventName, (event) => {
        event.preventDefault();
        zone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      zone.addEventListener(eventName, (event) => {
        event.preventDefault();
        zone.classList.remove('drag-over');
      });
    });

    zone.addEventListener('drop', (event) => {
      const droppedFiles = event.dataTransfer?.files;
      if (!droppedFiles || droppedFiles.length === 0) {
        return;
      }

      const file = droppedFiles[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        showStatus('Please upload a PDF file.', true);
        return;
      }

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      updateFileName(input, label);
      showStatus(`${file.name} ready to analyze.`);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showLoading();
    showStatus('Preparing your analysis...');

    window.setTimeout(() => {
      hideLoading();
      showStatus('Analysis ready. Connect your backend to process the uploaded PDF files.');
    }, 1400);
  });

  form.addEventListener('reset', () => {
    Object.values(selectedFileLabels).forEach((label) => {
      if (label) {
        label.textContent = 'No file selected';
      }
    });
    updateMode('single');
    if (customMarks) {
      customMarks.classList.add('hidden');
    }
    markingScheme.value = 'ap-eamcet';
    showStatus('Form reset.');
  });

  updateMode('single');
  if (customMarks) {
    customMarks.classList.add('hidden');
  }
}

function animateValue(element, target, suffix = '') {
  const duration = 900;
  const startTime = performance.now();
  const startValue = 0;

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (target - startValue) * eased);
    element.textContent = `${current}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    }
  }

  window.requestAnimationFrame(frame);
}

function initDashboard() {
  const statsGrid = document.getElementById('stats-grid');
  const tableBody = document.getElementById('results-table-body');
  const downloadCsvButton = document.getElementById('download-csv');
  const downloadPdfButton = document.getElementById('download-pdf');

  if (!statsGrid || !tableBody) {
    return;
  }

  const results = [
    { question: 1, selected: 'B', correct: 'C', status: 'wrong' },
    { question: 2, selected: 'A', correct: 'A', status: 'correct' },
    { question: 3, selected: 'D', correct: 'B', status: 'wrong' },
    { question: 4, selected: 'C', correct: 'C', status: 'correct' },
    { question: 5, selected: '-', correct: 'A', status: 'skipped' },
    { question: 6, selected: 'B', correct: 'B', status: 'correct' },
    { question: 7, selected: 'A', correct: 'D', status: 'wrong' },
    { question: 8, selected: 'C', correct: 'C', status: 'correct' },
    { question: 9, selected: '-', correct: 'B', status: 'skipped' },
    { question: 10, selected: 'D', correct: 'D', status: 'correct' }
  ];

  const correct = results.filter((item) => item.status === 'correct').length;
  const wrong = results.filter((item) => item.status === 'wrong').length;
  const skipped = results.filter((item) => item.status === 'skipped').length;
  const accuracy = Math.round((correct / results.length) * 100);

  const summaryCards = [
    { label: 'Total Score', value: correct, suffix: '' },
    { label: 'Correct Answers', value: correct, suffix: '' },
    { label: 'Wrong Answers', value: wrong, suffix: '' },
    { label: 'Skipped Answers', value: skipped, suffix: '' },
    { label: 'Accuracy', value: accuracy, suffix: '%' }
  ];

  statsGrid.innerHTML = summaryCards.map((card) => `
    <article class="stat-card">
      <span class="stat-label">${card.label}</span>
      <div class="stat-value" data-target="${card.value}" data-suffix="${card.suffix}"></div>
    </article>
  `).join('');

  tableBody.innerHTML = results.map((item) => `
    <tr>
      <td>${item.question}</td>
      <td>${item.selected}</td>
      <td>${item.correct}</td>
      <td><span class="status-pill ${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
    </tr>
  `).join('');

  statsGrid.querySelectorAll('.stat-value').forEach((valueEl) => {
    const target = Number(valueEl.dataset.target || 0);
    const suffix = valueEl.dataset.suffix || '';
    animateValue(valueEl, target, suffix);
  });

  function downloadReport(extension) {
    const lines = [
      'Exam Response Analyzer Report',
      '=============================',
      `Total Score,${correct}`,
      `Correct Answers,${correct}`,
      `Wrong Answers,${wrong}`,
      `Skipped Answers,${skipped}`,
      `Accuracy,${accuracy}%`,
      '',
      'Question Number,Selected Option,Correct Option,Status'
    ];

    results.forEach((item) => {
      lines.push(`${item.question},${item.selected},${item.correct},${item.status}`);
    });

    const content = extension === 'csv' ? lines.join('\n') : lines.join('\n');
    const blob = new Blob([content], { type: extension === 'csv' ? 'text/csv;charset=utf-8' : 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam-response-report.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  downloadCsvButton?.addEventListener('click', () => downloadReport('csv'));
  downloadPdfButton?.addEventListener('click', () => downloadReport('pdf'));
}

initUploadExperience();
initDashboard();
