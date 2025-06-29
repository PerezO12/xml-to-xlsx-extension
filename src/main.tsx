import { render } from 'preact';
import Carga from './pages/Carga';
import './assets/tailwind.css';

// Renderizar la aplicaci�n completa directamente
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

// Renderizar la aplicaci�n
render(<Carga />, container);

// Ocultar el loading screen una vez que la app est� montada
setTimeout(() => {
  const loadingContainer = document.querySelector('.loading-container');
  if (loadingContainer) {
    (loadingContainer as HTMLElement).style.opacity = '0';
    setTimeout(() => {
      loadingContainer.remove();
    }, 300);
  }
}, 100);