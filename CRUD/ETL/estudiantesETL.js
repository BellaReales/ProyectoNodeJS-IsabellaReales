import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { connectDB, closeDB } from '../../DB/connection.js';
import { estudiantesSchema } from '../../DB/validators/estudiantes.js';

const processEstudiantes = async () => {
    let db;
    try {
        db = await connectDB();
        const collection = db.collection('estudiantes');

        // Leer y procesar el CSV
        const records = [];
        const parser = createReadStream('./rawData/estudiantes.csv')
            .pipe(parse({
                columns: true,
                skip_empty_lines: true
            }));

        for await (const record of parser) {
            // Transformar los datos según el esquema
            const estudiante = {
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
                cursos: record.cursos ? record.cursos.split(',') : [],
                notas: record.notas ? JSON.parse(record.notas) : [],
                promedioGeneral: parseFloat(record.promedioGeneral) || 0
            };

            // Validar según el esquema
            const validationErrors = validateEstudiante(estudiante);
            if (validationErrors.length > 0) {
                console.warn(`Advertencia: Estudiante ${estudiante.id} tiene errores de validación:`, validationErrors);
                continue;
            }

            records.push(estudiante);
        }

        // Limpiar la colección existente
        await collection.deleteMany({});

        // Insertar los nuevos registros
        if (records.length > 0) {
            const result = await collection.insertMany(records);
            console.log(`${result.insertedCount} estudiantes insertados`);
            return {
                collection: 'estudiantes',
                documentsLoaded: result.insertedCount
            };
        }

        return {
            collection: 'estudiantes',
            documentsLoaded: 0
        };

    } catch (error) {
        console.error('Error en el proceso ETL de estudiantes:', error);
        throw error;
    } finally {
        await closeDB();
    }
};

const validateEstudiante = (estudiante) => {
    const errors = [];
    const schema = estudiantesSchema;

    // Validar campos requeridos
    for (const [field, rules] of Object.entries(schema)) {
        if (rules.required && !estudiante[field]) {
            errors.push(`El campo ${field} es requerido`);
        }
    }

    // Validar tipos de datos
    if (estudiante.edad && (typeof estudiante.edad !== 'number' || estudiante.edad < 16 || estudiante.edad > 100)) {
        errors.push('La edad debe ser un número entre 16 y 100');
    }

    if (estudiante.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(estudiante.email)) {
        errors.push('El email no tiene un formato válido');
    }

    if (estudiante.promedioGeneral && (estudiante.promedioGeneral < 0 || estudiante.promedioGeneral > 10)) {
        errors.push('El promedio general debe estar entre 0 y 10');
    }

    // Validar notas
    if (estudiante.notas) {
        for (const nota of estudiante.notas) {
            if (!nota.cursoId || !nota.nombreCurso || !nota.fechaInicio || !nota.fechaFin || !nota.peso || !nota.notaFinal) {
                errors.push('Las notas deben tener todos los campos requeridos');
                break;
            }
            if (nota.peso < 0 || nota.peso > 1) {
                errors.push('El peso de la nota debe estar entre 0 y 1');
            }
            if (nota.notaFinal < 0 || nota.notaFinal > 10) {
                errors.push('La nota final debe estar entre 0 y 10');
            }
        }
    }

    return errors;
};

export default processEstudiantes; 