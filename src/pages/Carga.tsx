import React from 'react';
import Popup from './Popup';

const Carga: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header principal */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔄 XML to XLSX Converter
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Convierte archivos XML de NFe a Excel de forma rápida y sencilla
          </p>
        </div>

        {/* Mensaje de bienvenida mejorado */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-green-800">
                🎉 ¡Página Completa Activa!
              </h3>
              <div className="mt-2 text-green-700">
                <p className="text-base">
                  Esta es la interfaz principal de la extensión. Aquí puedes cargar archivos y carpetas sin limitaciones.
                </p>
                <ul className="mt-3 text-sm space-y-1">
                  <li>✅ Selección de archivos sin restricciones</li>
                  <li>✅ Carga de carpetas completas</li>
                  <li>✅ Drag & Drop totalmente funcional</li>
                  <li>✅ Configuración persistente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Información sobre el cambio */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                🔄 Cambio de comportamiento
              </h4>
              <p className="text-blue-700 text-sm mt-1">
                La extensión ahora abre directamente esta página completa para evitar problemas con popups en Firefox.
              </p>
            </div>
          </div>
        </div>
        
        {/* Componente principal (sin isPopup porque ya no es popup) */}
        <Popup isPopup={false} />
        
        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>XML to XLSX Converter v1.1.0 - Optimizado para Firefox</p>
          <p className="mt-1">Desarrollado con ❤️ usando React, TypeScript y Vite</p>
        </div>
      </div>
    </div>
  );
};

export default Carga;