// Background script para manejar eventos de la extensi�n
chrome.runtime.onInstalled.addListener(() => {
  console.log('XML to XLSX Converter instalado');
});

// Manejar clicks en el icono de la extensi�n - SIEMPRE abrir p�gina completa
chrome.browserAction.onClicked.addListener((tab) => {
  console.log('Icono de extensi�n clickeado - abriendo p�gina completa');
  chrome.tabs.create({
    url: chrome.runtime.getURL('carga.html')
  });
});

// Listener para mensajes desde cualquier p�gina
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openFullPage') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('carga.html')
    });
    sendResponse({success: true});
  }
  
  // Esta funci�n ya no es necesaria porque no hay popup, pero la dejamos por compatibilidad
  if (request.action === 'checkIsPopup') {
    // Siempre devolver false porque ya no tenemos popup
    sendResponse({isPopup: false});
  }
});

// C�digo espec�fico para Firefox
if (typeof browser !== 'undefined') {
  // En Firefox, usar browser.browserAction
  browser.browserAction.onClicked.addListener((tab) => {
    console.log('Icono de extensi�n clickeado en Firefox - abriendo p�gina completa');
    browser.tabs.create({
      url: browser.runtime.getURL('carga.html')
    });
  });
  
  browser.runtime.onStartup.addListener(() => {
    console.log('Extensi�n iniciada en Firefox');
  });
}