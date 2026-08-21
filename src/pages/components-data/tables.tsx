import Badge from '../../components/ui/Badge'
import type { Column } from '../../components/ui/Table/types'

// --- Tipos ---
export interface SampleUser {
    id: number
    name: string
    email: string
    role: string
    status: string
}

export interface SpreadsheetRow {
    concepto: string
    cantidad: string
    precio: string
    total: string
}

export interface Employee {
    name: string
    department: string
    position: string
    city: string
    status: string
}

// --- Datos ---
export const sampleUsers: SampleUser[] = [
    { id: 1,  name: 'Alejandro García',  email: 'alejandro@semilla.mx',   role: 'Admin',  status: 'Activo' },
    { id: 2,  name: 'María López',       email: 'maria@semilla.mx',       role: 'Editor', status: 'Activo' },
    { id: 3,  name: 'Carlos Ruiz',       email: 'carlos@semilla.mx',      role: 'Viewer', status: 'Inactivo' },
    { id: 4,  name: 'Ana Martínez',      email: 'ana@semilla.mx',         role: 'Editor', status: 'Activo' },
    { id: 5,  name: 'Luis Hernández',    email: 'luis@semilla.mx',        role: 'Admin',  status: 'Activo' },
    { id: 6,  name: 'Sofía Torres',      email: 'sofia@semilla.mx',       role: 'Editor', status: 'Activo' },
    { id: 7,  name: 'Diego Ramírez',     email: 'diego@semilla.mx',       role: 'Viewer', status: 'Activo' },
    { id: 8,  name: 'Camila Vargas',     email: 'camila@semilla.mx',      role: 'Editor', status: 'Inactivo' },
    { id: 9,  name: 'Jorge Méndez',      email: 'jorge@semilla.mx',       role: 'Viewer', status: 'Activo' },
    { id: 10, name: 'Valentina Cruz',    email: 'valentina@semilla.mx',   role: 'Admin',  status: 'Activo' },
    { id: 11, name: 'Andrés Molina',     email: 'andres@semilla.mx',      role: 'Editor', status: 'Activo' },
    { id: 12, name: 'Paula Castillo',    email: 'paula@semilla.mx',       role: 'Viewer', status: 'Activo' },
    { id: 13, name: 'Fernando Reyes',    email: 'fernando@semilla.mx',    role: 'Admin',  status: 'Inactivo' },
    { id: 14, name: 'Isabela Navarro',   email: 'isabela@semilla.mx',     role: 'Editor', status: 'Activo' },
    { id: 15, name: 'Mateo Duarte',      email: 'mateo@semilla.mx',       role: 'Viewer', status: 'Activo' },
    { id: 16, name: 'Luciana Silva',     email: 'luciana@semilla.mx',     role: 'Editor', status: 'Activo' },
    { id: 17, name: 'Ricardo Paredes',   email: 'ricardo@semilla.mx',     role: 'Admin',  status: 'Activo' },
    { id: 18, name: 'Gabriela Luna',     email: 'gabriela@semilla.mx',    role: 'Viewer', status: 'Inactivo' },
    { id: 19, name: 'Tomás Aguilar',     email: 'tomas@semilla.mx',       role: 'Editor', status: 'Activo' },
    { id: 20, name: 'Mariana Flores',    email: 'mariana@semilla.mx',     role: 'Viewer', status: 'Activo' },
]

export const initialSpreadsheet: SpreadsheetRow[] = [
    { concepto: 'Licencia software',   cantidad: '2',  precio: '150.00', total: '300.00' },
    { concepto: 'Soporte anual',       cantidad: '1',  precio: '480.00', total: '480.00' },
    { concepto: 'Capacitación',        cantidad: '3',  precio: '120.00', total: '360.00' },
    { concepto: 'Consultoría',         cantidad: '10', precio: '85.00',  total: '850.00' },
    { concepto: 'Hosting premium',     cantidad: '1',  precio: '299.00', total: '299.00' },
    { concepto: 'Dominio .com',        cantidad: '5',  precio: '18.00',  total: '90.00' },
    { concepto: 'Certificado SSL',     cantidad: '3',  precio: '45.00',  total: '135.00' },
    { concepto: 'Diseño UI/UX',        cantidad: '1',  precio: '2500.00', total: '2500.00' },
    { concepto: 'Desarrollo frontend', cantidad: '1',  precio: '8500.00', total: '8500.00' },
    { concepto: 'Desarrollo backend',  cantidad: '1',  precio: '7200.00', total: '7200.00' },
    { concepto: 'Base de datos',       cantidad: '2',  precio: '350.00', total: '700.00' },
    { concepto: 'API externa',         cantidad: '1',  precio: '120.00', total: '120.00' },
    { concepto: 'Testing QA',          cantidad: '40', precio: '35.00',  total: '1400.00' },
    { concepto: 'Deploy CI/CD',        cantidad: '1',  precio: '200.00', total: '200.00' },
    { concepto: 'Monitoreo 24/7',      cantidad: '1',  precio: '180.00', total: '180.00' },
]

