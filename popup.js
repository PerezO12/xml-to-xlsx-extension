import { DICCIONARIO_CV } from './src/utils/constants.js';

document.addEventListener('DOMContentLoaded', () => {
  const dragArea = document.getElementById('dragArea');
  const browseBtn = document.getElementById('browseBtn');
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  const convertBtn = document.getElementById('convertBtn');
  const multipleSheetsCheckbox = document.getElementById('multipleSheets');
  const formatCurrencyCheckbox = document.getElementById('formatCurrency');
  const customizeFieldsBtn = document.getElementById('customizeFieldsBtn');
  const fieldsContainer = document.getElementById('fieldsContainer');
  const fieldsList = document.getElementById('fieldsList');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  let selectedFiles = [];
  let customMapping = { ...DICCIONARIO_CV };

  // Configuración de eventos para drag and drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dragArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dragArea.classList.add('dragover');
    });
  });

  ['dragleave', 'dragend'].forEach(eventName => {
    dragArea.addEventListener(eventName, () => {
      dragArea.classList.remove('dragover');
    });
  });

  dragArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
  });

  // Configuración de eventos para selección de archivos
  browseBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
  });

  // Función para manejar archivos seleccionados
  function handleFiles(files) {
    const xmlFiles = Array.from(files).filter(file => file.type === 'text/xml' || file.name.endsWith('.xml'));
    if (xmlFiles.length > 2000) {
      alert('El límite máximo de archivos XML es 2000. Por favor, selecciona menos archivos.');
      return;
    }
    if (xmlFiles.length > 1000) {
      const confirmProcess = confirm(`Has seleccionado ${xmlFiles.length} archivos XML. Procesar más de 1000 archivos puede tomar más tiempo. ¿Deseas continuar?`);
      if (!confirmProcess) return;
    }
    if (xmlFiles.length > 0) {
      selectedFiles = xmlFiles;
      updateFileList();
      convertBtn.disabled = false;
    } else {
      alert('Por favor, selecciona archivos XML válidos.');
    }
  }

  // Actualizar la lista de archivos seleccionados
  function updateFileList() {
    fileList.innerHTML = '';
    fileList.classList.add('show');
    fileList.classList.remove('hidden');
    selectedFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.classList.add('flex', 'justify-between', 'items-center', 'py-1', 'border-b', 'border-gray-100');
      fileItem.innerHTML = `
        <span class="text-gray-700 truncate flex-1">${file.name}</span>
        <button class="text-red-500 hover:text-red-700 ml-2 remove-file" data-index="${index}">X</button>
      `;
      fileList.appendChild(fileItem);
    });

    // Añadir eventos a los botones de eliminar archivo
    document.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        selectedFiles.splice(index, 1);
        updateFileList();
        if (selectedFiles.length === 0) {
          convertBtn.disabled = true;
          fileList.classList.add('hidden');
          fileList.classList.remove('show');
        }
      });
    });
  }

  // Configuración de personalización de campos
  customizeFieldsBtn.addEventListener('click', () => {
    fieldsContainer.classList.toggle('hidden');
    if (!fieldsContainer.classList.contains('hidden')) {
      populateFieldsList();
    }
  });

  function populateFieldsList() {
    fieldsList.innerHTML = '';
    Object.entries(DICCIONARIO_CV).forEach(([key, value]) => {
      const fieldItem = document.createElement('div');
      fieldItem.classList.add('flex', 'items-center');
      fieldItem.innerHTML = `
        <input type="checkbox" id="field-${key}" data-key="${key}" class="mr-2" checked>
        <label for="field-${key}" class="text-gray-700 truncate">${value}</label>
      `;
      fieldsList.appendChild(fieldItem);
    });

    // Añadir eventos a los checkboxes
    document.querySelectorAll('#fieldsList input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        if (e.target.checked) {
          customMapping[key] = DICCIONARIO_CV[key];
        } else {
          delete customMapping[key];
        }
      });
    });
  }

  selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('#fieldsList input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = true;
      const key = checkbox.dataset.key;
      customMapping[key] = DICCIONARIO_CV[key];
    });
  });

  deselectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('#fieldsList input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
      const key = checkbox.dataset.key;
      delete customMapping[key];
    });
  });

  // Evento para el botón de conversión
  convertBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    progressContainer.classList.remove('hidden');
    progressText.textContent = `Procesando 0 de ${selectedFiles.length} archivos...`;
    progressBar.style.width = '0%';
    convertBtn.disabled = true;

    try {
      // Usar Web Worker para procesar los archivos XML
      const worker = new Worker('./src/utils/xmlWorker.js');
      worker.postMessage({ xmlFiles: selectedFiles, mappingProfile: customMapping });

      worker.onmessage = async (e) => {
        if (e.data.type === 'progress') {
          progressText.textContent = `Procesando ${e.data.processed} de ${e.data.total} archivos...`;
          progressBar.style.width = `${(e.data.processed / e.data.total) * 100}%`;
        } else if (e.data.type === 'result') {
          const nfeDataArray = e.data.data;

          progressText.textContent = 'Generando archivo XLSX...';
          let xlsxBuffer;
          if (multipleSheetsCheckbox.checked) {
            xlsxBuffer = await generateXlsxWithMultipleSheets(nfeDataArray, customMapping, formatCurrencyCheckbox.checked);
          } else {
            xlsxBuffer = await generateXlsx(nfeDataArray, customMapping, formatCurrencyCheckbox.checked);
          }

          progressText.textContent = 'Descargando archivo...';
          const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'converted_nfe.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          progressText.textContent = 'Conversión completada!';
          setTimeout(() => {
            progressContainer.classList.add('hidden');
            convertBtn.disabled = false;
          }, 2000);
        }
      };

      worker.onerror = (error) => {
        console.error('Error en el Web Worker:', error);
        progressText.textContent = 'Error durante la conversión. Por favor, intenta de nuevo.';
        setTimeout(() => {
          progressContainer.classList.add('hidden');
          convertBtn.disabled = false;
        }, 3000);
      };
    } catch (error) {
      console.error('Error durante la conversión:', error);
      progressText.textContent = 'Error durante la conversión. Por favor, intenta de nuevo.';
      setTimeout(() => {
        progressContainer.classList.add('hidden');
        convertBtn.disabled = false;
      }, 3000);
    }
  });

  // Importación dinámica de funciones de generación de XLSX
  async function loadExcelGenerator() {
    const { generateXlsx, generateXlsxWithMultipleSheets } = await import('./src/utils/excelGenerator.js');
    return { generateXlsx, generateXlsxWithMultipleSheets };
  }

  loadExcelGenerator().catch(error => {
    console.error('Error al cargar el módulo de generación de XLSX:', error);
  });
}); 