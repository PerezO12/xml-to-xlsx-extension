import React, { useRef, useState } from 'react';

interface FileItem {
  name: string;
  size: number;
  file: File;
  path?: string; // Para mostrar la ruta relativa del archivo
}

interface DragAreaProps {
  onFilesChange: (files: FileItem[]) => void;
  isPopup?: boolean; // Nueva prop para saber si estamos en un popup
}

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

const DragArea: React.FC<DragAreaProps> = ({ onFilesChange, isPopup = false }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  // Función para abrir página completa si estamos en popup
  const openFullPage = () => {
    try {
      const runtime = typeof browser !== 'undefined' ? browser : chrome;
      if (runtime && runtime.runtime) {
        const url = runtime.runtime.getURL('carga.html');
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error al abrir página completa:', error);
      // Fallback: mostrar mensaje al usuario
      alert('Por favor, abre la página completa de la extensión desde el menú de opciones para cargar archivos.');
    }
  };

  // Función para procesar archivos individuales
  const processFiles = (files: File[]): FileItem[] => {
    return files
      .filter(file => file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml'))
      .map(file => ({
        name: file.name,
        size: file.size,
        file: file
      }));
  };

  // Función para procesar archivos desde un directorio (usando webkitdirectory)
  const processDirectoryFiles = (files: FileList): FileItem[] => {
    const fileItems: FileItem[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml')) {
        // Extraer la ruta relativa del archivo
        const fullPath = (file as any).webkitRelativePath || file.name;
        const pathParts = fullPath.split('/');
        const fileName = pathParts.pop() || file.name;
        const relativePath = pathParts.join('/');
        
        fileItems.push({
          name: fileName,
          size: file.size,
          file: file,
          path: relativePath || undefined
        });
      }
    }
    
    return fileItems;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const fileItems = processFiles(files);
    onFilesChange(fileItems);
  };

  const handleBrowseFilesClick = () => {
    // Si estamos en un popup, redirigir a la página completa
    if (isPopup) {
      openFullPage();
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBrowseDirectoriesClick = () => {
    // Si estamos en un popup, redirigir a la página completa
    if (isPopup) {
      openFullPage();
      return;
    }
    
    if (directoryInputRef.current) {
      // Configurar el input para directorios
      (directoryInputRef.current as any).webkitdirectory = true;
      directoryInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const fileItems = processFiles(files);
      onFilesChange(fileItems);
    }
  };

  const handleDirectoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileItems = processDirectoryFiles(e.target.files);
      onFilesChange(fileItems);
    }
  };

  return (
    <div
      className={`border-2 border-dashed border-gray-400 rounded-lg p-6 text-center mb-6 bg-white shadow-md transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <p className="text-gray-600 mb-4">
        Arrastra y suelta archivos XML aquí o selecciona archivos/carpetas
      </p>
      
      {isPopup && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-blue-800 text-sm font-medium">
                ℹ️ Firefox: Selección de archivos
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Los botones de selección abrirán la página completa para evitar que el popup se cierre
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleBrowseFilesClick}
          className={`font-bold py-2 px-4 rounded transition-colors duration-200 ${
            isPopup 
              ? 'bg-purple-500 hover:bg-purple-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          title={isPopup ? "Abre la página completa para seleccionar archivos" : "Seleccionar archivos XML"}
        >
          {isPopup ? '🚀 Seleccionar Archivos (Nueva Pestaña)' : 'Seleccionar Archivos'}
        </button>
        <button
          onClick={handleBrowseDirectoriesClick}
          className={`font-bold py-2 px-4 rounded transition-colors duration-200 ${
            isPopup 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          title={isPopup ? "Abre la página completa para seleccionar carpeta" : "Seleccionar carpeta con archivos XML"}
        >
          {isPopup ? '📁 Seleccionar Carpeta (Nueva Pestaña)' : 'Seleccionar Carpeta'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        💡 Consejo: {isPopup ? 'Usa drag & drop aquí o abre la página completa para explorar archivos' : 'Para cargar carpetas completas, usa el botón "Seleccionar Carpeta"'}
      </p>
      
      {/* Input para archivos individuales - solo se muestran si no estamos en popup */}
      {!isPopup && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".xml"
            className="hidden"
            onChange={handleFileInputChange}
          />
          
          {/* Input para directorios */}
          <input
            type="file"
            ref={directoryInputRef}
            multiple
            className="hidden"
            onChange={handleDirectoryInputChange}
          />
        </>
      )}
    </div>
  );
};

export default DragArea;