import { useState, useEffect } from 'preact/hooks';
import { JSX } from 'preact';
import DragArea from '../components/DragArea';
import FileList from '../components/FileList';
import OptionsPanel from '../components/OptionsPanel';
import ProgressBar from '../components/ProgressBar';
import { DICCIONARIO_CV, ORDEN_CAMPOS_POR_DEFECTO } from '../utils/constants';
import { parseMultipleNFeFiles } from '../utils/xmlParser';
import { saveUserConfig, getUserConfig } from '../utils/storage';

interface FileItem {
  name: string;
  size: number;
  file?: File;
}

const loadExcelGenerator = async () => {
  const module = await import('../utils/excelGenerator');
  return {
    generateXlsx: module.generateXlsx,
    generateXlsxWithMultipleSheets: module.generateXlsxWithMultipleSheets
  };
};

const Carga = (): JSX.Element => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({});
  const [multipleSheets, setMultipleSheets] = useState<boolean>(false);
  const [formatCurrency, setFormatCurrency] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [excelGenerator, setExcelGenerator] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    const initializeState = async () => {
      const defaultMapping: Record<string, string> = {};
      ORDEN_CAMPOS_POR_DEFECTO.forEach(xmlPath => {
        if ((DICCIONARIO_CV as any)[xmlPath]) {
          defaultMapping[xmlPath] = (DICCIONARIO_CV as any)[xmlPath];
        }
      });

      try {
        const userConfig = await getUserConfig();
        setCustomMapping(userConfig.mapping || defaultMapping);
        setMultipleSheets(userConfig.multipleSheets || false);
        setFormatCurrency(userConfig.formatCurrency !== undefined ? userConfig.formatCurrency : true);
        setShowAdvanced(userConfig.showAdvanced || false);
      } catch (error) {
        console.error('Error al inicializar estado:', error);
        setCustomMapping(defaultMapping);
      }
    };

    initializeState();
  }, []);

  useEffect(() => {
    const saveConfig = async () => {
      if (customMapping && Object.keys(customMapping).length > 0) {
        await saveUserConfig({
          mapping: customMapping,
          multipleSheets,
          formatCurrency,
          showAdvanced
        });
      }
    };

    if (Object.keys(customMapping).length > 0) {
      saveConfig();
    }
  }, [customMapping, multipleSheets, formatCurrency, showAdvanced]);

  useEffect(() => {
    loadExcelGenerator()
      .then(setExcelGenerator)
      .catch(error => console.error('Error al cargar el módulo de generación de XLSX:', error));
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
    setFiles(files.filter((_, i) => i !== index));
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
      const validFiles = files.filter(fileItem => fileItem.file).map(fileItem => fileItem.file!);
      
      if (validFiles.length === 0) {
        throw new Error('No hay archivos válidos para procesar');
      }

      // Ensure we have a mapping profile with default fields if none exists
      let effectiveMapping = customMapping;
      if (!effectiveMapping || Object.keys(effectiveMapping).length === 0) {
        console.log('No mapping found, using default mapping');
        effectiveMapping = {};
        ORDEN_CAMPOS_POR_DEFECTO.forEach(xmlPath => {
          if ((DICCIONARIO_CV as any)[xmlPath]) {
            effectiveMapping[xmlPath] = (DICCIONARIO_CV as any)[xmlPath];
          }
        });
      }

      console.log('Using mapping profile:', effectiveMapping);
      console.log('Processing files:', validFiles.length);

      const nfeDataArray = await parseMultipleNFeFiles(validFiles, effectiveMapping);
      
      console.log('Parsed data:', nfeDataArray.length, 'rows');
      if (nfeDataArray.length > 0) {
        console.log('First row sample:', nfeDataArray[0]);
      }
      
      setProgressText('Generando archivo XLSX...');
      const xlsxBuffer = multipleSheets 
        ? await excelGenerator.generateXlsxWithMultipleSheets(nfeDataArray, effectiveMapping, formatCurrency)
        : await excelGenerator.generateXlsx(nfeDataArray, effectiveMapping, formatCurrency);

      setProgressText('Descargando archivo...');
      const blob = new Blob([xlsxBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nfe_convertido_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setProgressText('¡Conversión completada exitosamente!');
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

  const totalFileSize = files.reduce((total, file) => total + file.size, 0);
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <span className="text-3xl">??</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              XML to XLSX Converter
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 font-medium max-w-2xl mx-auto">
            Convierte archivos XML de NFe a Excel con procesamiento local de alta eficiencia
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl font-bold text-blue-600">{files.length}</div>
              <div className="text-xs text-gray-600">Archivos</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(customMapping).length}</div>
              <div className="text-xs text-gray-600">Campos</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl font-bold text-green-600">{formatFileSize(totalFileSize)}</div>
              <div className="text-xs text-gray-600">Tamaño</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl font-bold text-indigo-600">100%</div>
              <div className="text-xs text-gray-600">Local</div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="p-6 md:p-8">
            <DragArea onFilesChange={handleFilesChange} isPopup={false} />
            
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Archivos seleccionados ({files.length})
                  </h3>
                  <button
                    onClick={handleClearAllFiles}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-50 transition-all duration-200 shadow-sm"
                  >
                    ??? Limpiar todos
                  </button>
                </div>
                <FileList files={files} onRemoveFile={handleRemoveFile} />
              </div>
            )}
          </div>
          
          {files.length > 0 && (
            <div className="border-t border-gray-200/50 bg-gray-50/50">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Opciones de conversión</h3>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg border border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    {showAdvanced ? '?? Menos opciones' : '?? Más opciones'}
                  </button>
                </div>
                
                <OptionsPanel 
                  mapping={customMapping} 
                  onMappingChange={handleMappingChange} 
                  multipleSheets={multipleSheets} 
                  setMultipleSheets={setMultipleSheets} 
                  formatCurrency={formatCurrency} 
                  setFormatCurrency={setFormatCurrency}
                  showAdvanced={showAdvanced}
                />
              </div>
            </div>
          )}
          
          <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200/50">
            <button 
              onClick={handleConvert} 
              disabled={files.length === 0 || isProcessing} 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg text-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  ?? Convertir a XLSX
                  {files.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                      {files.length} archivo{files.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              )}
            </button>
            
            {isProcessing && (
              <div className="mt-4">
                <ProgressBar progress={progress} text={progressText} />
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <span>v2.0.0</span>
            <span>•</span>
            <span>Optimizado con Preact</span>
            <span>•</span>
            <span>Procesamiento local</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carga;