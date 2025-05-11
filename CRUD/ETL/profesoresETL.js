import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { connectDB, closeDB } from '../../DB/connection.js';
import { profesoresSchema } from '../../DB/validators/profesores.js';

const processProfesores = async () => {
    let db;
    try {
        db = await connectDB();
        const collection = db.collection('profesores');

        // Leer y procesar el CSV
        const records = [];
        const parser = createReadStream('./rawData/profesores.csv')
            .pipe(parse({
                columns: true,
                skip_empty_lines: true
            }));

        for await (const record of parser) {
            // Transformar los datos según el esquema
            const profesor = {
                id: record.id,
                tipoIdentificacion: record.tipoIdentificacion,
                numeroIdentificacion: record.numeroIdentificacion,
                primerNombre: record.primerNombre,
                segundoNombre: record.segundoNombre || '',
                primerApellido: record.primerApellido,
                segundoApellido: record.segundoApellido || '',
                edad: parseInt(record.edad),
                email: record.email,
                fechaRegistro: new Date(record.fechaRegistro),
                especialidad: record.especialidad,
                cursosAsignados: record.cursosAsignados ? record.cursosAsignados.split(',') : [],
                horarioDisponible: record.horarioDisponible ? JSON.parse(record.horarioDisponible) : []
            };

            // Validar según el esquema
            const validationErrors = validateProfesor(profesor);
            if (validationErrors.length > 0) {
                console.warn(`Advertencia: Profesor ${profesor.id} tiene errores de validación:`, validationErrors);
                continue;
            }

            records.push(profesor);
        }

        // Limpiar la colección existente
        await collection.deleteMany({});

        // Insertar los nuevos registros
        if (records.length > 0) {
            const result = await collection.insertMany(records);
            console.log(`${result.insertedCount} profesores insertados`);
            return {
                collection: 'profesores',
                documentsLoaded: result.insertedCount
            };
        }

        return {
            collection: 'profesores',
            documentsLoaded: 0
        };

    } catch (error) {
        console.error('Error en el proceso ETL de profesores:', error);
        throw error;
    } finally {
        await closeDB();
    }
};

const validateProfesor = (profesor) => {
    const errors = [];
    const schema = profesoresSchema;

    // Validar campos requeridos
    for (const [field, rules] of Object.entries(schema)) {
        if (rules.required && !profesor[field]) {
            errors.push(`El campo ${field} es requerido`);
        }
    }

    // Validar tipos de datos
    if (profesor.edad && (typeof profesor.edad !== 'number' || profesor.edad < 18 || profesor.edad > 100)) {
        errors.push('La edad debe ser un número entre 18 y 100');
    }

    if (profesor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profesor.email)) {
        errors.push('El email no tiene un formato válido');
    }

    // Validar horario disponible
    if (profesor.horarioDisponible) {
        for (const horario of profesor.horarioDisponible) {
            if (!horario.dia || !horario.horaInicio || !horario.horaFin) {
                errors.push('El horario debe tener día, hora de inicio y hora de fin');
                break;
            }
            if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario.horaInicio) || 
                !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario.horaFin)) {
                errors.push('El formato de hora debe ser HH:MM');
            }
        }
    }

    return errors;
};

export default processProfesores; 