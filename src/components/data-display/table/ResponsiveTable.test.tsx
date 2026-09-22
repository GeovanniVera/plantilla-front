import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../../../lib/i18n/config';
import ResponsiveTable from './ResponsiveTable';
import type { Column } from './types';

interface TestRow {
  id: string;
  name: string;
  email: string;
  status: string;
}

const ROWS: TestRow[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com', status: 'Activo' },
  { id: '2', name: 'Bob', email: 'bob@test.com', status: 'Suspendido' },
];

const DATA_COLUMNS: Column<TestRow>[] = [
  { key: 'name', header: 'Nombre' },
  { key: 'email', header: 'Email' },
  { key: 'status', header: 'Estado' },
];

function actionColumn(onSuspend: (row: TestRow) => void): Column<TestRow> {
  return {
    key: 'actions',
    header: '',
    align: 'right',
    render: (_value, row) => (
      <button type="button" onClick={() => onSuspend(row)}>
        Suspender
      </button>
    ),
  };
}

/*
 * jsdom does not implement matchMedia and `useMediaQuery` reads it directly.
 * The default here is desktop (matches:false), which keeps other suites' status
 * quo; mobile tests opt in per test with `stubMatchMedia(true)`.
 */
function stubMatchMedia(matches: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  stubMatchMedia(false);
});

describe('ResponsiveTable — mobile (cards expandibles)', () => {
  it('colapsada muestra sólo la primera columna y no expone el resto', () => {
    stubMatchMedia(true);
    render(<ResponsiveTable columns={DATA_COLUMNS} data={ROWS} keyExtractor={(row) => row.id} />);

    // Sólo la primera columna: valor visible, su label eliminado por diseño.
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Nombre')).not.toBeInTheDocument();

    // El resto de columnas no existe en el documento hasta expandir.
    expect(screen.queryByText('alice@test.com')).not.toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
    expect(screen.queryByText('Estado')).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Alice' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('al expandir revela las demás columnas y la columna de acciones', async () => {
    stubMatchMedia(true);
    const user = userEvent.setup();
    render(
      <ResponsiveTable
        columns={[...DATA_COLUMNS, actionColumn(() => {})]}
        data={ROWS}
        keyExtractor={(row) => row.id}
      />,
    );

    expect(screen.queryByText('Suspender')).not.toBeInTheDocument();

    await user.click(screen.getByText('Alice'));

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suspender' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alice' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('tocar el header expande y no navega; "Ver detalle" sí navega', async () => {
    stubMatchMedia(true);
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <ResponsiveTable
        columns={[...DATA_COLUMNS, actionColumn(() => {})]}
        data={ROWS}
        keyExtractor={(row) => row.id}
        onRowClick={onRowClick}
      />,
    );

    // Colapsada: la acción de detalle todavía no existe.
    expect(screen.queryByRole('button', { name: 'Ver detalle' })).not.toBeInTheDocument();

    // El tap sobre el header expande, no debe navegar.
    await user.click(screen.getByText('Alice'));
    expect(onRowClick).not.toHaveBeenCalled();

    const detail = screen.getByRole('button', { name: 'Ver detalle' });
    await user.click(detail);

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(ROWS[0], 0);
  });

  it('sin nada que expandir renderiza una card estática (sin botón ni chevron)', () => {
    stubMatchMedia(true);
    render(
      <ResponsiveTable
        columns={[{ key: 'name', header: 'Nombre' }]}
        data={[ROWS[0]]}
        keyExtractor={(row) => row.id}
      />,
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    // Los labels desaparecen también en la card no expandible.
    expect(screen.queryByText('Nombre')).not.toBeInTheDocument();
    // Nada interactivo: ni botón de toggle ni chevron.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('ResponsiveTable — desktop', () => {
  it('renderiza la tabla con headers y valores', () => {
    stubMatchMedia(false);
    render(<ResponsiveTable columns={DATA_COLUMNS} data={ROWS} keyExtractor={(row) => row.id} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver detalle' })).not.toBeInTheDocument();
  });
});
