import React, { useRef, useState } from 'react';

interface FileItem {
  name: string;
  size: number;
  file: File;
  path?: string; // Para mostrar la ruta relativa del archivo
}

interface DragAreaProps {
  onFilesChange: (files: FileItem[]) => void;
}

const DragArea: React.FC<DragAreaProps> = ({ onFilesChange }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBrowseDirectoriesClick = () => {
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
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleBrowseFilesClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Seleccionar Archivos
        </button>
        <button
          onClick={handleBrowseDirectoriesClick}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Seleccionar Carpeta
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        💡 Consejo: Para cargar carpetas completas, usa el botón "Seleccionar Carpeta"
      </p>
      
      {/* Input para archivos individuales */}
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
    </div>
  );
};

export default DragArea; 