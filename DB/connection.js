import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

class DatabaseConnection {
    static instance = null;
    client = null;
    db = null;
    isConnecting = false;
    connectionPromise = null;

    constructor() {}

    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    async getConnection() {
        if (this.db) {
            return this.db;
        }

        if (this.isConnecting) {
            return this.connectionPromise;
        }

        this.isConnecting = true;
        this.connectionPromise = this.connect();
        
        try {
            this.db = await this.connectionPromise;
            return this.db;
        } finally {
            this.isConnecting = false;
            this.connectionPromise = null;
        }
    }

    async connect() {
        try {
            if (!process.env.MONGODB_URI) {
                throw new Error('MONGODB_URI no está definida en las variables de entorno');
            }

            this.client = new MongoClient(process.env.MONGODB_URI);
            await this.client.connect();
            console.log('Conexión a MongoDB establecida');
            
            this.db = this.client.db();
            return this.db;
        } catch (error) {
            console.error('Error al conectar a MongoDB:', error);
            throw error;
        }
    }

    async close() {
        try {
            if (this.client) {
                await this.client.close();
                this.client = null;
                this.db = null;
                console.log('Conexión a MongoDB cerrada');
            }
        } catch (error) {
            console.error('Error al cerrar la conexión a MongoDB:', error);
            throw error;
        }
    }
}

// Exportar funciones de utilidad que usan el singleton
export async function connectDB() {
    return await DatabaseConnection.getInstance().getConnection();
}

export async function closeDB() {
    return await DatabaseConnection.getInstance().close();
}

// Exportar la instancia del singleton para casos especiales
export const dbConnection = DatabaseConnection.getInstance(); 