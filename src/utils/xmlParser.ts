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
    trimValues: true,
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      // Configurar elementos que siempre deben ser arrays
      const arrayElements = [
        'det', 'detPag', 'dup', 'vol', 'ICMS', 'PIS', 'COFINS', 'IPI'
      ];
      return arrayElements.includes(name);
    }
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
  if (!obj || !path) {
    return null;
  }

  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    
    if (current === null || current === undefined) {
      return null;
    }

    // Handle attributes
    if (key.startsWith('@')) {
      const attrName = key.substring(1);
      if (current[`@${attrName}`] !== undefined) {
        return current[`@${attrName}`];
      }
      if (current[attrName] !== undefined) {
        return current[attrName];
      }
      return null;
    }

    // Handle array access with index notation like "det[0]"
    const arrayMatch = key.match(/^(.*)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, propName, index] = arrayMatch;
      const indexNum = parseInt(index, 10);
      
      if (current[propName] !== undefined) {
        current = current[propName];
        if (Array.isArray(current) && current[indexNum] !== undefined) {
          current = current[indexNum];
        } else if (!Array.isArray(current) && indexNum === 0) {
          // If it's not an array but index is 0, treat as single item
          // current stays the same
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      // Normal property access
      if (Array.isArray(current)) {
        // If current is an array, take the first element
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
  }

  // Handle XML text content
  if (current && typeof current === 'object') {
    if (current._text !== undefined) {
      return current._text;
    }
    if (current['#text'] !== undefined) {
      return current['#text'];
    }
    // If it's an object without text content, return the object itself
    // The caller can decide how to handle it
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
      const dataArray = parseNFeXmlWithMultipleRows(xmlContent, mappingProfile);
      processedFiles++;
      if (onProgress) {
        onProgress(processedFiles, totalFiles);
      }
      return dataArray;
    });
    const batchResults = await Promise.all(batchPromises);
    // Aplanar los arrays de resultados
    batchResults.forEach(dataArray => {
      results.push(...dataArray);
    });
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
  console.log('parseMultipleNFeFiles called with:', files.length, 'files and', Object.keys(mappingProfile).length, 'mappings');
  
  return Promise.all(
    files.map(async (file, fileIndex) => {
      try {
        console.log(`Processing file ${fileIndex + 1}/${files.length}: ${file.name}`);
        const xmlContent = await file.text();
        const parsedDataArray = parseNFeXmlWithMultipleRows(xmlContent, mappingProfile);
        
        console.log(`File ${file.name} generated ${parsedDataArray.length} rows`);
        
        // Agregar información del archivo a cada fila generada
        return parsedDataArray.map((parsedData, rowIndex) => {
          const enrichedData = {
            ...parsedData,
            '_fileName': file.name,
            '_fileSize': file.size,
            '_lastModified': file.lastModified
          };
          
          // Log first row of first file for debugging
          if (fileIndex === 0 && rowIndex === 0) {
            console.log('First row sample:', enrichedData);
          }
          
          return enrichedData;
        });
      } catch (error) {
        console.error(`Error procesando archivo ${file.name}:`, error);
        return [{
          '_fileName': file.name,
          '_fileSize': file.size,
          '_lastModified': file.lastModified,
          '_error': error instanceof Error ? error.message : 'Error desconocido'
        }];
      }
    })
  ).then(results => {
    // Aplanar todos los arrays de resultados
    const flatResults = results.flat();
    console.log('parseMultipleNFeFiles final result:', flatResults.length, 'total rows');
    return flatResults;
  });
}

/**
 * Parsea un archivo XML de NFe y genera múltiples filas para cada combinación de producto, pago y duplicata
 * @param xmlContent Contenido del archivo XML como string
 * @param mappingProfile Perfil de mapeo de campos a usar (opcional)
 * @returns Array de datos extraídos de la NFe (una fila por cada combinación producto-pago-duplicata)
 */
