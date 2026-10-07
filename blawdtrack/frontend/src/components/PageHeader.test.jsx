import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PageHeader from './PageHeader';
import { ROUTES } from '../config/routes';

const renderAt = (route) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={ROUTES.MAIN_MENU} element={<div>main menu content</div>} />
        <Route path={ROUTES.MODULE_COURIERS} element={<PageHeader title="Mensajeros" />} />
        <Route path={ROUTES.COURIER_CREATE} element={<PageHeader title="Crear mensajero" description="Registra uno." />} />
        <Route path="/otra" element={<PageHeader title="Otra pantalla" />} />
      </Routes>
    </MemoryRouter>
  );

describe('PageHeader', () => {
  it('shows the title and the description', () => {
    renderAt(ROUTES.COURIER_CREATE);
    expect(screen.getByRole('heading', { level: 1, name: 'Crear mensajero' })).toBeInTheDocument();
    expect(screen.getByText('Registra uno.')).toBeInTheDocument();
  });

  it('puts a back arrow before the title that goes from a function to its module menu', () => {
    renderAt(ROUTES.COURIER_CREATE);
    const arrow = screen.getByRole('link', { name: 'Volver a Mensajeros' });
    expect(arrow).toHaveAttribute('href', ROUTES.MODULE_COURIERS);
    expect(arrow.compareDocumentPosition(screen.getByRole('heading', { level: 1 }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('goes from a module menu back to the main menu', async () => {
    const user = userEvent.setup();
    renderAt(ROUTES.MODULE_COURIERS);

    await user.click(screen.getByRole('link', { name: 'Volver a Menú principal' }));

    expect(screen.getByText('main menu content')).toBeInTheDocument();
  });

  it('has no arrow on screens that are not part of a module', () => {
    renderAt('/otra');
    expect(screen.queryByRole('link', { name: /^volver a/i })).not.toBeInTheDocument();
  });

  it('renders without a router (isolated screens) and without an arrow', () => {
    render(<PageHeader title="Aislada" />);
    expect(screen.getByRole('heading', { name: 'Aislada' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
