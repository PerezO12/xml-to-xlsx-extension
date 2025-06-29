import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatCurrency } from './xmlParser';
import { DICCIONARIO_CV, CAMPOS_MONEDA } from './constants';

// Tipos para el mapeo de campos
export interface ColumnMapping {
  xmlPath: string;
  columnName: string;
  formatAsCurrency?: boolean;
}

export interface ProfileConfig {
  id: string;
  name: string;
  description: string;
  mappings: ColumnMapping[];
  isActive: boolean;
}

/**
 * Interfaz para representar los datos mapeados de una NFe
 */
interface NFeData {
  [key: string]: string | number | boolean | null;
}

/**
 * Configuración para el mapeo de campos a columnas en el XLSX
 */
interface MappingProfile {
  [xmlPath: string]: string; // Mapeo de ruta XML a nombre de columna
}

/**
 * Convierte datos XML parseados a un formato adecuado para Excel
 * @param xmlData Array de objetos XML parseados
 * @param mappings Configuración de mapeo de columnas
 * @returns Array de objetos con los datos mapeados para Excel
 */
export const prepareDataForExcel = (xmlData: any[], mappings: ColumnMapping[]): any[] => {
  return xmlData.map(xmlObj => {
    const row: Record<string, any> = {};
    
    // Para cada mapeo, extraemos el valor del XML
    mappings.forEach(mapping => {
      const value = getValueByPath(xmlObj, mapping.xmlPath);
      
      // Si es un campo monetario, lo formateamos
      if (mapping.formatAsCurrency) {
        row[mapping.columnName] = formatCurrency(value);
      } else {
        row[mapping.columnName] = value;
      }
    });
    
    return row;
  });
};

/**
 * Genera un archivo Excel a partir de datos procesados
 * @param data Datos procesados listos para Excel
 * @param fileName Nombre del archivo a generar
 */
export const generateExcel = (data: any[], fileName: string = 'nfe-mapeado.xlsx'): void => {
  // Creamos un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();
  
  // Convertimos los datos a una hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Añadimos la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'NFe Data');
  
  // Generamos el archivo y lo descargamos
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, fileName);
};

/**
 * Procesa múltiples archivos XML y genera un Excel con los datos mapeados
 * @param xmlFiles Archivos XML a procesar
 * @param profile Perfil de mapeo a utilizar
 * @param onProgress Callback para reportar progreso
 * @param parseXmlFn Función para parsear XML
 */
export const processXmlFilesAndGenerateExcel = async (
  xmlFiles: File[],
  profile: ProfileConfig,
  onProgress?: (progress: number) => void,
  parseXmlFn?: (content: string) => any
): Promise<void> => {
  // Validamos que haya archivos y un perfil
  if (!xmlFiles.length) {
    throw new Error('No se han seleccionado archivos XML');
  }
  
  if (!profile || !profile.mappings.length) {
    throw new Error('No hay un perfil de mapeo configurado');
  }
  
  // Función para leer un archivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };
  
  try {
    // Array para almacenar todos los datos procesados
    const allProcessedData: any[] = [];
    
    // Procesamos cada archivo
    for (let i = 0; i < xmlFiles.length; i++) {
      // Leemos el contenido del archivo
      const xmlContent = await readFileAsText(xmlFiles[i]);
      
      // Parseamos el XML
      const parsedXml = parseXmlFn ? parseXmlFn(xmlContent) : { error: 'Función de parseo no proporcionada' };
      
      // Si es un solo objeto, lo convertimos en array
      const xmlDataArray = [parsedXml];
      
      // Preparamos los datos para Excel
      const processedData = prepareDataForExcel(xmlDataArray, profile.mappings);
      
      // Añadimos al array general
      allProcessedData.push(...processedData);
      
      // Reportamos progreso si hay callback
      if (onProgress) {
        onProgress((i + 1) / xmlFiles.length * 100);
      }
    }
    
    // Generamos el Excel con todos los datos
    generateExcel(allProcessedData);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error al procesar los archivos XML:', error);
    return Promise.reject(error);
  }
};

/**
 * Procesa archivos XML con múltiples productos y genera un Excel
 * @param xmlFiles Archivos XML a procesar
 * @param profile Perfil de mapeo a utilizar
 * @param onProgress Callback para reportar progreso
 * @param parseXmlFn Función para parsear XML
 */
