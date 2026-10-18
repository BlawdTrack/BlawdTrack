import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PackageProofCard from './PackageProofCard';

// Datos con la forma real del `PackageDetailResponse`: el backend solo expone
// la evidencia cuando el estado es DELIVERED, y la fotografía y la firma llegan
// como URLs de referencia (no como cadenas con los binarios).
const deliveredPkg = {
  id: 10,
  shipmentNumber: 'BG-2026-00121',
  status: 'DELIVERED',
  deliveryEvidenceUrl: null,
  deliverySignatureUrl: 'https://cdn.blawd.test/firma.png',
  deliveryPhotoUrl: 'https://cdn.blawd.test/foto.png',
};

// Historial real de una entrega, en el mismo formato de `PackageHistoryEntry`.
const deliveredEntries = [
  {
    timestamp: '2026-09-16T22:19:00',
    action: 'CAMBIAR_ESTADO_PAQUETE',
    actorName: 'Administrador de Ventas',
    previousStatus: null,
    newStatus: 'PENDING',
  },
  {
    timestamp: '2026-09-17T08:30:00',
    action: 'CAMBIAR_ESTADO_PAQUETE',
    actorName: null,
    previousStatus: 'IN_TRANSIT',
    newStatus: 'DELIVERED',
  },
];

describe('PackageProofCard', () => {
  it('muestra la fotografía real registrada por el backend, sin marcador de posición', () => {
    render(<PackageProofCard pkg={deliveredPkg} entries={deliveredEntries} />);

    // Se usa `getByAltText` (y no `getByRole('img')`) porque mientras la
    // fotografía carga el nodo queda oculto y fuera del árbol de accesibilidad.
    const photo = screen.getByAltText('Fotografía de la entrega del paquete BG-2026-00121');
    expect(photo).toHaveAttribute('src', 'https://cdn.blawd.test/foto.png');

    // Mientras la imagen carga hay un indicador discreto; al cargar desaparece.
    expect(screen.getByRole('status', { name: /cargando la fotografía/i })).toBeInTheDocument();
    fireEvent.load(photo);
    expect(screen.queryByRole('status', { name: /cargando la fotografía/i })).toBeNull();

    expect(screen.queryByText('Fotografía de la entrega')).toBeNull();
    expect(screen.queryByText('(cargada por el mensajero)')).toBeNull();
  });

  it('muestra el marcador de posición cuando la entrega no tiene fotografía registrada', () => {
    render(<PackageProofCard pkg={{ ...deliveredPkg, deliveryPhotoUrl: null }} entries={deliveredEntries} />);

    expect(screen.getByText('Fotografía de la entrega')).toBeInTheDocument();
    expect(screen.getByText('(cargada por el mensajero)')).toBeInTheDocument();
    expect(screen.queryByAltText(/fotografía de la entrega/i)).toBeNull();
  });

  it('distingue un paquete que todavía no está entregado', () => {
    render(
      <PackageProofCard
        pkg={{ ...deliveredPkg, status: 'IN_TRANSIT', deliveryPhotoUrl: null, deliverySignatureUrl: null }}
        entries={deliveredEntries}
      />
    );

    expect(screen.getByText('El paquete aún no registra una entrega completada.')).toBeInTheDocument();
    // No se presentan confirmación de recepción ni de firma sin entrega.
    expect(screen.queryByText('Fotografía de la entrega')).toBeNull();
    expect(screen.queryByText(/firma digital/i)).toBeNull();
  });

  it('informa cuando la fotografía no puede cargarse y permite reintentar', () => {
    render(<PackageProofCard pkg={deliveredPkg} entries={deliveredEntries} />);

    const photo = screen.getByAltText(/fotografía de la entrega/i);
    fireEvent.error(photo);

    // El fallo de recuperación no se presenta como ausencia de evidencia.
    expect(screen.getByText(/No fue posible cargar la fotografía de la entrega/)).toBeInTheDocument();
    expect(screen.queryByText('Fotografía de la entrega')).toBeNull();

    // El reintento vuelve a montar la imagen para recuperarla.
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(screen.getByAltText(/fotografía de la entrega/i)).toBeInTheDocument();
    expect(screen.queryByText(/No fue posible cargar la fotografía de la entrega/)).toBeNull();
  });

  it('confirma la firma digital únicamente cuando el backend la registra', () => {
    const { rerender } = render(<PackageProofCard pkg={deliveredPkg} entries={deliveredEntries} />);

    expect(screen.getByText(/Firma digital registrada al cierre de la entrega\./)).toBeInTheDocument();

    // Sin URL de firma no se afirma que exista un registro de firma.
    rerender(<PackageProofCard pkg={{ ...deliveredPkg, deliverySignatureUrl: null }} entries={deliveredEntries} />);

    expect(screen.getByText('Sin firma digital registrada.')).toBeInTheDocument();
    expect(screen.queryByText(/Firma digital registrada/)).toBeNull();
  });

  it('incorpora la fecha real de la entrega tomada del historial del paquete', () => {
    render(<PackageProofCard pkg={deliveredPkg} entries={deliveredEntries} />);

    expect(screen.getByText(/Entrega registrada el 17\/09\/2026 a las 08:30\./)).toBeInTheDocument();
  });

  it('no muestra fecha de entrega cuando el historial no aporta el registro', () => {
    render(<PackageProofCard pkg={deliveredPkg} entries={[]} />);

    expect(screen.queryByText(/Entrega registrada/)).toBeNull();
    // El resto del resumen sigue construido con datos reales.
    expect(screen.getByText(/Firma digital registrada al cierre de la entrega\./)).toBeInTheDocument();
  });

  it('actualiza la evidencia al consultar otro paquete, sin conservar la anterior', () => {
    const { rerender } = render(<PackageProofCard pkg={deliveredPkg} entries={deliveredEntries} />);

    expect(screen.getByAltText(/BG-2026-00121/)).toBeInTheDocument();

    // Segunda consulta: paquete distinto, aún no entregado y sin evidencia propia.
    rerender(
      <PackageProofCard
        pkg={{ ...deliveredPkg, shipmentNumber: 'BG-2026-00999', status: 'PENDING', deliveryPhotoUrl: null, deliverySignatureUrl: null }}
        entries={[]}
      />
    );

    expect(screen.getByText('El paquete aún no registra una entrega completada.')).toBeInTheDocument();
    expect(screen.queryByAltText(/fotografía de la entrega/i)).toBeNull();
    expect(screen.queryByText(/Firma digital registrada/)).toBeNull();
    expect(screen.queryByText(/Entrega registrada/)).toBeNull();
  });
});
