import { JSX } from 'preact';

interface FileItem {
  name: string;
  size: number;
  path?: string;
}

interface FileListProps {
  files: FileItem[];
  onRemoveFile: (index: number) => void;
}

const FileList = ({ files, onRemoveFile }: FileListProps): JSX.Element => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-3">📄</div>
        <p>No hay archivos seleccionados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            Archivos seleccionados ({files.length})
          </h3>
          <div className="text-sm text-gray-600">
            Total: {formatFileSize(totalSize)}
          </div>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {files.map((file, index) => (
          <div key={index} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-start space-x-3">
                <div className="text-xl">📄</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-800 truncate font-medium">{file.name}</h4>
                  {file.path && file.path !== file.name && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      📁 {file.path}
                    </p>
                  )}
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      ✅ XML
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemoveFile(index)}
              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 flex-shrink-0"
              title="Eliminar archivo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;