export const processMultiProductXmlFiles = async (
  xmlFiles: File[],
  profile: ProfileConfig,
  onProgress?: (progress: number) => void,
  parseXmlFn?: (content: string) => any
): Promise<void> => {
  // Validamos que haya archivos y un perfil
  if (!xmlFiles.length) {
    throw new Error('No se han seleccionado archivos XML');
  }
  
  if (!profile || !profile.mappings.length) {
    throw new Error('No hay un perfil de mapeo configurado');
  }
  
  // Función para leer un archivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };
  
  try {
    // Array para almacenar todos los datos procesados
    const allProcessedData: any[] = [];
    
    // Procesamos cada archivo
    for (let i = 0; i < xmlFiles.length; i++) {
      // Leemos el contenido del archivo
      const xmlContent = await readFileAsText(xmlFiles[i]);
      
      // Parseamos el XML
      const parsedXml = parseXmlFn ? parseXmlFn(xmlContent) : { error: 'Función de parseo no proporcionada' };
      
      // Extraemos información común (cabecera de la factura)
      const commonData: Record<string, any> = {};
      profile.mappings.forEach(mapping => {
        // Solo procesamos campos que no son de detalle de productos
        if (!mapping.xmlPath.includes('nfeProc.NFe.infNFe.det[')) {
          const value = getValueByPath(parsedXml, mapping.xmlPath);
          commonData[mapping.columnName] = mapping.formatAsCurrency ? formatCurrency(value) : value;
        }
      });
      
      // Obtenemos los productos
      const products = getValueByPath(parsedXml, 'nfeProc.NFe.infNFe.det') || [];
      const productsArray = Array.isArray(products) ? products : [products];
      
      // Para cada producto, creamos una fila combinando datos comunes y específicos
      productsArray.forEach(product => {
        const productData: Record<string, any> = { ...commonData };
        
        // Procesamos campos específicos de productos
        profile.mappings.forEach(mapping => {
          if (mapping.xmlPath.includes('nfeProc.NFe.infNFe.det[')) {
            // Extraemos la ruta específica del producto actual
            const productPath = mapping.xmlPath.replace(/nfeProc\.NFe\.infNFe\.det\[\d+\]/, '');
            const fullPath = productPath.startsWith('.') ? productPath.substring(1) : productPath;
            
            // Obtenemos el valor
            const value = getValueByPath(product, fullPath);
            productData[mapping.columnName] = mapping.formatAsCurrency ? formatCurrency(value) : value;
          }
        });
        
        allProcessedData.push(productData);
      });
      
      // Reportamos progreso si hay callback
      if (onProgress) {
        onProgress((i + 1) / xmlFiles.length * 100);
      }
    }
    
    // Generamos el Excel con todos los datos
    generateExcel(allProcessedData);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error al procesar los archivos XML:', error);
    return Promise.reject(error);
  }
};

/**
 * Genera un archivo XLSX a partir de los datos de NFes
 * @param data Arreglo de datos de NFes
 * @param mappingProfile Perfil de mapeo de campos a usar
 * @param formatCurrency Indica si se deben formatear los valores monetarios
 * @returns Buffer del archivo XLSX
 */
export async function generateXlsx(
  data: Record<string, any>[],
  mappingProfile: Record<string, string>,
  formatCurrency: boolean = true
): Promise<Buffer> {
  console.log('generateXlsx llamado con:', { dataLength: data.length, mappingProfile, formatCurrency });
  
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();

  // Preparar los datos para la hoja de cálculo
  const worksheetData = prepareWorksheetData(data, mappingProfile, formatCurrency);
  
  console.log('Datos preparados para worksheet:', worksheetData.length, 'filas');
  if (worksheetData.length > 0) {
    console.log('Primera fila:', worksheetData[0]);
  }

  // Crear la hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Ajustar el ancho de las columnas automáticamente
  adjustColumnWidth(worksheet, worksheetData);

  // Agregar la hoja al libro de trabajo
  XLSX.utils.book_append_sheet(workbook, worksheet, 'NFes');

  // Generar el buffer del archivo XLSX
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  return buffer;
}

/**
 * Genera un archivo XLSX con múltiples hojas a partir de los datos de NFes
 * @param data Arreglo de datos de NFes
 * @param mappingProfile Perfil de mapeo de campos a usar
 * @param formatCurrency Indica si se deben formatear los valores monetarios
 * @param maxRowsPerSheet Máximo número de filas por hoja
 * @returns Buffer del archivo XLSX
 */
