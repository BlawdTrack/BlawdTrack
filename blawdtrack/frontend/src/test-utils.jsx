import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from './context/authContextInstance';

export const superUser = {
  id: 1,
  fullName: 'Alicia Admin',
  email: 'alicia@blawdgourmet.com',
  role: 'SUPER_USUARIO',
  permissions: [],
};

// Renders `ui` inside a router and a controllable auth context.
export function renderWithProviders(ui, { route = '/', user = null, logout = () => {} } = {}) {
  return render(
    <AuthContext.Provider value={{ user, logout, login: () => {}, loading: false, error: null, resetError: () => {} }}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
}
