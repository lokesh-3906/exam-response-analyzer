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
];

const selectedFileLabels = {
  'single-file': document.getElementById('single-file-name'),
  'response-file': document.getElementById('response-file-name'),
  'answer-key-file': document.getElementById('answer-key-file-name')
};

function updateMode(mode) {
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
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#ff7b7b' : '#2dd4bf';
}

function showLoading() {
  loadingOverlay.classList.add('show');
  loadingOverlay.setAttribute('aria-hidden', 'false');
}

function hideLoading() {
  loadingOverlay.classList.remove('show');
  loadingOverlay.setAttribute('aria-hidden', 'true');
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => updateMode(button.dataset.mode));
});

markingScheme.addEventListener('change', () => {
  const isCustom = markingScheme.value === 'custom';
  customMarks.classList.toggle('hidden', !isCustom);
});

fileInputs.forEach((input) => {
  const zone = input.closest('.drop-zone');
  const label = selectedFileLabels[input.id];

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
    label.textContent = 'No file selected';
  });
  updateMode('single');
  customMarks.classList.add('hidden');
  markingScheme.value = 'ap-eamcet';
  showStatus('Form reset.');
});

updateMode('single');
customMarks.classList.add('hidden');
