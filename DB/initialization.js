import { connectDB, closeDB } from './connection.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function limpiarColecciones(db) {
    try {
        const collections = ['estudiantes', 'profesores', 'cursos', 'schedule'];
        for (const collection of collections) {
            await db.collection(collection).deleteMany({});
            console.log(`Colección ${collection} limpiada`);
        }
    } catch (error) {
        console.error('Error al limpiar colecciones:', error);
        throw error;
    }
}

async function cargarDatosDesdeCSV(db, nombreArchivo, collectionName) {
    try {
        const filePath = path.join(__dirname, 'rawData', nombreArchivo);
        console.log(`Intentando leer archivo: ${filePath}`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        
        return new Promise((resolve, reject) => {
            parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                relax_quotes: true,
                skip_records_with_error: true
            }, async (error, records) => {
                if (error) {
                    console.warn(`Advertencia al parsear ${nombreArchivo}: ${error.message}`);
                    if (!records || records.length === 0) {
                        reject(error);
                        return;
                    }
                }

                try {
                    let filteredRecords = records;
                    let ignored = 0;
                    if (["estudiantes", "profesores", "cursos", "schedule"].includes(collectionName)) {
                        if (collectionName === "estudiantes") {
                            filteredRecords = records.filter(r => r.codigo && r.codigo !== '' && r.codigo !== null);
                            filteredRecords = filteredRecords.map(r => ({
                                ...r,
                                id: r.codigo
                            }));
                        } else {
                            filteredRecords = records.filter(r => r.id && r.id !== '' && r.id !== null);
                        }
                        ignored = records.length - filteredRecords.length;
                    }
                    if (ignored > 0) {
                        console.log(`${ignored} registros ignorados en ${collectionName} por no tener id válido.`);
                    }
                    if (filteredRecords.length > 0) {
                        await db.collection(collectionName).insertMany(filteredRecords);
                        console.log(`${filteredRecords.length} registros cargados en ${collectionName}`);
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error(`Error al cargar datos desde ${nombreArchivo}:`, error);
        throw error;
    }
}

async function crearIndices(db) {
    try {
        // Eliminar todos los índices excepto el índice por defecto _id
        const collections = ['estudiantes', 'profesores', 'cursos', 'schedule'];
        for (const name of collections) {
            const collection = db.collection(name);
            const indexes = await collection.indexes();
            for (const idx of indexes) {
                if (idx.name !== '_id_') {
                    await collection.dropIndex(idx.name).catch(() => {}); // Ignorar error si no existe
                }
            }
        }

        // Crear índices para estudiantes
        await db.collection('estudiantes').createIndex({ codigo: 1 }, { unique: true });
        await db.collection('estudiantes').createIndex({ email: 1 }, { unique: true });
        
        // Crear índices para profesores
        await db.collection('profesores').createIndex({ id: 1 }, { unique: true });
        await db.collection('profesores').createIndex({ email: 1 }, { unique: true });
        
        // Crear índices para cursos
        await db.collection('cursos').createIndex({ id: 1 }, { unique: true });
        await db.collection('cursos').createIndex({ profesorId: 1 });
        
        // Crear índices para horarios
        await db.collection('schedule').createIndex({ id: 1 }, { unique: true });
        await db.collection('schedule').createIndex({ cursoId: 1 });
        await db.collection('schedule').createIndex({ profesorId: 1 });
        
        console.log('Índices creados exitosamente');
    } catch (error) {
        console.error('Error al crear índices:', error);
        throw error;
    }
}

async function inicializarDB() {
    let db;
    try {
        db = await connectDB();
        
        // Crear colecciones si no existen
        const collections = ['estudiantes', 'profesores', 'cursos', 'schedule'];
        for (const collectionName of collections) {
            await db.createCollection(collectionName);
            console.log(`Colección ${collectionName} creada exitosamente`);
        }

        // Crear índices
        await crearIndices(db);
        
        // Limpiar colecciones existentes
        await limpiarColecciones(db);
        
        // Cargar datos desde CSV
        await cargarDatosDesdeCSV(db, 'estudiantes.csv', 'estudiantes');
        await cargarDatosDesdeCSV(db, 'profesores.csv', 'profesores');
        await cargarDatosDesdeCSV(db, 'cursos.csv', 'cursos');
        await cargarDatosDesdeCSV(db, 'schedule.csv', 'schedule');
        
        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error durante la inicialización de la base de datos:', error);
        throw error;
    } finally {
        await closeDB();
    }
}

// Ejecutar la inicialización
inicializarDB().catch(console.error); 