import React, { useState, useEffect } from 'react';
import DragArea from '../components/DragArea';
import FileList from '../components/FileList';
import OptionsPanel from '../components/OptionsPanel';
import ProgressBar from '../components/ProgressBar';
import { DICCIONARIO_CV } from '../utils/constants';
import { parseMultipleNFeFiles, ParsedNFeData } from '../utils/xmlParser';

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

const Popup: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({ ...DICCIONARIO_CV });
  const [multipleSheets, setMultipleSheets] = useState<boolean>(false);
  const [formatCurrency, setFormatCurrency] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [excelGenerator, setExcelGenerator] = useState<any>(null);

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

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex items-center justify-center">
      <div className="container mx-auto p-4 max-w-4xl bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">XML to XLSX Converter</h1>
        <DragArea onFilesChange={handleFilesChange} />
        {files.length > 0 && <FileList files={files} onRemoveFile={handleRemoveFile} />}
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