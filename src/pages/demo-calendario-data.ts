export interface Teacher {
    id: number
    name: string
    department: string
    color: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
}

export interface AvailabilityBlock {
    id: number
    teacherId: number
    title: string
    start: Date
    end: Date
    allDay?: boolean
    type: 'available' | 'busy' | 'class' | 'office-hours'
    description?: string
    location?: string
    attendees?: string[]
}

// ─── Profesores mock ───────────────────────────────
export const teachers: Teacher[] = [
    { id: 1, name: 'Dr. Juan Gómez', department: 'Ingeniería', color: 'blue' },
    { id: 2, name: 'Dra. María López', department: 'Matemáticas', color: 'green' },
    { id: 3, name: 'Dr. Carlos Ruiz', department: 'Física', color: 'yellow' },
    { id: 4, name: 'Dra. Ana Martínez', department: 'Química', color: 'red' },
    { id: 5, name: 'Prof. Luis Hernández', department: 'Ingeniería', color: 'gray' },
]

// ─── Helper para crear fechas relativas ─────────────
function d(dayOffset: number, hour: number, minutes: number = 0): Date {
    const now = new Date()
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, minutes)
    return date
}


// ─── Bloques de disponibilidad mock ────────────────
export const initialBlocks: AvailabilityBlock[] = [
    // Dr. Juan Gómez — Ingeniería
    { id: 1,  teacherId: 1, title: 'Disponible para asesorías', start: d(0, 8, 0), end: d(0, 10, 0), type: 'available', description: 'Atención a estudiantes de semestres 1-4', location: 'Oficina 301, Edificio A' },
    { id: 2,  teacherId: 1, title: 'Clase: Programación I', start: d(0, 14, 0), end: d(0, 16, 0), type: 'class', description: 'Temas: estructuras de datos, arreglos', location: 'Aula 201, Edificio B' },
    { id: 3,  teacherId: 1, title: 'Reunión de departamento', start: d(1, 10, 0), end: d(1, 12, 0), type: 'busy', description: 'Revisión de plan de estudios', location: 'Sala de juntas', attendees: ['Dra. María', 'Dr. Carlos'] },
    { id: 4,  teacherId: 1, title: 'Oficina de atención', start: d(2, 8, 0), end: d(2, 12, 0), type: 'office-hours', description: 'Atención general a alumnos', location: 'Oficina 301' },
    { id: 5,  teacherId: 1, title: 'Clase: Programación II', start: d(2, 14, 0), end: d(2, 16, 0), type: 'class', description: 'Temas: programación orientada a objetos', location: 'Aula 201' },
    { id: 6,  teacherId: 1, title: 'Taller de laboratorio', start: d(3, 8, 0), end: d(3, 12, 0), type: 'class', description: 'Práctica de redes', location: 'Laboratorio 3', attendees: ['Grupo A', 'Grupo B'] },

    // Dra. María López — Matemáticas
    { id: 7,  teacherId: 2, title: 'Clase: Cálculo I', start: d(0, 7, 0), end: d(0, 9, 0), type: 'class', description: 'Derivadas parciales', location: 'Aula 102' },
    { id: 8,  teacherId: 2, title: 'Disponible', start: d(0, 10, 0), end: d(0, 12, 0), type: 'available', description: 'Asesorías de matemáticas', location: 'Oficina 205' },
    { id: 9,  teacherId: 2, title: 'Clase: Álgebra', start: d(1, 7, 0), end: d(1, 9, 0), type: 'class', description: 'Vectores y espacios', location: 'Aula 102' },
    { id: 10, teacherId: 2, title: 'Sesión de tutorías', start: d(1, 14, 0), end: d(1, 16, 0), type: 'office-hours', description: 'Apoyoacadémico', location: 'Biblioteca, Sala 3' },
    { id: 11, teacherId: 2, title: 'Reunión académica', start: d(3, 10, 0), end: d(3, 12, 0), type: 'busy', description: 'Evaluación del semestre', location: 'Sala de juntas' },

    // Dr. Carlos Ruiz — Física
    { id: 12, teacherId: 3, title: 'Clase: Física General', start: d(0, 9, 0), end: d(0, 11, 0), type: 'class', description: 'Mecánica newtoniana', location: 'Aula 301' },
    { id: 13, teacherId: 3, title: 'Laboratorio de Física', start: d(1, 8, 0), end: d(1, 12, 0), type: 'class', description: 'Experimentos de caída libre', location: 'Lab de Física' },
    { id: 14, teacherId: 3, title: 'Disponible para consultas', start: d(2, 10, 0), end: d(2, 12, 0), type: 'available', description: 'Consulta libre', location: 'Oficina 402' },
    { id: 15, teacherId: 3, title: 'Capacitación', start: d(4, 8, 0), end: d(4, 12, 0), type: 'busy', description: 'Uso de simuladores físicos', location: 'Sala de cómputo' },

    // Dra. Ana Martínez — Química
    { id: 16, teacherId: 4, title: 'Clase: Química Orgánica', start: d(0, 8, 0), end: d(0, 10, 0), type: 'class', description: 'Cadenas de carbono', location: 'Aula 105' },
    { id: 17, teacherId: 4, title: 'Laboratorio de Química', start: d(1, 8, 0), end: d(1, 12, 0), type: 'class', description: 'Práctica de titulación', location: 'Lab de Química', attendees: ['Grupo A'] },
    { id: 18, teacherId: 4, title: 'Oficina de atención', start: d(2, 14, 0), end: d(2, 16, 0), type: 'office-hours', description: 'Atención a alumnos', location: 'Oficina 208' },
    { id: 19, teacherId: 4, title: 'Junta de calificaciones', start: d(4, 10, 0), end: d(4, 12, 0), type: 'busy' },

    // Prof. Luis Hernández — Ingeniería
    { id: 20, teacherId: 5, title: 'Clase: Bases de Datos', start: d(0, 10, 0), end: d(0, 12, 0), type: 'class' },
    { id: 21, teacherId: 5, title: 'Disponible', start: d(1, 8, 0), end: d(1, 10, 0), type: 'available' },
    { id: 22, teacherId: 5, title: 'Proyecto de investigación', start: d(2, 8, 0), end: d(2, 12, 0), type: 'busy' },
    { id: 23, teacherId: 5, title: 'Clase: Redes', start: d(3, 10, 0), end: d(3, 12, 0), type: 'class' },
]

// ─── Tipo badge map ────────────────────────────────
export const TYPE_CONFIG: Record<AvailabilityBlock['type'], { label: string; color: string }> = {
    available:    { label: 'Disponible',  color: '#22c55e' },
    busy:         { label: 'Ocupado',     color: '#ef4444' },
    class:        { label: 'Clase',       color: '#3b82f6' },
    'office-hours': { label: 'Atención',  color: '#f59e0b' },
}
