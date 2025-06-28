self.onmessage = async function(e) {
  const { xmlFiles, mappingProfile } = e.data;
  const results = [];
  let processedFiles = 0;
  const totalFiles = xmlFiles.length;

  // Procesar archivos en lotes más grandes para mayor rendimiento
  // Para 2000 archivos en 3-5 minutos, ajustamos el tamaño del lote a 100
  const batchSize = 100;
  for (let i = 0; i < totalFiles; i += batchSize) {
    const batch = xmlFiles.slice(i, i + batchSize);
    const batchResults = [];
    for (const file of batch) {
      const xmlContent = await file.text();
      const data = parseNFeXml(xmlContent, mappingProfile);
      batchResults.push(data);
      processedFiles++;
      self.postMessage({ type: 'progress', processed: processedFiles, total: totalFiles });
    }
    results.push(...batchResults);
  }

  self.postMessage({ type: 'result', data: results });
  self.close();
};

function parseNFeXml(xmlContent, mappingProfile) {
  // Aquí se implementaría el parseo del XML usando fast-xml-parser
  // Esta es una versión simplificada para el worker
  const result = {};
  Object.keys(mappingProfile).forEach((xmlPath) => {
    try {
      // Simulación de parseo
      result[xmlPath] = 'valor_simulado';
    } catch (error) {
      result[xmlPath] = null;
    }
  });
  return result;
} 