export const employees: Employee[] = [
    { name: 'Alejandro García',  department: 'Tecnología', position: 'Dev Senior',    city: 'CDMX',      status: 'Activo' },
    { name: 'María López',       department: 'Diseño',     position: 'UI Designer',   city: 'Guadalajara', status: 'Activo' },
    { name: 'Carlos Ruiz',       department: 'Tecnología', position: 'Dev Junior',    city: 'CDMX',      status: 'Inactivo' },
    { name: 'Ana Martínez',      department: 'Marketing',  position: 'Content Lead',  city: 'Monterrey',  status: 'Activo' },
    { name: 'Luis Hernández',    department: 'Tecnología', position: 'DevOps',        city: 'CDMX',      status: 'Activo' },
    { name: 'Sofía Torres',      department: 'Diseño',     position: 'UX Researcher', city: 'Guadalajara', status: 'Activo' },
    { name: 'Diego Ramírez',     department: 'Tecnología', position: 'Dev Full Stack',city: 'CDMX',      status: 'Activo' },
    { name: 'Camila Vargas',     department: 'Marketing',  position: 'SEO Specialist',city: 'Monterrey',  status: 'Activo' },
    { name: 'Jorge Méndez',      department: 'Diseño',     position: 'Motion Design', city: 'CDMX',      status: 'Inactivo' },
    { name: 'Valentina Cruz',    department: 'Tecnología', position: 'QA Engineer',   city: 'Guadalajara', status: 'Activo' },
    { name: 'Andrés Molina',     department: 'Marketing',  position: 'Copywriter',   city: 'CDMX',      status: 'Activo' },
    { name: 'Paula Castillo',    department: 'Diseño',     position: 'Brand Design', city: 'Monterrey',  status: 'Activo' },
    { name: 'Fernando Reyes',    department: 'Tecnología', position: 'Dev Backend',   city: 'CDMX',      status: 'Activo' },
    { name: 'Isabela Navarro',   department: 'Marketing',  position: 'Social Media', city: 'Guadalajara', status: 'Inactivo' },
    { name: 'Mateo Duarte',      department: 'Tecnología', position: 'Dev Frontend',  city: 'CDMX',      status: 'Activo' },
    { name: 'Luciana Silva',     department: 'Diseño',     position: 'UI Designer',   city: 'Monterrey',  status: 'Activo' },
    { name: 'Ricardo Paredes',   department: 'Tecnología', position: 'Architect',     city: 'CDMX',      status: 'Activo' },
    { name: 'Gabriela Luna',     department: 'Marketing',  position: 'Analytics',     city: 'Guadalajara', status: 'Activo' },
    { name: 'Tomás Aguilar',     department: 'Tecnología', position: 'DevOps',        city: 'CDMX',      status: 'Inactivo' },
    { name: 'Mariana Flores',    department: 'Diseño',     position: 'UX Lead',       city: 'Monterrey',  status: 'Activo' },
]

// --- Columnas ---
export const userColumns: Column<SampleUser>[] = [
    { key: 'name',   header: 'Nombre',  minWidth: '180px' },
    { key: 'email',  header: 'Email',   minWidth: '220px' },
    { key: 'role',   header: 'Rol',     align: 'center',
      render: (value) => {
          const variant = value === 'Admin' ? 'success' : value === 'Editor' ? 'info' : 'default'
          return <Badge variant={variant}>{String(value)}</Badge>
      },
    },
    { key: 'status', header: 'Estado',  align: 'center',
      render: (value) => {
          const variant = value === 'Activo' ? 'success' : 'warning'
          return <Badge variant={variant}>{String(value)}</Badge>
      },
    },
]

export const spreadsheetColumns: Column<SpreadsheetRow>[] = [
    { key: 'concepto', header: 'Concepto', minWidth: '200px' },
    { key: 'cantidad', header: 'Cantidad', width: '100px', align: 'right' },
    { key: 'precio',   header: 'Precio',   width: '120px', align: 'right' },
    { key: 'total',    header: 'Total',    width: '120px', align: 'right' },
]

export const employeeColumns: Column<Employee>[] = [
    { key: 'name',       header: 'Nombre',     minWidth: '180px' },
    { key: 'department', header: 'Departamento', minWidth: '140px', align: 'center' },
    { key: 'position',   header: 'Posición',    minWidth: '140px' },
    { key: 'city',       header: 'Ciudad',      minWidth: '120px', align: 'center' },
    { key: 'status',     header: 'Estado',      width: '100px',   align: 'center',
      render: (value) => {
          const variant = value === 'Activo' ? 'success' : 'warning'
          return <Badge variant={variant}>{String(value)}</Badge>
      },
    },
]
