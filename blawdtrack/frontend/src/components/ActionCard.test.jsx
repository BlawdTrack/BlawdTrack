import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import ActionCard from './ActionCard';

const renderCard = (props) =>
  render(
    <MemoryRouter>
      <ActionCard icon={PersonAddAlt1OutlinedIcon} title="Crear mensajero" description="Registra un mensajero." actionLabel="Registrar nuevo" {...props} />
    </MemoryRouter>
  );

describe('ActionCard', () => {
  it('is one link to its screen with the title, the description and the short action', () => {
    renderCard({ to: '/mensajeros/crear' });
    const link = screen.getByRole('link', { name: /Crear mensajero/ });
    expect(link).toHaveAttribute('href', '/mensajeros/crear');
    expect(screen.getByRole('heading', { level: 2, name: 'Crear mensajero' })).toBeInTheDocument();
    expect(screen.getByText('Registra un mensajero.')).toBeInTheDocument();
    expect(screen.getByText('Registrar nuevo')).toBeInTheDocument();
  });

  it('accepts the danger tone without changing its content', () => {
    renderCard({ to: '/mensajeros/desactivar', tone: 'danger', title: 'Desactivar mensajero' });
    expect(screen.getByRole('link', { name: /Desactivar mensajero/ })).toBeInTheDocument();
  });

  it('is disabled with the "Próximamente" notice when it has no screen yet', () => {
    renderCard({ to: null });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Próximamente')).toBeInTheDocument();
    expect(screen.queryByText('Registrar nuevo')).not.toBeInTheDocument();
  });
});
