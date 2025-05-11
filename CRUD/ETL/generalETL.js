import processEstudiantes from './estudiantesETL.js';
import processProfesores from './profesoresETL.js';
import processCursos from './cursosETL.js';
import processSchedule from './scheduleETL.js';
import { connectDB, closeDB } from '../../DB/connection.js';

const createIndexes = async (db) => {
    try {
        // Eliminar índices existentes
        await db.collection('estudiantes').dropIndexes();
        await db.collection('profesores').dropIndexes();
        await db.collection('cursos').dropIndexes();
        await db.collection('schedule').dropIndexes();
        
        // Índices para estudiantes
        await db.collection('estudiantes').createIndex({ id: 1 }, { unique: true });
        await db.collection('estudiantes').createIndex({ email: 1 }, { unique: true, sparse: true });
        await db.collection('estudiantes').createIndex({ numeroIdentificacion: 1 }, { unique: true, sparse: true });
        
        // Índices para profesores
        await db.collection('profesores').createIndex({ id: 1 }, { unique: true });
        await db.collection('profesores').createIndex({ email: 1 }, { unique: true, sparse: true });
        await db.collection('profesores').createIndex({ numeroIdentificacion: 1 }, { unique: true, sparse: true });
        
        // Índices para cursos
        await db.collection('cursos').createIndex({ id: 1 }, { unique: true });
        await db.collection('cursos').createIndex({ profesorId: 1 });
        
        // Índices para horarios
        await db.collection('schedule').createIndex({ id: 1 }, { unique: true });
        await db.collection('schedule').createIndex({ cursoId: 1 });
        await db.collection('schedule').createIndex({ profesorId: 1 });
        
        console.log('Índices creados exitosamente');
    } catch (error) {
        console.error('Error al crear índices:', error);
        throw error;
    }
};

const createRoles = async (db) => {
    try {
        // Crear roles
        await db.command({
            createRole: "admin",
            privileges: [
                { resource: { db: "acme_school", collection: "" }, actions: ["find", "update", "insert", "remove"] }
            ],
            roles: []
        });

        await db.command({
            createRole: "profesor",
            privileges: [
                { resource: { db: "acme_school", collection: "cursos" }, actions: ["find"] },
                { resource: { db: "acme_school", collection: "estudiantes" }, actions: ["find"] }
            ],
            roles: []
        });

        await db.command({
            createRole: "estudiante",
            privileges: [
                { resource: { db: "acme_school", collection: "cursos" }, actions: ["find"] }
            ],
            roles: []
        });

        console.log('Roles creados exitosamente');
    } catch (error) {
        console.error('Error al crear roles:', error);
        throw error;
    }
};

const createAdminUser = async (db) => {
    try {
        await db.command({
            createUser: "admin",
            pwd: "admin123",
            roles: [
                { role: "admin", db: "acme_school" }
            ]
        });
        console.log('Usuario administrador creado exitosamente');
    } catch (error) {
        console.error('Error al crear usuario administrador:', error);
        throw error;
    }
};

const runAllETL = async () => {
    console.log('Iniciando proceso ETL general...');
    let db;
    
    try {
        // Conectar a la base de datos
        db = await connectDB();
        
        // Crear índices
        console.log('\nCreando índices...');
        await createIndexes(db);
        
        // Crear roles
        console.log('\nCreando roles...');
        await createRoles(db);
        
        // Crear usuario administrador
        console.log('\nCreando usuario administrador...');
        await createAdminUser(db);
        
        // Ejecutar los procesos en secuencia
        console.log('\nProcesando profesores...');
        await processProfesores();
        
        console.log('\nProcesando cursos...');
        await processCursos();
        
        console.log('\nProcesando estudiantes...');
        await processEstudiantes();
        
        console.log('\nProcesando horarios...');
        await processSchedule();
        
        console.log('\n¡Proceso ETL general completado exitosamente!');
    } catch (error) {
        console.error('Error en el proceso ETL general:', error);
        process.exit(1);
    } finally {
        // Cerrar la conexión a la base de datos
        await closeDB();
    }
};

// Ejecutar el proceso ETL general
runAllETL(); 