export function parseNFeXmlWithMultipleRows(
  xmlContent: string,
  mappingProfile: Record<string, string> = DICCIONARIO_CV
): ParsedNFeData[] {
  console.log('parseNFeXmlWithMultipleRows called with mapping profile keys:', Object.keys(mappingProfile).length);
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    textNodeName: '_text',
    parseAttributeValue: true,
    parseTagValue: true,
    trimValues: true,
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      // Configurar elementos que siempre deben ser arrays
      const arrayElements = [
        'det', 'detPag', 'dup', 'vol', 'ICMS', 'PIS', 'COFINS', 'IPI'
      ];
      return arrayElements.includes(name);
    }
  });

  try {
    const parsedXml = parser.parse(xmlContent);
    console.log('XML parsed successfully');
    
    const results: ParsedNFeData[] = [];

    // Extraer productos, pagos y duplicatas
    const productos = extractArrayFromPath(parsedXml, 'nfeProc.NFe.infNFe.det');
    const pagos = extractArrayFromPath(parsedXml, 'nfeProc.NFe.infNFe.pag.detPag');
    const duplicatas = extractArrayFromPath(parsedXml, 'nfeProc.NFe.infNFe.cobr.dup');

    console.log('Extracted arrays:', { productos: productos.length, pagos: pagos.length, duplicatas: duplicatas.length });

    // Si no hay productos, pagos ni duplicatas, generar al menos una fila con datos generales
    if (productos.length === 0 && pagos.length === 0 && duplicatas.length === 0) {
      console.log('No products, payments, or duplicates found, creating single row with general data');
      const generalData: ParsedNFeData = {};
      let foundData = false;
      
      Object.keys(mappingProfile).forEach((xmlPath) => {
        try {
          const value = extractValueFromPath(parsedXml, xmlPath);
          generalData[xmlPath] = value;
          if (value !== null && value !== undefined && value !== '') {
            foundData = true;
          }
        } catch (error) {
          console.warn(`Error extrayendo valor para ${xmlPath}:`, error);
          generalData[xmlPath] = null;
        }
      });
      
      if (foundData) {
        results.push(generalData);
      } else {
        console.warn('No data found even in general fields');
      }
      return results;
    }

    // Generar una fila por cada combinación de producto, pago y duplicata
    const productosArray = productos.length > 0 ? productos : [{}];
    const pagosArray = pagos.length > 0 ? pagos : [{}];
    const duplicatasArray = duplicatas.length > 0 ? duplicatas : [{}];

    console.log('Processing combinations:', { 
      productos: productosArray.length, 
      pagos: pagosArray.length, 
      duplicatas: duplicatasArray.length 
    });

    for (let i = 0; i < productosArray.length; i++) {
      for (let j = 0; j < pagosArray.length; j++) {
        for (let k = 0; k < duplicatasArray.length; k++) {
          const rowData: ParsedNFeData = {};
          let hasRowData = false;

          Object.keys(mappingProfile).forEach((xmlPath) => {
            try {
              let value: any;

              // Si es campo de producto, tomar del producto correspondiente
              if (xmlPath.includes('det.prod') || xmlPath.includes('det.imposto') || xmlPath.includes('det.infAdProd') || xmlPath.includes('det.@nItem')) {
                // Reemplazar la ruta del producto con el índice correcto
                const prodPath = xmlPath.replace('nfeProc.NFe.infNFe.det.', '');
                value = extractValueFromPath(productosArray[i], prodPath);
              }
              // Si es campo de pago, tomar del pago correspondiente
              else if (xmlPath.includes('pag.detPag')) {
                // Reemplazar la ruta del pago con el índice correcto
                const pagoPath = xmlPath.replace('nfeProc.NFe.infNFe.pag.detPag.', '');
                value = extractValueFromPath(pagosArray[j], pagoPath);
              }
              // Si es campo de duplicata, tomar de la duplicata correspondiente
              else if (xmlPath.includes('cobr.dup')) {
                // Reemplazar la ruta de la duplicata con el índice correcto
                const dupPath = xmlPath.replace('nfeProc.NFe.infNFe.cobr.dup.', '');
                value = extractValueFromPath(duplicatasArray[k], dupPath);
              }
              // Si es campo general, tomar del objeto general
              else {
                value = extractValueFromPath(parsedXml, xmlPath);
              }

              rowData[xmlPath] = value;
              
              if (value !== null && value !== undefined && value !== '') {
                hasRowData = true;
              }
            } catch (error) {
              console.warn(`Error extrayendo valor para ${xmlPath}:`, error);
              rowData[xmlPath] = null;
            }
          });

          if (hasRowData) {
            results.push(rowData);
          }
        }
      }
    }

    console.log('parseNFeXmlWithMultipleRows generated', results.length, 'rows');
    return results;
  } catch (error) {
    console.error('Error parseando XML:', error);
    throw new Error('Error al parsear el archivo XML: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Extrae un array de un objeto anidado usando una ruta de acceso
 * @param obj Objeto del cual extraer el array
 * @param path Ruta de acceso con notación de punto
 * @returns Array extraído o array vacío si no existe
 */
function extractArrayFromPath(obj: any, path: string): any[] {
  const value = extractValueFromPath(obj, path);
  if (Array.isArray(value)) {
    return value;
  } else if (value && typeof value === 'object') {
    return [value];
  }
  return [];
} 