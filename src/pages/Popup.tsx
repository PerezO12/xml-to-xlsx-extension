import React, { useState, useEffect } from 'react';
import DragArea from '../components/DragArea';
import FileList from '../components/FileList';
import OptionsPanel from '../components/OptionsPanel';
import ProgressBar from '../components/ProgressBar';
import { DICCIONARIO_CV, ORDEN_CAMPOS_POR_DEFECTO } from '../utils/constants';
import { parseMultipleNFeFiles, ParsedNFeData } from '../utils/xmlParser';
import { saveTempState, getTempState, clearTempState, saveUserConfig, getUserConfig } from '../utils/storage';

// Declaración para el objeto chrome/browser de la API de extensiones
declare const chrome: {
  runtime: {
    getURL: (path: string) => string;
  }
};

declare const browser: {
  runtime: {
    getURL: (path: string) => string;
  }
};

interface FileItem {
  name: string;
  size: number;
  file?: File; // Agregar referencia al archivo real
}

// Importación dinámica para las funciones de generación de XLSX
const loadExcelGenerator = async () => {
  const module = await import('../utils/excelGenerator');
  return {
    generateXlsx: module.generateXlsx,
    generateXlsxWithMultipleSheets: module.generateXlsxWithMultipleSheets
  };
};

interface PopupProps {
  isPopup?: boolean; // Nueva prop para saber si estamos en un popup
}

