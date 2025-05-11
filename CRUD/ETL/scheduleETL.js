import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { connectDB, closeDB } from '../../DB/connection.js';
import { scheduleSchema } from '../../DB/validators/schedule.js';

const processSchedule = async () => {
    let db;
    try {
        db = await connectDB();
        const collection = db.collection('schedule');

        // Leer y procesar el CSV
        const records = [];
        const parser = createReadStream('./rawData/schedule.csv')
            .pipe(parse({
                columns: true,
                skip_empty_lines: true
            }));

        for await (const record of parser) {
            // Transformar los datos según el esquema
            const schedule = {
                id: record.id,
                cursoId: record.cursoId,
                profesorId: record.profesorId,
                dia: record.dia,
                horaInicio: record.horaInicio,
                horaFin: record.horaFin,
                fechaInicio: new Date(record.fechaInicio),
                fechaFin: new Date(record.fechaFin),
                capacidadMaxima: parseInt(record.capacidadMaxima),
                estudiantesInscritos: record.estudiantesInscritos ? record.estudiantesInscritos.split(',') : []
            };

            // Validar según el esquema
            const validationErrors = validateSchedule(schedule);
            if (validationErrors.length > 0) {
                console.warn(`Advertencia: Horario ${schedule.id} tiene errores de validación:`, validationErrors);
                continue;
            }

            records.push(schedule);
        }

        // Limpiar la colección existente
        await collection.deleteMany({});

        // Insertar los nuevos registros
        if (records.length > 0) {
            const result = await collection.insertMany(records);
            console.log(`${result.insertedCount} horarios insertados`);
            return {
                collection: 'schedule',
                documentsLoaded: result.insertedCount
            };
        }

        return {
            collection: 'schedule',
            documentsLoaded: 0
        };

    } catch (error) {
        console.error('Error en el proceso ETL de horarios:', error);
        throw error;
    } finally {
        await closeDB();
    }
};

const validateSchedule = (schedule) => {
    const errors = [];
    const schema = scheduleSchema;

    // Validar campos requeridos
    for (const [field, rules] of Object.entries(schema)) {
        if (rules.required && !schedule[field]) {
            errors.push(`El campo ${field} es requerido`);
        }
    }

    // Validar formato de hora
    if (schedule.horaInicio && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(schedule.horaInicio)) {
        errors.push('El formato de hora de inicio debe ser HH:MM');
    }

    if (schedule.horaFin && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(schedule.horaFin)) {
        errors.push('El formato de hora de fin debe ser HH:MM');
    }

    // Validar que la hora de inicio sea anterior a la hora de fin
    if (schedule.horaInicio && schedule.horaFin) {
        const [horaInicio, minutoInicio] = schedule.horaInicio.split(':').map(Number);
        const [horaFin, minutoFin] = schedule.horaFin.split(':').map(Number);
        
        const tiempoInicio = horaInicio * 60 + minutoInicio;
        const tiempoFin = horaFin * 60 + minutoFin;
        
        if (tiempoInicio >= tiempoFin) {
            errors.push('La hora de inicio debe ser anterior a la hora de fin');
        }
    }

    // Validar fechas
    if (schedule.fechaInicio && schedule.fechaFin && schedule.fechaInicio > schedule.fechaFin) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Validar capacidad máxima
    if (schedule.capacidadMaxima && (typeof schedule.capacidadMaxima !== 'number' || schedule.capacidadMaxima < 1)) {
        errors.push('La capacidad máxima debe ser un número positivo');
    }

    // Validar día
    const diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    if (schedule.dia && !diasValidos.includes(schedule.dia.toLowerCase())) {
        errors.push('El día debe ser un día válido de la semana');
    }

    return errors;
};

export default processSchedule; 