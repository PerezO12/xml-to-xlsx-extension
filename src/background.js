// Background script optimizado para la extensión XML to XLSX Converter
console.log('XML to XLSX Converter - Iniciado en modo página completa');

// Función para abrir la página completa al hacer clic en el icono
const openFullPage = () => {
  const url = typeof browser !== 'undefined' 
    ? browser.runtime.getURL('carga.html')
    : chrome.runtime.getURL('carga.html');
    
  if (typeof browser !== 'undefined') {
    browser.tabs.create({ url });
  } else {
    chrome.tabs.create({ url });
  }
};

// Event listeners optimizados
if (typeof browser !== 'undefined') {
  // Firefox
  browser.runtime.onInstalled.addListener(() => {
    console.log('XML to XLSX Converter instalado en Firefox');
  });
  
  browser.browserAction.onClicked.addListener(() => {
    console.log('Abriendo página completa en Firefox');
    openFullPage();
  });
  
  browser.runtime.onStartup.addListener(() => {
    console.log('Extensión iniciada en Firefox');
  });
} else {
  // Chrome/Chromium
  chrome.runtime.onInstalled.addListener(() => {
    console.log('XML to XLSX Converter instalado en Chrome');
  });
  
  chrome.browserAction.onClicked.addListener(() => {
    console.log('Abriendo página completa en Chrome');
    openFullPage();
  });
}

// Cleanup - remover código innecesario del popup
// Ya no necesitamos manejar mensajes del popup porque solo usamos página completa