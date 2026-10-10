import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordField from './PasswordField';

describe('PasswordField', () => {
  it('hides the password by default and toggles its visibility from the button', async () => {
    const user = userEvent.setup();
    render(<PasswordField id="pwd" label="Clave" visibilityLabel="clave" />);
    const input = screen.getByLabelText('Clave');

    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar clave' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Ocultar clave' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
