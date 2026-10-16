import { describe, it, expect } from 'vitest';
import { getGreeting } from './greeting';

const at = (hour, minute = 0) => new Date(2026, 9, 7, hour, minute);

describe('getGreeting', () => {
  it.each([
    [5, 0, 'Buenos días'],
    [8, 30, 'Buenos días'],
    [11, 59, 'Buenos días'],
    [12, 0, 'Buenas tardes'],
    [15, 45, 'Buenas tardes'],
    [18, 59, 'Buenas tardes'],
    [19, 0, 'Buenas noches'],
    [23, 59, 'Buenas noches'],
    [0, 0, 'Buenas noches'],
    [4, 59, 'Buenas noches'],
  ])('a las %i:%i dice "%s"', (hour, minute, expected) => {
    expect(getGreeting(at(hour, minute))).toBe(expected);
  });
});
