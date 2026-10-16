// Ayuda para renderizar una pantalla con router y sesión, como en la app.
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

function Ubicacion() {
  const { pathname } = useLocation();
  return <p data-testid="ubicacion">{pathname}</p>;
}

/**
 * Renderiza `ui` en `ruta`. Si la pantalla navega a otra ruta, aparece
 * <p data-testid="ubicacion">/otra-ruta</p> para poder verificarlo.
 */
export function renderEnRuta(ui: ReactElement, ruta = '/') {
  const path = ruta.split('?')[0];
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="*" element={<Ubicacion />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}
