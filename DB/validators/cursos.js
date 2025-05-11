export const cursosSchema = {
    id: { type: 'string', required: true, unique: true },
    nombre: { type: 'string', required: true },
    profesorId: { type: 'string', required: true },
    descripcion: { type: 'string', required: true },
    duracion: { type: 'string', required: true },
    nivel: { type: 'string', required: true, enum: ['Básico', 'Intermedio', 'Avanzado'] },
    fechaInicio: { type: 'date', required: true },
    fechaFin: { type: 'date', required: true },
    intensidad: { type: 'number', required: true, min: 1 }, // horas por semana
    contenidoTematico: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                unidad: { type: 'string', required: true },
                temas: { type: 'array', items: { type: 'string' }, required: true },
                duracion: { type: 'number', required: true } // en horas
            }
        }
    },
    estudiantesInscritos: { type: 'array', items: { type: 'string' } }
};

export const cursosDatos = [
    {
        id: "CUR001",
        nombre: "Matemáticas Avanzadas",
        profesorId: "PROF001",
        descripcion: "Curso de matemáticas para nivel avanzado",
        duracion: "6 meses",
        nivel: "Avanzado",
        fechaInicio: new Date("2024-01-15"),
        fechaFin: new Date("2024-07-15"),
        intensidad: 6,
        contenidoTematico: [
            {
                unidad: "Cálculo Diferencial",
                temas: [
                    "Límites y continuidad",
                    "Derivadas",
                    "Aplicaciones de la derivada"
                ],
                duracion: 48
            },
            {
                unidad: "Cálculo Integral",
                temas: [
                    "Integrales indefinidas",
                    "Integrales definidas",
                    "Aplicaciones de la integral"
                ],
                duracion: 48
            }
        ],
        estudiantesInscritos: ["EST001", "EST003"]
    },
    {
        id: "CUR002",
        nombre: "Literatura Contemporánea",
        profesorId: "PROF002",
        descripcion: "Estudio de la literatura moderna",
        duracion: "4 meses",
        nivel: "Intermedio"
    },
    {
        id: "CUR003",
        nombre: "Física Cuántica",
        profesorId: "PROF003",
        descripcion: "Introducción a la física cuántica",
        duracion: "8 meses",
        nivel: "Avanzado"
    },
    {
        id: "CUR004",
        nombre: "Historia Universal",
        profesorId: "PROF004",
        descripcion: "Panorama general de la historia mundial",
        duracion: "5 meses",
        nivel: "Intermedio"
    }
]; 