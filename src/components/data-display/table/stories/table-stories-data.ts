/**
 * Deterministic fixture dataset shared by DataTable and ExcelTable stories.
 * Pre-refactor behavioral baseline for phase 2.5 — do not randomize.
 */

export interface EmployeeRow {
  id: number;
  name: string;
  department: string;
  salary: number;
  active: boolean;
}

export const DEPARTMENTS = ['Tecnología', 'Diseño', 'Ventas', 'RRHH'] as const;

export const employeeRows: EmployeeRow[] = [
  { id: 1, name: 'Ana García', department: 'Tecnología', salary: 58000, active: true },
  { id: 2, name: 'Bruno Díaz', department: 'Diseño', salary: 47500, active: true },
  { id: 3, name: 'Carla Ruiz', department: 'Ventas', salary: 41000, active: false },
  { id: 4, name: 'Diego Fernández', department: 'Tecnología', salary: 63000, active: true },
  { id: 5, name: 'Elena Torres', department: 'RRHH', salary: 39000, active: true },
  { id: 6, name: 'Facundo Molina', department: 'Ventas', salary: 44500, active: false },
  { id: 7, name: 'Georgia López', department: 'Diseño', salary: 50200, active: true },
  { id: 8, name: 'Hugo Castro', department: 'Tecnología', salary: 71000, active: true },
  { id: 9, name: 'Ivana Peralta', department: 'RRHH', salary: 36800, active: false },
  { id: 10, name: 'Joaquín Herrera', department: 'Ventas', salary: 48900, active: true },
  { id: 11, name: 'Karina Suárez', department: 'Diseño', salary: 55600, active: true },
  { id: 12, name: 'Luciano Vega', department: 'Tecnología', salary: 62400, active: false },
  { id: 13, name: 'Marina Ojeda', department: 'RRHH', salary: 42300, active: true },
  { id: 14, name: 'Nicolás Bravo', department: 'Ventas', salary: 39750, active: true },
  { id: 15, name: 'Olga Miranda', department: 'Tecnología', salary: 68200, active: true },
];
