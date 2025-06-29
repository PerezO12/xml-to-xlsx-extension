// Utilidades optimizadas para almacenamiento de la extensión

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

// Interfaz para configuración de usuario - actualizada para incluir showAdvanced
interface UserConfig {
  mapping: Record<string, string>;
  multipleSheets: boolean;
  formatCurrency: boolean;
  showAdvanced?: boolean;
  lastUsed?: number;
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

// Guardar configuración de usuario
export const saveUserConfig = async (config: Partial<UserConfig>): Promise<boolean> => {
  try {
    const storage = getStorageAPI();
    const configWithTimestamp = {
      ...config,
      lastUsed: Date.now()
    };

    if (!storage) {
      localStorage.setItem('xml-converter-config', JSON.stringify(configWithTimestamp));
      return true;
    }

    await storage.set({ 'xml-converter-config': configWithTimestamp });
    console.log('Configuración guardada:', configWithTimestamp);
    return true;
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return false;
  }
};

// Recuperar configuración de usuario
export const getUserConfig = async (): Promise<UserConfig> => {
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

    console.log('Configuración recuperada:', result);
    return {
      mapping: result.mapping || {},
      multipleSheets: result.multipleSheets || false,
      formatCurrency: result.formatCurrency !== undefined ? result.formatCurrency : true,
      showAdvanced: result.showAdvanced || false,
      lastUsed: result.lastUsed
    };
  } catch (error) {
    console.error('Error al recuperar configuración:', error);
    return {
      mapping: {},
      multipleSheets: false,
      formatCurrency: true,
      showAdvanced: false
    };
  }
};

// Limpiar toda la configuración (útil para reset)
export const clearUserConfig = async (): Promise<void> => {
  try {
    const storage = getStorageAPI();
    if (!storage) {
      localStorage.removeItem('xml-converter-config');
      return;
    }

    await storage.remove('xml-converter-config');
    console.log('Configuración limpiada');
  } catch (error) {
    console.error('Error al limpiar configuración:', error);
  }
};