import React from 'react';

interface FileItem {
  name: string;
  size: number;
  path?: string; // Ruta relativa del archivo
}

interface FileListProps {
  files: FileItem[];
  onRemoveFile: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemoveFile }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Archivos seleccionados ({files.length})
        </h3>
        <span className="text-sm text-gray-600">
          Tamaño total: {formatFileSize(totalSize)}
        </span>
      </div>
      
      <div className="max-h-40 overflow-y-auto bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        {files.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay archivos seleccionados</p>
        ) : (
          files.map((file, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <span className="text-gray-700 truncate font-medium">{file.name}</span>
                  {file.path && file.path !== file.name && (
                    <span className="text-xs text-gray-500 truncate">
                      📁 {file.path}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(index)}
                className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0 p-1 rounded hover:bg-red-50 transition-colors"
                title="Eliminar archivo"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileList; 