// Shared document-type catalog: same three types and placeholders used by
// every form that captures a Costa Rican identity document (courier
// registration/edit, admin management, admin registration). Centralized here
// so a new document type is added in one place instead of N form files.

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'DIMEX', label: 'DIMEX' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

export const DOCUMENT_PLACEHOLDERS = {
  CEDULA: 'Ej. 1-2345-6789',
  DIMEX: 'Ej. 155812345678',
  PASAPORTE: 'Ej. A12345678',
};
