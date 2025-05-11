export const estudiantesSchema = {
    id: { type: 'string', required: true, unique: true },
    tipoIdentificacion: { type: 'string', required: true, enum: ['CC', 'TI', 'CE'] },
    numeroIdentificacion: { type: 'string', required: true, unique: true },
    primerNombre: { type: 'string', required: true },
    segundoNombre: { type: 'string' },
    primerApellido: { type: 'string', required: true },
    segundoApellido: { type: 'string' },
    edad: { type: 'number', required: true, min: 16, max: 100 },
    email: { type: 'string', required: true, unique: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    fechaRegistro: { type: 'date', required: true },
    cursos: { type: 'array', items: { type: 'string' } },
    notas: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                cursoId: { type: 'string', required: true },
                nombreCurso: { type: 'string', required: true },
                fechaInicio: { type: 'date', required: true },
                fechaFin: { type: 'date', required: true },
                peso: { type: 'number', required: true, min: 0, max: 1 },
                notaFinal: { type: 'number', required: true, min: 0, max: 10 }
            }
        }
    },
    promedioGeneral: { type: 'number', min: 0, max: 10 }
};

export const estudiantesDatos = [
    {
        id: "EST001",
        tipoIdentificacion: "CC",
        numeroIdentificacion: "1234567890",
        primerNombre: "Luis",
        segundoNombre: "Carlos",
        primerApellido: "Hernández",
        segundoApellido: "Gómez",
        edad: 20,
        email: "luis.hernandez@estudiante.com",
        fechaRegistro: new Date("2024-01-15"),
        cursos: ["CUR001", "CUR003"],
        notas: [
            {
                cursoId: "CUR001",
                nombreCurso: "Matemáticas Avanzadas",
                fechaInicio: new Date("2024-01-15"),
                fechaFin: new Date("2024-07-15"),
                peso: 0.6,
                notaFinal: 8.5
            },
            {
                cursoId: "CUR003",
                nombreCurso: "Física Cuántica",
                fechaInicio: new Date("2024-01-15"),
                fechaFin: new Date("2024-09-15"),
                peso: 0.4,
                notaFinal: 8.3
            }
        ],
        promedioGeneral: 8.4
    },
    {
        id: "EST002",
        nombre: "Laura Sánchez",
        edad: 19,
        email: "laura.sanchez@estudiante.com",
        cursos: ["CUR002", "CUR004"],
        notas: [
            {
                cursoId: "CUR002",
                nombreCurso: "Literatura Contemporánea",
                notaFinal: 9.0
            },
            {
                cursoId: "CUR004",
                nombreCurso: "Historia Universal",
                notaFinal: 9.0
            }
        ],
        promedioGeneral: 9.0
    },
    {
        id: "EST003",
        nombre: "Pedro Gómez",
        edad: 21,
        email: "pedro.gomez@estudiante.com",
        cursos: ["CUR001", "CUR002"],
        notas: [
            {
                cursoId: "CUR001",
                nombreCurso: "Matemáticas Avanzadas",
                notaFinal: 8.8
            },
            {
                cursoId: "CUR002",
                nombreCurso: "Literatura Contemporánea",
                notaFinal: 8.8
            }
        ],
        promedioGeneral: 8.8
    },
    {
        id: "EST004",
        nombre: "Sofía Torres",
        edad: 20,
        email: "sofia.torres@estudiante.com",
        cursos: ["CUR003", "CUR004"],
        notas: [
            {
                cursoId: "CUR003",
                nombreCurso: "Física Cuántica",
                notaFinal: 9.2
            },
            {
                cursoId: "CUR004",
                nombreCurso: "Historia Universal",
                notaFinal: 9.2
            }
        ],
        promedioGeneral: 9.2
    }
]; 