import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, DEFAULT_TOAST_DURATION_MS } from './Toast';

afterEach(() => vi.useRealTimers());

describe('Toast', () => {
  it('shows the message and lets the user close it with the X', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Toast open message="Todo salió bien" onClose={onClose} />);

    expect(screen.getByRole('status')).toHaveTextContent('Todo salió bien');
    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes by itself after the default time and not before', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast open message="Aviso" onClose={onClose} />);

    act(() => vi.advanceTimersByTime(DEFAULT_TOAST_DURATION_MS - 100));
    expect(onClose).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(200));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays open when the user clicks somewhere else on the page', () => {
    const onClose = vi.fn();
    render(<Toast open message="Aviso" onClose={onClose} />);

    fireEvent.click(document.body);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('honours a custom duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast open message="Aviso" onClose={onClose} autoHideDuration={1000} />);

    act(() => vi.advanceTimersByTime(1100));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
