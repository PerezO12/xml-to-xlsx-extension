import React from 'react';

interface FileItem {
  name: string;
  size: number;
}

interface FileListProps {
  files: FileItem[];
  onRemoveFile: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemoveFile }) => {
  return (
    <div className="mb-6 max-h-40 overflow-y-auto bg-white rounded-lg shadow-sm p-3 border border-gray-200">
      {files.map((file, index) => (
        <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
          <span className="text-gray-700 truncate flex-1">{file.name}</span>
          <button
            onClick={() => onRemoveFile(index)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileList; 