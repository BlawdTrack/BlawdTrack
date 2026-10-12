import { describe, it, expect } from 'vitest';
import { DUPLICATE_REASONS, countDuplicateCauses, describeDuplicate, duplicateRowCount } from './duplicateReport';

const { ALREADY_REGISTERED, DUPLICATED_IN_FILE } = DUPLICATE_REASONS;

describe('describeDuplicate', () => {
  it('explica un número que ya está en la base de datos', () => {
    expect(describeDuplicate({ reasons: [ALREADY_REGISTERED], occurrences: 1 })).toBe('Ya registrado en la base de datos');
  });

  it('cuenta las veces que se repite dentro del archivo', () => {
    expect(describeDuplicate({ reasons: [DUPLICATED_IN_FILE], occurrences: 3 })).toBe('Repetido 3 veces en el archivo');
  });

  it('no inventa un número de veces si solo llega una ocurrencia', () => {
    expect(describeDuplicate({ reasons: [DUPLICATED_IN_FILE], occurrences: 1 })).toBe('Repetido en el archivo');
    expect(describeDuplicate({ reasons: [DUPLICATED_IN_FILE] })).toBe('Repetido en el archivo');
  });

  it('junta las dos causas cuando el número está registrado y repetido', () => {
    expect(describeDuplicate({ reasons: [ALREADY_REGISTERED, DUPLICATED_IN_FILE], occurrences: 2 })).toBe(
      'Ya registrado en la base de datos · Repetido 2 veces en el archivo'
    );
  });

  it('devuelve vacío sin causas conocidas', () => {
    expect(describeDuplicate({ reasons: ['OTRA'] })).toBe('');
    expect(describeDuplicate({})).toBe('');
  });
});

describe('duplicateRowCount', () => {
  it('son las filas del archivo que cubre el número: sus ocurrencias', () => {
    expect(duplicateRowCount({ occurrences: 3 })).toBe(3);
  });

  it.each([[undefined], [null], [{}], [{ occurrences: 0 }], [{ occurrences: -2 }], [{ occurrences: 'dos' }]])('asume una fila si no hay ocurrencias válidas (%j)', (value) => {
    expect(duplicateRowCount(value)).toBe(1);
  });
});

describe('countDuplicateCauses', () => {
  it('cuenta filas, no números: un número repetido 3 veces en el archivo son 3 filas excluidas', () => {
    expect(countDuplicateCauses([{ reasons: [DUPLICATED_IN_FILE], occurrences: 3 }])).toEqual({ alreadyRegistered: 0, duplicatedInFile: 3 });
  });

  it('las causas son excluyentes: las filas de un número registrado y repetido cuentan solo como registradas', () => {
    const duplicates = [
      { reasons: [ALREADY_REGISTERED], occurrences: 1 },
      { reasons: [DUPLICATED_IN_FILE], occurrences: 2 },
      { reasons: [ALREADY_REGISTERED, DUPLICATED_IN_FILE], occurrences: 3 },
    ];

    expect(countDuplicateCauses(duplicates)).toEqual({ alreadyRegistered: 4, duplicatedInFile: 2 });
  });

  it('sin duplicados, con causas desconocidas o con elementos vacíos devuelve ceros', () => {
    expect(countDuplicateCauses()).toEqual({ alreadyRegistered: 0, duplicatedInFile: 0 });
    expect(countDuplicateCauses([{ reasons: ['OTRA'] }, null, {}])).toEqual({ alreadyRegistered: 0, duplicatedInFile: 0 });
  });
});
