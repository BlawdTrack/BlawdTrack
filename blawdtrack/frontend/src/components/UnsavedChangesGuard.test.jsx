import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, RouterProvider, createMemoryRouter } from 'react-router-dom';
import UnsavedChangesGuard from './UnsavedChangesGuard';

function Editor({ dirty }) {
  return (
    <>
      <UnsavedChangesGuard when={dirty} />
      <p>pantalla de edición</p>
      <Link to="/otra">Ir a otra función</Link>
    </>
  );
}

const renderApp = (dirty) => {
  const router = createMemoryRouter(
    [
      { path: '/editar', element: <Editor dirty={dirty} /> },
      { path: '/otra', element: <p>otra función</p> },
    ],
    { initialEntries: ['/editar'] }
  );
  render(<RouterProvider router={router} />);
  return router;
};

describe('UnsavedChangesGuard', () => {
  it('deja navegar sin avisos cuando no hay cambios sin guardar', async () => {
    const user = userEvent.setup();
    renderApp(false);

    await user.click(screen.getByRole('link', { name: 'Ir a otra función' }));

    expect(await screen.findByText('otra función')).toBeInTheDocument();
    expect(screen.queryByText('¿Salir sin guardar?')).not.toBeInTheDocument();
  });

  it('avisa al ir a otra función con cambios sin guardar y deja seguir editando', async () => {
    const user = userEvent.setup();
    const router = renderApp(true);

    await user.click(screen.getByRole('link', { name: 'Ir a otra función' }));
    expect(await screen.findByText('¿Salir sin guardar?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));

    await waitFor(() => expect(screen.queryByText('¿Salir sin guardar?')).not.toBeInTheDocument());
    expect(screen.getByText('pantalla de edición')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/editar');
  });

  it('sale a la otra función si se confirma descartar los cambios', async () => {
    const user = userEvent.setup();
    renderApp(true);

    await user.click(screen.getByRole('link', { name: 'Ir a otra función' }));
    await user.click(await screen.findByRole('button', { name: 'Salir sin guardar' }));

    expect(await screen.findByText('otra función')).toBeInTheDocument();
  });

  it('avisa antes de cerrar o recargar la pestaña solo con cambios sin guardar', () => {
    const { rerender } = render(<UnsavedChangesGuard when={false} />);
    const clean = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);

    rerender(<UnsavedChangesGuard when />);
    const dirty = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
  });
});
