import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { connectDB, closeDB } from '../../DB/connection.js';
import { cursosSchema } from '../../DB/validators/cursos.js';

const processCursos = async () => {
    let db;
    try {
        db = await connectDB();
        const collection = db.collection('cursos');

        // Leer y procesar el CSV
        const records = [];
        const parser = createReadStream('./rawData/cursos.csv')
            .pipe(parse({
                columns: true,
                skip_empty_lines: true
            }));

        for await (const record of parser) {
            // Transformar los datos según el esquema
            const curso = {
                id: record.id,
                nombre: record.nombre,
                descripcion: record.descripcion,
                duracion: parseInt(record.duracion),
                nivel: record.nivel,
                profesorId: record.profesorId,
                fechaInicio: new Date(record.fechaInicio),
                fechaFin: new Date(record.fechaFin),
                capacidadMaxima: parseInt(record.capacidadMaxima),
                estudiantesInscritos: record.estudiantesInscritos ? record.estudiantesInscritos.split(',') : [],
                estado: record.estado,
                horario: record.horario ? JSON.parse(record.horario) : []
            };

            // Validar según el esquema
            const validationErrors = validateCurso(curso);
            if (validationErrors.length > 0) {
                console.warn(`Advertencia: Curso ${curso.id} tiene errores de validación:`, validationErrors);
                continue;
            }

            records.push(curso);
        }

        // Limpiar la colección existente
        await collection.deleteMany({});

        // Insertar los nuevos registros
        if (records.length > 0) {
            const result = await collection.insertMany(records);
            console.log(`${result.insertedCount} cursos insertados`);
            return {
                collection: 'cursos',
                documentsLoaded: result.insertedCount
            };
        }

        return {
            collection: 'cursos',
            documentsLoaded: 0
        };

    } catch (error) {
        console.error('Error en el proceso ETL de cursos:', error);
        throw error;
    } finally {
        await closeDB();
    }
};

const validateCurso = (curso) => {
    const errors = [];
    const schema = cursosSchema;

    // Validar campos requeridos
    for (const [field, rules] of Object.entries(schema)) {
        if (rules.required && !curso[field]) {
            errors.push(`El campo ${field} es requerido`);
        }
    }

    // Validar tipos de datos
    if (curso.duracion && (typeof curso.duracion !== 'number' || curso.duracion < 1)) {
        errors.push('La duración debe ser un número positivo');
    }

    if (curso.capacidadMaxima && (typeof curso.capacidadMaxima !== 'number' || curso.capacidadMaxima < 1)) {
        errors.push('La capacidad máxima debe ser un número positivo');
    }

    // Validar fechas
    if (curso.fechaInicio && curso.fechaFin && curso.fechaInicio > curso.fechaFin) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Validar nivel
    const nivelesValidos = ['básico', 'intermedio', 'avanzado'];
    if (curso.nivel && !nivelesValidos.includes(curso.nivel.toLowerCase())) {
        errors.push('El nivel debe ser básico, intermedio o avanzado');
    }

    // Validar estado
    const estadosValidos = ['activo', 'inactivo', 'completado', 'cancelado'];
    if (curso.estado && !estadosValidos.includes(curso.estado.toLowerCase())) {
        errors.push('El estado debe ser activo, inactivo, completado o cancelado');
    }

    // Validar horario
    if (curso.horario) {
        for (const horario of curso.horario) {
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

export default processCursos; 