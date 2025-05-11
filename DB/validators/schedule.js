export const scheduleSchema = {
    id: { type: 'string', required: true, unique: true },
    cursoId: { type: 'string', required: true },
    profesorId: { type: 'string', required: true },
    dia: { type: 'string', required: true, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
    horaInicio: { type: 'string', required: true, pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    horaFin: { type: 'string', required: true, pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    aula: { type: 'string', required: true },
    fechaInicio: { type: 'date', required: true },
    fechaFin: { type: 'date', required: true },
    capacidadMaxima: { type: 'number', required: true, min: 1 },
    estudiantesInscritos: { type: 'array', items: { type: 'string' } }
};

export const scheduleDatos = [
    {
        id: "HOR001",
        cursoId: "CUR001",
        profesorId: "PROF001",
        dia: "Lunes",
        horaInicio: "08:00",
        horaFin: "10:00",
        aula: "A101",
        fechaInicio: new Date("2024-01-15"),
        fechaFin: new Date("2024-07-15"),
        capacidadMaxima: 30,
        estudiantesInscritos: ["EST001", "EST003"]
    },
    {
        id: "HOR002",
        cursoId: "CUR002",
        profesorId: "PROF002",
        dia: "Martes",
        horaInicio: "10:00",
        horaFin: "12:00",
        aula: "B203"
    },
    {
        id: "HOR003",
        cursoId: "CUR003",
        profesorId: "PROF003",
        dia: "Miércoles",
        horaInicio: "14:00",
        horaFin: "16:00",
        aula: "C305"
    },
    {
        id: "HOR004",
        cursoId: "CUR004",
        profesorId: "PROF004",
        dia: "Jueves",
        horaInicio: "16:00",
        horaFin: "18:00",
        aula: "D407"
    }
]; 