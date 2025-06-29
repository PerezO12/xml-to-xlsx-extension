import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './pages/Popup';
import './assets/tailwind.css';

// Declaraci�n para el objeto chrome/browser de la API de extensiones
declare const chrome: {
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
  }
};

declare const browser: {
  runtime: {
    sendMessage: (message: any) => Promise<any>;
  }
};

// Interfaz para la respuesta del background
interface BackgroundResponse {
  isPopup?: boolean;
}

// Detectar si estamos en un popup
const detectPopupContext = async (): Promise<boolean> => {
  // M�todo 1: Verificar el tama�o de la ventana
  const isSmallWindow = window.innerWidth <= 800 && window.innerHeight <= 600;
  
  // M�todo 2: Verificar la URL
  const isPopupURL = window.location.pathname.includes('popup.html') || 
                     window.location.hash.includes('popup') ||
                     window.location.search.includes('popup');
  
  // M�todo 3: Consultar al background script (solo disponible en extensiones)
  let isPopupFromBackground = false;
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      const response = await new Promise<BackgroundResponse>((resolve) => {
        chrome.runtime.sendMessage({action: 'checkIsPopup'}, (response: BackgroundResponse) => {
          resolve(response || {});
        });
      });
      isPopupFromBackground = response?.isPopup || false;
    } else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
      const response: BackgroundResponse = await browser.runtime.sendMessage({action: 'checkIsPopup'});
      isPopupFromBackground = response?.isPopup || false;
    }
  } catch (error) {
    console.log('No se pudo consultar el background script:', error);
  }
  
  // Cualquiera de estos m�todos indica que estamos en un popup
  return isSmallWindow || isPopupURL || isPopupFromBackground;
};

// Inicializar la aplicaci�n
const initApp = async () => {
  const isPopup = await detectPopupContext();
  const container = document.getElementById('root');
  
  if (!container) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Popup isPopup={isPopup} />
    </React.StrictMode>
  );
};

// Iniciar la aplicaci�n
initApp().catch(error => {
  console.error('Error al inicializar la aplicaci�n:', error);
  // Fallback: asumir que es popup basado en el tama�o de ventana
  const fallbackIsPopup = window.innerWidth <= 800 && window.innerHeight <= 600;
  const container = document.getElementById('root');
  
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <Popup isPopup={fallbackIsPopup} />
      </React.StrictMode>
    );
  }
});