export async function generateXlsxWithMultipleSheets(
  data: Record<string, any>[],
  mappingProfile: Record<string, string>,
  formatCurrency: boolean = true,
  maxRowsPerSheet: number = 1000
): Promise<Buffer> {
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();

  // Preparar los datos para las hojas de cálculo
  const worksheetData = prepareWorksheetData(data, mappingProfile, formatCurrency);

  // Dividir los datos en múltiples hojas
  let sheetIndex = 1;
  for (let i = 0; i < worksheetData.length; i += maxRowsPerSheet) {
    const chunk = worksheetData.slice(i, i + maxRowsPerSheet);
    const worksheet = XLSX.utils.json_to_sheet(chunk);

    // Ajustar el ancho de las columnas automáticamente
    adjustColumnWidth(worksheet, chunk);

    // Agregar la hoja al libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, `NFes_${sheetIndex}`);
    sheetIndex++;
  }

  // Generar el buffer del archivo XLSX
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  return buffer;
}

/**
 * Prepara los datos para la hoja de cálculo, manejando múltiples productos y pagos
 * @param data Arreglo de datos de NFes
 * @param mappingProfile Perfil de mapeo de campos a usar
 * @param formatCurrency Indica si se deben formatear los valores monetarios
 * @returns Datos preparados para la hoja de cálculo
 */
function prepareWorksheetData(
  data: Record<string, any>[],
  mappingProfile: Record<string, string>,
  formatCurrency: boolean
): Record<string, any>[] {
  const result: Record<string, any>[] = [];

  data.forEach((nfe) => {
    const row: Record<string, any> = {};
    Object.entries(mappingProfile).forEach(([xmlPath, columnName]) => {
      let value = nfe[xmlPath];

      // Formatear valores monetarios si es necesario
      if (formatCurrency && CAMPOS_MONEDA.includes(xmlPath) && value !== undefined && value !== null) {
        value = formatCurrencyValue(value);
      } else if (xmlPath.includes('dhEmi') || xmlPath.includes('dhSaiEnt') || xmlPath.includes('dFab') || xmlPath.includes('dVal') || xmlPath.includes('dhRecbto')) {
        value = formatDateValue(value);
      }

      row[columnName] = value;
    });
    result.push(row);
  });

  return result;
}

/**
 * Obtiene un arreglo de valores de un objeto anidado usando una ruta de acceso
 * @param obj Objeto del cual extraer el arreglo
 * @param path Ruta de acceso con notación de punto
 * @returns Arreglo de valores o arreglo vacío si no existe
 */
function getArrayFromPath(obj: any, path: string): any[] {
  const value = getValueByPath(obj, path);
  return Array.isArray(value) ? value : value ? [value] : [];
}

/**
 * Extrae un valor de un objeto anidado usando una ruta de acceso con notación de punto
 * @param obj Objeto del cual extraer el valor
 * @param path Ruta de acceso con notación de punto
 * @returns El valor encontrado o undefined si no existe
 */
function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    const match = part.match(/^(.*)\[(\d+)\]$/);
    
    if (match) {
      const [, propName, index] = match;
      current = current[propName];
      
      if (Array.isArray(current) && current[Number(index)] !== undefined) {
        current = current[Number(index)];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
      
      if (current === undefined) return undefined;
    }
  }
  
  return current;
}

/**
 * Formatea un valor monetario según el formato brasileño
 * @param value Valor a formatear
 * @returns Valor formateado como string
 */
function formatCurrencyValue(value: any): string {
  if (value === undefined || value === null) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formatea un valor de fecha
 * @param value Valor a formatear
 * @returns Valor formateado como fecha
 */
function formatDateValue(value: any): string {
  if (value === undefined || value === null) return '';
  
  const date = new Date(value);
  if (isNaN(date.getTime())) return value.toString();
  
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Ajusta el ancho de las columnas de una hoja de cálculo
 * @param worksheet Hoja de cálculo
 * @param data Datos de la hoja de cálculo
 */
function adjustColumnWidth(worksheet: XLSX.WorkSheet, data: Record<string, any>[]) {
  if (!worksheet['!cols']) worksheet['!cols'] = [];
  
  const colWidths: number[] = [];
  const header = Object.keys(data[0] || {});
  
  header.forEach((key, colIndex) => {
    let maxWidth = key.length;
    data.forEach(row => {
      const value = row[key] ? String(row[key]) : '';
      maxWidth = Math.max(maxWidth, value.length);
    });
    colWidths[colIndex] = Math.min(maxWidth + 2, 50);
  });
  
  worksheet['!cols'] = colWidths.map(w => ({ wch: w }));
} 