const Popup: React.FC<PopupProps> = ({ isPopup = false }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({});
  const [multipleSheets, setMultipleSheets] = useState<boolean>(false);
  const [formatCurrency, setFormatCurrency] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [excelGenerator, setExcelGenerator] = useState<any>(null);
  const [stateRestored, setStateRestored] = useState<boolean>(false);

  // Inicializar el mapeo con el orden por defecto y cargar configuración guardada
  useEffect(() => {
    const initializeState = async () => {
      // Configuración por defecto
      const defaultMapping: Record<string, string> = {};
      ORDEN_CAMPOS_POR_DEFECTO.forEach(xmlPath => {
        if (DICCIONARIO_CV[xmlPath]) {
          defaultMapping[xmlPath] = DICCIONARIO_CV[xmlPath];
        }
      });

      try {
        // Intentar restaurar estado temporal primero
        const tempState = await getTempState();
        if (tempState) {
          console.log('Restaurando estado temporal:', tempState);
          setCustomMapping(tempState.mapping || defaultMapping);
          setMultipleSheets(tempState.multipleSheets || false);
          setFormatCurrency(tempState.formatCurrency !== undefined ? tempState.formatCurrency : true);
          // Los archivos no se pueden restaurar por seguridad del navegador
          setStateRestored(true);
          // Limpiar estado temporal después de restaurar
          await clearTempState();
          return;
        }

        // Si no hay estado temporal, cargar configuración de usuario
        const userConfig = await getUserConfig();
        setCustomMapping(userConfig.mapping || defaultMapping);
        setMultipleSheets(userConfig.multipleSheets || false);
        setFormatCurrency(userConfig.formatCurrency !== undefined ? userConfig.formatCurrency : true);
      } catch (error) {
        console.error('Error al inicializar estado:', error);
        setCustomMapping(defaultMapping);
      }
    };

    initializeState();
  }, []);

  // Guardar configuración cuando cambie
  useEffect(() => {
    const saveConfig = async () => {
      if (customMapping && Object.keys(customMapping).length > 0) {
        await saveUserConfig({
          mapping: customMapping,
          multipleSheets,
          formatCurrency
        });
      }
    };

    // Solo guardar después de que el estado inicial se haya cargado
    if (Object.keys(customMapping).length > 0) {
      saveConfig();
    }
  }, [customMapping, multipleSheets, formatCurrency]);

  useEffect(() => {
    loadExcelGenerator().then(generator => {
      setExcelGenerator(generator);
    }).catch(error => {
      console.error('Error al cargar el módulo de generación de XLSX:', error);
    });
  }, []);

  const handleFilesChange = (newFiles: FileItem[]) => {
    if (newFiles.length > 2000) {
      alert('El límite máximo de archivos XML es 2000. Por favor, selecciona menos archivos.');
      return;
    }
    if (newFiles.length > 1000) {
      const confirmProcess = window.confirm(`Has seleccionado ${newFiles.length} archivos XML. Procesar más de 1000 archivos puede tomar más tiempo. ¿Deseas continuar?`);
      if (!confirmProcess) return;
    }
    setFiles(newFiles);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleClearAllFiles = () => {
    setFiles([]);
  };

  const handleMappingChange = (updatedMapping: Record<string, string>) => {
    setCustomMapping(updatedMapping);
  };

  const handleConvert = async () => {
    if (files.length === 0 || !excelGenerator) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressText(`Procesando 0 de ${files.length} archivos...`);

    try {
      // Filtrar solo archivos que tienen referencia al archivo real
      const validFiles = files.filter(fileItem => fileItem.file).map(fileItem => fileItem.file!);
      
      if (validFiles.length === 0) {
        throw new Error('No hay archivos válidos para procesar');
      }

      console.log('Archivos válidos:', validFiles.length);
      console.log('Mapeo personalizado:', customMapping);

      // Procesar archivos XML
      const nfeDataArray = await parseMultipleNFeFiles(validFiles, customMapping);
      
      console.log('Datos parseados:', nfeDataArray);
      console.log('Primer elemento:', nfeDataArray[0]);

      setProgressText('Generando archivo XLSX...');
      let xlsxBuffer;
      if (multipleSheets) {
        xlsxBuffer = await excelGenerator.generateXlsxWithMultipleSheets(nfeDataArray, customMapping, formatCurrency);
      } else {
        xlsxBuffer = await excelGenerator.generateXlsx(nfeDataArray, customMapping, formatCurrency);
      }

      setProgressText('Descargando archivo...');
      const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted_nfe.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setProgressText('Conversión completada!');
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setProgressText('');
      }, 2000);

    } catch (error) {
      console.error('Error durante la conversión:', error);
      setProgressText('Error durante la conversión. Por favor, intenta de nuevo.');
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setProgressText('');
      }, 3000);
    }
  };

  const openCargaPage = async () => {
    // Guardar estado actual antes de abrir la página completa
    await saveTempState({
      files: files.map(f => ({ name: f.name, size: f.size })),
      mapping: customMapping,
      multipleSheets,
      formatCurrency
    });

    // Abrir la página de carga en una nueva pestaña
    try {
      const runtime = typeof browser !== 'undefined' ? browser : chrome;
      const url = runtime.runtime.getURL('carga.html');
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al abrir página de carga:', error);
    }
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex items-center justify-center">
      <div className="container mx-auto p-4 max-w-4xl bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">XML to XLSX Converter</h1>
        
        {/* Mensaje de estado restaurado */}
        {stateRestored && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-green-800 text-sm font-medium">
                  ✅ Configuración restaurada desde sesión anterior
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Mensaje informativo mejorado sobre el problema del popup */}
        {isPopup && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  🦊 Firefox: Limitación del Popup
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    En Firefox, los popups se cierran al hacer clic fuera (como al abrir el explorador de archivos).
                    <br />
                    <strong>Solución:</strong> Usa drag & drop aquí mismo, o abre la página completa.
                  </p>
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={openCargaPage}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md"
                  >
                    🚀 Abrir Página Completa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DragArea onFilesChange={handleFilesChange} isPopup={isPopup} />
        {files.length > 0 && (
          <>
            <FileList files={files} onRemoveFile={handleRemoveFile} />
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearAllFiles}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition-colors"
              >
                Limpiar todos
              </button>
            </div>
          </>
        )}
        <OptionsPanel 
          mapping={customMapping} 
          onMappingChange={handleMappingChange} 
          multipleSheets={multipleSheets} 
          setMultipleSheets={setMultipleSheets} 
          formatCurrency={formatCurrency} 
          setFormatCurrency={setFormatCurrency} 
        />
        <button 
          onClick={handleConvert} 
          disabled={files.length === 0 || isProcessing} 
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Convertir a XLSX
        </button>
        {isProcessing && <ProgressBar progress={progress} text={progressText} />}
      </div>
    </div>
  );
};

export default Popup;