/** Archivo de ejemplo que se descarga desde la pantalla de importación: las columnas de Zoho con datos ficticios. */
export const SAMPLE_CSV_FILE_NAME = 'ejemplo-importacion-paquetes.csv';

// Las dos primeras filas comparten número de envío: Zoho exporta una fila por artículo y la importación las agrupa en un paquete.
const SAMPLE_ROWS = [
  ['Packing Number', 'SO Number', 'Customer Name', 'Shipping Address', 'Shipping Phone', 'Schedule', 'Item Name', 'Quantity Packed'],
  ['PK-0001', 'SO-0001', 'Cliente Ejemplo Uno', 'San José, Escazú', '88001111', '9:00 am - 4:00 pm', 'Alfajor de café', '2'],
  ['PK-0001', 'SO-0001', 'Cliente Ejemplo Uno', 'San José, Escazú', '88001111', '9:00 am - 4:00 pm', 'Caja Blawd', '1'],
  ['PK-0002', 'SO-0002', 'Cliente Ejemplo Dos', 'Heredia, Barva', '88002222', '8:00 am - 12:00 pm', 'Brownie', '3'],
];

const quote = (cell) => (/[",\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell);

/** Contenido del CSV de ejemplo, con comillas en las celdas que llevan comas. */
export const SAMPLE_CSV_CONTENT = SAMPLE_ROWS.map((row) => row.map(quote).join(',')).join('\r\n') + '\r\n';

/**
 * Descarga un texto como archivo CSV (con BOM para que Excel respete las tildes).
 * @param {string} fileName
 * @param {string} content
 */
export function downloadCsv(fileName, content) {
  const url = URL.createObjectURL(new Blob(['﻿', content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
