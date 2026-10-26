import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WelcomeBanner from './WelcomeBanner';

describe('WelcomeBanner', () => {
  it('shows the role, the greeting as the page title and the question', () => {
    render(<WelcomeBanner roleLabel="Súper Usuario" greeting="Buenos días" question="¿Qué deseas hacer hoy?" />);

    expect(screen.getByText('Súper Usuario')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Buenos días' })).toBeInTheDocument();
    expect(screen.getByText('¿Qué deseas hacer hoy?')).toBeInTheDocument();
  });

  it('hides its route illustration from assistive technology', () => {
    const { container } = render(<WelcomeBanner roleLabel="Súper Usuario" greeting="Buenas tardes" question="¿Qué deseas hacer hoy?" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
