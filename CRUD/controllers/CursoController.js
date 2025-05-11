import { getDB } from '../config/database.js';

class CursoController {
    constructor() {
        this.collection = 'cursos';
    }

    // Create
    async create(curso) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).insertOne(curso);
            return result;
        } catch (error) {
            console.error('Error al crear curso:', error);
            throw error;
        }
    }

    // Read
    async findAll() {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({}).toArray();
        } catch (error) {
            console.error('Error al obtener cursos:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).findOne({ id });
        } catch (error) {
            console.error('Error al obtener curso por ID:', error);
            throw error;
        }
    }

    async findByProfesor(profesorId) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({ profesorId }).toArray();
        } catch (error) {
            console.error('Error al obtener cursos por profesor:', error);
            throw error;
        }
    }

    async findByNivel(nivel) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({ nivel }).toArray();
        } catch (error) {
            console.error('Error al obtener cursos por nivel:', error);
            throw error;
        }
    }

    // Update
    async update(id, curso) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).updateOne(
                { id },
                { $set: curso }
            );
            return result;
        } catch (error) {
            console.error('Error al actualizar curso:', error);
            throw error;
        }
    }

    // Delete
    async delete(id) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).deleteOne({ id });
            return result;
        } catch (error) {
            console.error('Error al eliminar curso:', error);
            throw error;
        }
    }

    // Métodos adicionales
    async obtenerContenidoTematico(id) {
        try {
            const curso = await this.findById(id);
            if (!curso) {
                throw new Error('Curso no encontrado');
            }
            return curso.contenidoTematico || [];
        } catch (error) {
            console.error('Error al obtener contenido temático:', error);
            throw error;
        }
    }

    async actualizarContenidoTematico(id, contenidoTematico) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).updateOne(
                { id },
                { $set: { contenidoTematico } }
            );
            return result;
        } catch (error) {
            console.error('Error al actualizar contenido temático:', error);
            throw error;
        }
    }

    async obtenerCursosPorFecha(fechaInicio, fechaFin) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({
                fechaInicio: { $gte: fechaInicio },
                fechaFin: { $lte: fechaFin }
            }).toArray();
        } catch (error) {
            console.error('Error al obtener cursos por fecha:', error);
            throw error;
        }
    }
}

export default new CursoController(); 