import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not update before the delay and applies the latest value after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'hola' },
    });

    rerender({ value: 'adios' });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('hola');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('adios');
  });

  it('resets the timer when the value changes again before the delay ends', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'uno' },
    });

    rerender({ value: 'dos' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    rerender({ value: 'tres' });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('uno');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('tres');
  });
});
