import React, { useRef, useState } from 'react';

interface FileItem {
  name: string;
  size: number;
  file: File;
}

interface DragAreaProps {
  onFilesChange: (files: FileItem[]) => void;
}

const DragArea: React.FC<DragAreaProps> = ({ onFilesChange }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: File[]): FileItem[] => {
    return files
      .filter(file => file.type === 'text/xml' || file.name.endsWith('.xml'))
      .map(file => ({
        name: file.name,
        size: file.size,
        file: file
      }));
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

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const fileItems = processFiles(files);
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
      <p className="text-gray-600">Arrastra y suelta tus archivos XML aquí o</p>
      <button
        onClick={handleBrowseClick}
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Selecciona Archivos
      </button>
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept=".xml"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default DragArea; 