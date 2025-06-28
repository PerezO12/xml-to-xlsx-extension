import { XMLParser } from 'fast-xml-parser';
import { DICCIONARIO_CV } from './constants';

interface ParserOptions {
  ignoreAttributes: boolean;
  attributeNamePrefix: string;
  allowBooleanAttributes: boolean;
  parseTagValue: boolean;
  trimValues: boolean;
  isArray?: (name: string, jpath: string, isLeafNode: boolean, isAttribute: boolean) => boolean;
}

/**
 * Interfaz para representar los datos mapeados de una NFe
 */
export interface NFeData {
  [key: string]: string | number | boolean | null;
}

export interface ParsedNFeData {
  [key: string]: any;
}

/**
 * Parsea un archivo XML de NFe y extrae los datos según el diccionario de campos
 * @param xmlContent Contenido del archivo XML como string
 * @param mappingProfile Perfil de mapeo de campos a usar (opcional)
 * @returns Datos extraídos de la NFe
 */
export function parseNFeXml(
  xmlContent: string,
  mappingProfile: Record<string, string> = DICCIONARIO_CV
): ParsedNFeData {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    textNodeName: '_text',
    parseAttributeValue: true,
    parseTagValue: true,
    trimValues: true
  });

  try {
    const parsedXml = parser.parse(xmlContent);
    const result: ParsedNFeData = {};

    // Extraer datos según el mapeo
    Object.keys(mappingProfile).forEach((xmlPath) => {
      try {
        const value = extractValueFromPath(parsedXml, xmlPath);
        result[xmlPath] = value;
      } catch (error) {
        console.warn(`Error extrayendo valor para ${xmlPath}:`, error);
        result[xmlPath] = null;
      }
    });

    return result;
  } catch (error) {
    console.error('Error parseando XML:', error);
    throw new Error('Error al parsear el archivo XML');
  }
}

function extractValueFromPath(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return null;
    }

    if (key.startsWith('@')) {
      // Es un atributo
      const attrName = key.substring(1);
      if (current[attrName] !== undefined) {
        return current[attrName];
      }
      return null;
    }

    if (Array.isArray(current)) {
      // Si es un array, tomamos el primer elemento
      if (current.length > 0) {
        current = current[0];
      } else {
        return null;
      }
    }

    if (current[key] !== undefined) {
      current = current[key];
    } else {
      return null;
    }
  }

  // Si el valor final es un objeto con _text, extraemos el texto
  if (current && typeof current === 'object' && current._text !== undefined) {
    return current._text;
  }

  return current;
}

/**
 * Procesa múltiples archivos XML de NFe de manera eficiente
 * @param xmlFiles Arreglo de archivos XML (como FileList o File[])
 * @param mappingProfile Perfil de mapeo de campos a usar (opcional)
 * @param onProgress Callback para reportar progreso (opcional)
 * @returns Promesa con el arreglo de datos de NFes procesados
 */
export async function processMultipleXmlFiles(
  xmlFiles: FileList | File[],
  mappingProfile: Record<string, string> = DICCIONARIO_CV,
  onProgress?: (processed: number, total: number) => void
): Promise<ParsedNFeData[]> {
  const filesArray = Array.from(xmlFiles);
  const totalFiles = filesArray.length;
  const results: ParsedNFeData[] = [];
  let processedFiles = 0;

  // Procesar archivos en lotes para mejor rendimiento
  const batchSize = 50;
  for (let i = 0; i < totalFiles; i += batchSize) {
    const batch = filesArray.slice(i, i + batchSize);
    const batchPromises = batch.map(async (file) => {
      const xmlContent = await file.text();
      const data = parseNFeXml(xmlContent, mappingProfile);
      processedFiles++;
      if (onProgress) {
        onProgress(processedFiles, totalFiles);
      }
      return data;
    });
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Extrae un valor de un objeto anidado usando una ruta de acceso con notación de punto
 * @param obj Objeto del cual extraer el valor
 * @param path Ruta de acceso con notación de punto (ej: "nfeProc.NFe.infNFe.emit.xNome")
 * @returns El valor encontrado o undefined si no existe
 */
export const getValueByPath = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  
  // Dividimos la ruta en partes
  const parts = path.split('.');
  let current = obj;
  
  // Navegamos por el objeto siguiendo la ruta
  for (const part of parts) {
    // Verificamos si la parte actual tiene un índice de array
    const match = part.match(/^(.*)\[(\d+)\]$/);
    
    if (match) {
      // Si hay un índice, extraemos el nombre de la propiedad y el índice
      const [, propName, index] = match;
      current = current[propName];
      
      // Verificamos si existe el array y el índice
      if (Array.isArray(current) && current[Number(index)] !== undefined) {
        current = current[Number(index)];
      } else {
        return undefined;
      }
    } else {
      // Si no hay índice, simplemente accedemos a la propiedad
      current = current[part];
      
      // Si la propiedad no existe, devolvemos undefined
      if (current === undefined) return undefined;
    }
  }
  
  return current;
};

/**
 * Verifica si un objeto tiene una propiedad en una ruta específica
 * @param obj Objeto a verificar
 * @param path Ruta de acceso con notación de punto
 * @returns true si la propiedad existe, false en caso contrario
 */
export const hasPath = (obj: any, path: string): boolean => {
  return getValueByPath(obj, path) !== undefined;
};

/**
 * Extrae todos los valores de un objeto que coinciden con las rutas especificadas
 * @param obj Objeto del cual extraer los valores
 * @param paths Objeto con las rutas a extraer como claves y los nombres de columna como valores
 * @returns Objeto con los valores extraídos
 */
export const extractValues = (obj: any, paths: Record<string, string>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const [path, columnName] of Object.entries(paths)) {
    result[columnName] = getValueByPath(obj, path);
  }
  
  return result;
};

/**
 * Formatea valores monetarios según el formato brasileño
 * @param value Valor a formatear
 * @returns Valor formateado como string
 */
export const formatCurrency = (value: any): string => {
  if (value === undefined || value === null) return '';
  
  // Convertimos a número si es string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificamos si es un número válido
  if (isNaN(numValue)) return '';
  
  // Formateamos con 2 decimales y separador de miles
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export function parseMultipleNFeFiles(
  files: File[], 
  mappingProfile: Record<string, string>
): Promise<ParsedNFeData[]> {
  return Promise.all(
    files.map(async (file) => {
      try {
        const xmlContent = await file.text();
        const parsedData = parseNFeXml(xmlContent, mappingProfile);
        
        // Agregar información del archivo
        return {
          ...parsedData,
          '_fileName': file.name,
          '_fileSize': file.size,
          '_lastModified': file.lastModified
        };
      } catch (error) {
        console.error(`Error procesando archivo ${file.name}:`, error);
        return {
          '_fileName': file.name,
          '_fileSize': file.size,
          '_lastModified': file.lastModified,
          '_error': error instanceof Error ? error.message : 'Error desconocido'
        };
      }
    })
  );
} 