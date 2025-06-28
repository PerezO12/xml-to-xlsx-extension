import React from 'react';

interface ProgressBarProps {
  progress: number;
  text: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, text }) => {
  return (
    <div className="mt-6">
      <p className="text-gray-700 mb-2">{text}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar; 