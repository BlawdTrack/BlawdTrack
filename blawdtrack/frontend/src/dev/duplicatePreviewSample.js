// SOLO DESARROLLO: previsualización de ejemplo para ver la pantalla de duplicados mientras la pantalla de
// importación (HU-010) no existe. Tiene la forma de `PackageImportPreviewResponse`; `customerName` y `address` de
// los duplicados son opcionales y hoy el backend no los envía. Se elimina cuando la importación alimente la pantalla.
export const DUPLICATE_PREVIEW_SAMPLE = {
  fileName: 'zoho_paquetes_octubre.xlsx',
  totalRecords: 9,
  validRecordsCount: 5,
  invalidRecordsCount: 1,
  duplicateRecordsCount: 3,
  validRecords: [],
  invalidRecords: [],
  duplicates: [
    {
      shipmentNumber: 'BG-2026-00123',
      occurrences: 1,
      reasons: ['ALREADY_REGISTERED'],
      customerName: 'Gabriela Mora Pineda',
      address: 'Moravia, San José',
    },
    {
      shipmentNumber: 'BG-2026-00141',
      occurrences: 2,
      reasons: ['DUPLICATED_IN_FILE'],
      customerName: 'Andrés Villalobos Sáenz',
      address: 'Sabana Sur, San José',
    },
    {
      shipmentNumber: 'BG-2026-00150',
      occurrences: 3,
      reasons: ['ALREADY_REGISTERED', 'DUPLICATED_IN_FILE'],
    },
  ],
};
