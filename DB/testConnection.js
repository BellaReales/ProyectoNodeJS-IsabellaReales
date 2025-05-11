import { connectDB, closeDB } from './connection.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const testConnection = async () => {
    try {
        console.log('Verificando configuración...');
        console.log('MONGODB_URI está definida:', !!process.env.MONGODB_URI);
        
        console.log('\nIntentando conectar a MongoDB Atlas...');
        const db = await connectDB();
        
        // Intentar hacer una operación simple
        const collections = await db.listCollections().toArray();
        console.log('Conexión exitosa! Colecciones disponibles:', collections.map(c => c.name));
        
        await closeDB();
    } catch (error) {
        console.error('Error al conectar:', error);
        process.exit(1);
    }
};

// Ejecutar la prueba
testConnection(); 