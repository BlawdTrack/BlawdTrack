import { describe, it, expect } from 'vitest';
import { DUPLICATE_REASONS, countDuplicateCauses, describeDuplicate } from './duplicateReport';

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

describe('countDuplicateCauses', () => {
  it('cuenta las causas de forma excluyente: un número registrado y repetido cuenta solo como registrado', () => {
    const duplicates = [
      { reasons: [ALREADY_REGISTERED] },
      { reasons: [DUPLICATED_IN_FILE] },
      { reasons: [ALREADY_REGISTERED, DUPLICATED_IN_FILE] },
    ];

    expect(countDuplicateCauses(duplicates)).toEqual({ alreadyRegistered: 2, duplicatedInFile: 1 });
  });

  it('sin duplicados, con causas desconocidas o con elementos vacíos devuelve ceros', () => {
    expect(countDuplicateCauses()).toEqual({ alreadyRegistered: 0, duplicatedInFile: 0 });
    expect(countDuplicateCauses([{ reasons: ['OTRA'] }, null, {}])).toEqual({ alreadyRegistered: 0, duplicatedInFile: 0 });
  });
});
