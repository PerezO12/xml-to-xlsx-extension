import React, { useState } from 'react';

interface OptionsPanelProps {
  mapping: Record<string, string>;
  onMappingChange: (updatedMapping: Record<string, string>) => void;
  multipleSheets: boolean;
  setMultipleSheets: (value: boolean) => void;
  formatCurrency: boolean;
  setFormatCurrency: (value: boolean) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  mapping,
  onMappingChange,
  multipleSheets,
  setMultipleSheets,
  formatCurrency,
  setFormatCurrency
}) => {
  const [showFields, setShowFields] = useState<boolean>(false);

  const handleSelectAll = () => {
    const updatedMapping = { ...mapping };
    Object.keys(updatedMapping).forEach(key => {
      updatedMapping[key] = updatedMapping[key];
    });
    onMappingChange(updatedMapping);
  };

  const handleDeselectAll = () => {
    const updatedMapping = { ...mapping };
    Object.keys(updatedMapping).forEach(key => {
      delete updatedMapping[key];
    });
    onMappingChange(updatedMapping);
  };

  const handleFieldChange = (key: string, checked: boolean) => {
    const updatedMapping = { ...mapping };
    if (checked) {
      updatedMapping[key] = mapping[key];
    } else {
      delete updatedMapping[key];
    }
    onMappingChange(updatedMapping);
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">Opciones de Conversión</h2>
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          id="multipleSheets"
          checked={multipleSheets}
          onChange={(e) => setMultipleSheets(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="multipleSheets" className="text-gray-700">Dividir en múltiples hojas (máximo 1000 filas por hoja)</label>
      </div>
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          id="formatCurrency"
          checked={formatCurrency}
          onChange={(e) => setFormatCurrency(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="formatCurrency" className="text-gray-700">Formatear valores monetarios</label>
      </div>
      <div className="mt-4">
        <button
          onClick={() => setShowFields(!showFields)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Personalizar Campos
        </button>
        {showFields && (
          <div className="mt-4 max-h-60 overflow-y-auto">
            <h3 className="text-lg font-medium mb-2">Selecciona los campos a incluir:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(mapping).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`field-${key}`}
                    checked={key in mapping}
                    onChange={(e) => handleFieldChange(key, e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`field-${key}`} className="text-gray-700 truncate">{value}</label>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSelectAll}
                className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded mr-2"
              >
                Seleccionar Todo
              </button>
              <button
                onClick={handleDeselectAll}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
              >
                Desseleccionar Todo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsPanel; 