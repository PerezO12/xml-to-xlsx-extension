// Utils para manejo de almacenamiento de la extensión

// Declaración para APIs de extensiones
declare const chrome: {
  storage: {
    local: {
      get: (keys: string | string[] | null) => Promise<{[key: string]: any}>;
      set: (items: {[key: string]: any}) => Promise<void>;
      remove: (keys: string | string[]) => Promise<void>;
    }
  }
};

declare const browser: {
  storage: {
    local: {
      get: (keys: string | string[] | null) => Promise<{[key: string]: any}>;
      set: (items: {[key: string]: any}) => Promise<void>;
      remove: (keys: string | string[]) => Promise<void>;
    }
  }
};

// Interfaz para el estado temporal
interface TempState {
  files: Array<{name: string; size: number}>;
  mapping: Record<string, string>;
  multipleSheets: boolean;
  formatCurrency: boolean;
  timestamp: number;
}

// Obtener la API de storage disponible
const getStorageAPI = () => {
  if (typeof browser !== 'undefined' && browser.storage) {
    return browser.storage.local;
  }
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage.local;
  }
  return null;
};

// Guardar estado temporal (por ejemplo, antes de abrir el explorador de archivos)
export const saveTempState = async (state: Partial<TempState>): Promise<boolean> => {
  try {
    const storage = getStorageAPI();
    if (!storage) {
      console.warn('Storage API no disponible, usando localStorage');
      localStorage.setItem('xml-converter-temp-state', JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
      return true;
    }

    await storage.set({
      'xml-converter-temp-state': {
        ...state,
        timestamp: Date.now()
      }
    });
    return true;
  } catch (error) {
    console.error('Error al guardar estado temporal:', error);
    return false;
  }
};

// Recuperar estado temporal
export const getTempState = async (): Promise<TempState | null> => {
  try {
    const storage = getStorageAPI();
    let result: any;

    if (!storage) {
      const stored = localStorage.getItem('xml-converter-temp-state');
      result = stored ? JSON.parse(stored) : null;
    } else {
      const data = await storage.get('xml-converter-temp-state');
      result = data['xml-converter-temp-state'] || null;
    }

    if (!result) return null;

    // Verificar que el estado no sea demasiado antiguo (máximo 1 hora)
    const maxAge = 60 * 60 * 1000; // 1 hora en milisegundos
    if (Date.now() - result.timestamp > maxAge) {
      await clearTempState();
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error al recuperar estado temporal:', error);
    return null;
  }
};

// Limpiar estado temporal
export const clearTempState = async (): Promise<void> => {
  try {
    const storage = getStorageAPI();
    if (!storage) {
      localStorage.removeItem('xml-converter-temp-state');
      return;
    }

    await storage.remove('xml-converter-temp-state');
  } catch (error) {
    console.error('Error al limpiar estado temporal:', error);
  }
};

// Guardar configuración de usuario
export const saveUserConfig = async (config: Record<string, any>): Promise<boolean> => {
  try {
    const storage = getStorageAPI();
    if (!storage) {
      localStorage.setItem('xml-converter-config', JSON.stringify(config));
      return true;
    }

    await storage.set({ 'xml-converter-config': config });
    return true;
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return false;
  }
};

// Recuperar configuración de usuario
export const getUserConfig = async (): Promise<Record<string, any>> => {
  try {
    const storage = getStorageAPI();
    let result: any;

    if (!storage) {
      const stored = localStorage.getItem('xml-converter-config');
      result = stored ? JSON.parse(stored) : {};
    } else {
      const data = await storage.get('xml-converter-config');
      result = data['xml-converter-config'] || {};
    }

    return result;
  } catch (error) {
    console.error('Error al recuperar configuración:', error);
    return {};
  }
};