import { useRef, useState } from 'preact/hooks';
import { JSX } from 'preact';

interface FileItem {
  name: string;
  size: number;
  file: File;
  path?: string;
}

interface DragAreaProps {
  onFilesChange: (files: FileItem[]) => void;
  isPopup?: boolean;
}

const DragArea = ({ onFilesChange, isPopup = false }: DragAreaProps): JSX.Element => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: File[]): FileItem[] => {
    return files
      .filter(file => file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml'))
      .map(file => ({
        name: file.name,
        size: file.size,
        file: file
      }));
  };

  const processDirectoryFiles = (files: FileList): FileItem[] => {
    const fileItems: FileItem[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml')) {
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

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (!(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer?.files || []);
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
      (directoryInputRef.current as any).webkitdirectory = true;
      directoryInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      const files = Array.from(target.files);
      const fileItems = processFiles(files);
      onFilesChange(fileItems);
    }
  };

  const handleDirectoryInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      const fileItems = processDirectoryFiles(target.files);
      onFilesChange(fileItems);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        isDragging 
          ? 'border-blue-500 bg-blue-50/80 shadow-lg scale-[1.02]' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="mb-6">
        <div className="text-5xl mb-4 transform transition-transform duration-300 hover:scale-110">
          {isDragging ? '📤' : '📂'}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra archivos XML o selecciona desde tu dispositivo'}
        </h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Acepta archivos .xml individuales o carpetas completas con múltiples documentos
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <button
          onClick={handleBrowseFilesClick}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          📄 Seleccionar archivos
        </button>
        <button
          onClick={handleBrowseDirectoriesClick}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          📁 Seleccionar carpeta
        </button>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center">
          <span className="mr-1">🎯</span>
          Solo archivos .xml
        </div>
        <div className="flex items-center">
          <span className="mr-1">⚡</span>
          Procesamiento local
        </div>
        <div className="flex items-center">
          <span className="mr-1">🔒</span>
          100% seguro
        </div>
        <div className="flex items-center">
          <span className="mr-1">🚀</span>
          Sin límites
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept=".xml"
        className="hidden"
        onChange={handleFileInputChange}
      />
      
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