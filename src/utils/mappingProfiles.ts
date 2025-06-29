import { ProfileConfig, ColumnMapping } from './excelGenerator';
import { DICCIONARIO_CV, ORDEN_CAMPOS_POR_DEFECTO, CAMPOS_MONEDA } from './constants';

// Declaración para el objeto browser de la API de extensiones (compatible con Firefox)
declare const browser: {
  storage: {
    local: {
      get: (key: string) => Promise<any>;
      set: (data: Record<string, any>) => Promise<void>;
    }
  }
};

// Fallback para Chrome si browser no está disponible
declare const chrome: {
  storage: {
    local: {
      get: (key: string) => Promise<any>;
      set: (data: Record<string, any>) => Promise<void>;
    }
  }
};

// Función helper para obtener la API de almacenamiento correcta
const getStorageAPI = () => {
  return typeof browser !== 'undefined' ? browser : chrome;
};

/**
 * Guarda un perfil de mapeo en el almacenamiento local
 * @param profile Perfil a guardar
 */
export const saveProfile = async (profile: ProfileConfig): Promise<void> => {
  try {
    const storage = getStorageAPI();
    // Obtenemos perfiles existentes
    const profiles = await getProfiles();
    
    // Verificamos si el perfil ya existe
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      // Actualizamos el perfil existente
      profiles[existingIndex] = profile;
    } else {
      // Añadimos el nuevo perfil
      profiles.push(profile);
    }
    
    // Guardamos los perfiles actualizados
    await storage.storage.local.set({ profiles });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error al guardar el perfil:', error);
    return Promise.reject(error);
  }
};

/**
 * Obtiene todos los perfiles guardados
 * @returns Array de perfiles
 */
export const getProfiles = async (): Promise<ProfileConfig[]> => {
  try {
    const storage = getStorageAPI();
    const result = await storage.storage.local.get('profiles');
    return result.profiles || [];
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    return [];
  }
};

/**
 * Elimina un perfil por su ID
 * @param profileId ID del perfil a eliminar
 */
export const deleteProfile = async (profileId: string): Promise<void> => {
  try {
    const storage = getStorageAPI();
    // Obtenemos perfiles existentes
    const profiles = await getProfiles();
    
    // Filtramos el perfil a eliminar
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    
    // Guardamos los perfiles actualizados
    await storage.storage.local.set({ profiles: updatedProfiles });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error al eliminar el perfil:', error);
    return Promise.reject(error);
  }
};

/**
 * Activa un perfil específico y desactiva los demás
 * @param profileId ID del perfil a activar
 */
export const activateProfile = async (profileId: string): Promise<void> => {
  try {
    const storage = getStorageAPI();
    // Obtenemos perfiles existentes
    const profiles = await getProfiles();
    
    // Actualizamos el estado de cada perfil
    const updatedProfiles = profiles.map(p => ({
      ...p,
      isActive: p.id === profileId
    }));
    
    // Guardamos los perfiles actualizados
    await storage.storage.local.set({ profiles: updatedProfiles });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error al activar el perfil:', error);
    return Promise.reject(error);
  }
};

/**
 * Obtiene el perfil activo actualmente
 * @returns Perfil activo o undefined si no hay ninguno
 */
export const getActiveProfile = async (): Promise<ProfileConfig | undefined> => {
  try {
    const profiles = await getProfiles();
    return profiles.find(p => p.isActive);
  } catch (error) {
    console.error('Error al obtener el perfil activo:', error);
    return undefined;
  }
};

/**
 * Crea un perfil por defecto con los campos más comunes
 * @returns Perfil por defecto
 */
export const createDefaultProfile = (): ProfileConfig => {
  const defaultMappings: ColumnMapping[] = ORDEN_CAMPOS_POR_DEFECTO.map(xmlPath => {
    const columnName = DICCIONARIO_CV[xmlPath] || xmlPath;
    const formatAsCurrency = CAMPOS_MONEDA.includes(xmlPath);
    
    return {
      xmlPath,
      columnName,
      formatAsCurrency
    };
  });
  
  return {
    id: `default-${Date.now()}`,
    name: 'Perfil Predeterminado',
    description: 'Mapeo básico de campos comunes de NFe en el orden especificado',
    mappings: defaultMappings,
    isActive: true
  };
};

/**
 * Crea un perfil completo con todos los campos del diccionario proporcionado
 * @param dictionaryFields Objeto con las rutas XML y sus descripciones
 * @returns Perfil completo
 */
export const createFullProfile = (dictionaryFields: Record<string, string>): ProfileConfig => {
  const mappings: ColumnMapping[] = Object.entries(dictionaryFields).map(([xmlPath, columnName]) => {
    // Determinamos si el campo debe formatearse como moneda
    const formatAsCurrency = CAMPOS_MONEDA.includes(xmlPath);
    
    return {
      xmlPath,
      columnName,
      formatAsCurrency
    };
  });
  
  return {
    id: `full-${Date.now()}`,
    name: 'Perfil Completo',
    description: 'Mapeo completo de todos los campos disponibles',
    mappings,
    isActive: false
  };
};

/**
 * Analiza un XML de ejemplo para detectar campos disponibles
 * @param xmlObj Objeto XML parseado
 * @returns Objeto con las rutas disponibles y sus valores de ejemplo
 */
export const analyzeXmlStructure = (xmlObj: any): Record<string, any> => {
  const result: Record<string, any> = {};
  
  // Función recursiva para explorar el objeto
  const explore = (obj: any, path: string = '') => {
    if (!obj || typeof obj !== 'object') {
      result[path] = obj;
      return;
    }
    
    // Si es un array, exploramos cada elemento
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        explore(item, path ? `${path}[${index}]` : `[${index}]`);
      });
      return;
    }
    
    // Para objetos, exploramos cada propiedad
    for (const key in obj) {
      const newPath = path ? `${path}.${key}` : key;
      explore(obj[key], newPath);
    }
  };
  
  explore(xmlObj);
  return result;
}; 