// Background script para manejar eventos de la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log('XML to XLSX Converter instalado');
});

// Manejar clicks en el icono de la extensión - SIEMPRE abrir página completa
chrome.browserAction.onClicked.addListener((tab) => {
  console.log('Icono de extensión clickeado - abriendo página completa');
  chrome.tabs.create({
    url: chrome.runtime.getURL('carga.html')
  });
});

// Listener para mensajes desde cualquier página
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openFullPage') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('carga.html')
    });
    sendResponse({success: true});
  }
  
  // Esta función ya no es necesaria porque no hay popup, pero la dejamos por compatibilidad
  if (request.action === 'checkIsPopup') {
    // Siempre devolver false porque ya no tenemos popup
    sendResponse({isPopup: false});
  }
});

// Código específico para Firefox
if (typeof browser !== 'undefined') {
  // En Firefox, usar browser.browserAction
  browser.browserAction.onClicked.addListener((tab) => {
    console.log('Icono de extensión clickeado en Firefox - abriendo página completa');
    browser.tabs.create({
      url: browser.runtime.getURL('carga.html')
    });
  });
  
  browser.runtime.onStartup.addListener(() => {
    console.log('Extensión iniciada en Firefox');
  });
}