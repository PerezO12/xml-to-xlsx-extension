import { useState } from 'preact/hooks';
import { JSX } from 'preact';

interface OptionsPanelProps {
  mapping: Record<string, string>;
  onMappingChange: (updatedMapping: Record<string, string>) => void;
  multipleSheets: boolean;
  setMultipleSheets: (value: boolean) => void;
  formatCurrency: boolean;
  setFormatCurrency: (value: boolean) => void;
  showAdvanced?: boolean;
}

const OptionsPanel = ({
  mapping,
  onMappingChange,
  multipleSheets,
  setMultipleSheets,
  formatCurrency,
  setFormatCurrency,
  showAdvanced = false
}: OptionsPanelProps): JSX.Element => {

  const handleSelectAll = () => {
    const updatedMapping = { ...mapping };
    // Mantener todos los campos activos
    onMappingChange(updatedMapping);
  };

  const handleDeselectAll = () => {
    // Vaciar el mapping
    onMappingChange({});
  };

  const handleFieldChange = (key: string, checked: boolean) => {
    const updatedMapping = { ...mapping };
    if (checked) {
      // Re-añadir el campo
      updatedMapping[key] = mapping[key] || key;
    } else {
      // Remover el campo
      delete updatedMapping[key];
    }
    onMappingChange(updatedMapping);
  };

  return (
    <div className="space-y-4">
      {/* Opciones básicas siempre visibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="multipleSheets"
              checked={multipleSheets}
              onChange={(e) => setMultipleSheets((e.target as HTMLInputElement).checked)}
              className="w-4 h-4 text-blue-600 mr-3 rounded"
            />
            <div>
              <label htmlFor="multipleSheets" className="text-gray-800 font-medium cursor-pointer">
                📊 Múltiples hojas
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Divide en hojas de máximo 1000 filas
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="formatCurrency"
              checked={formatCurrency}
              onChange={(e) => setFormatCurrency((e.target as HTMLInputElement).checked)}
              className="w-4 h-4 text-green-600 mr-3 rounded"
            />
            <div>
              <label htmlFor="formatCurrency" className="text-gray-800 font-medium cursor-pointer">
                💰 Formato monetario
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Aplica formato de moneda a valores
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Personalización avanzada de campos */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <span className="mr-2">🎯</span>
            Personalizar campos incluidos ({Object.keys(mapping).length})
          </h3>
          
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Selecciona los campos XML que quieres incluir en el Excel
            </span>
            <div className="space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 py-1 px-3 rounded-lg transition-colors"
              >
                ✅ Todos
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded-lg transition-colors"
              >
                ❌ Ninguno
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {Object.entries(mapping).map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id={`field-${key}`}
                    checked={key in mapping}
                    onChange={(e) => handleFieldChange(key, (e.target as HTMLInputElement).checked)}
                    className="w-4 h-4 text-blue-600 mt-0.5 mr-3 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <label htmlFor={`field-${key}`} className="text-gray-800 text-sm font-medium cursor-pointer block">
                      {value}
                    </label>
                    <p className="text-xs text-gray-500 mt-1 truncate" title={key}>
                      {key}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsPanel;