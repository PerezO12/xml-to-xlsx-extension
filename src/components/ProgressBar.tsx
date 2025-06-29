import { JSX } from 'preact';

interface ProgressBarProps {
  progress: number;
  text: string;
}

const ProgressBar = ({ progress, text }: ProgressBarProps): JSX.Element => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
      <div className="flex items-center mb-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-800 font-medium">{text}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-600">Procesando archivos...</span>
        <span className="text-xs font-semibold text-gray-800">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;