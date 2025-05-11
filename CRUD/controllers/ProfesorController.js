import { getDB } from '../config/database.js';

class ProfesorController {
    constructor() {
        this.collection = 'profesores';
    }

    // Create
    async create(profesor) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).insertOne(profesor);
            return result;
        } catch (error) {
            console.error('Error al crear profesor:', error);
            throw error;
        }
    }

    // Read
    async findAll() {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({}).toArray();
        } catch (error) {
            console.error('Error al obtener profesores:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).findOne({ id });
        } catch (error) {
            console.error('Error al obtener profesor por ID:', error);
            throw error;
        }
    }

    async findByEspecialidad(especialidad) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({ especialidad }).toArray();
        } catch (error) {
            console.error('Error al obtener profesores por especialidad:', error);
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).findOne({ email });
        } catch (error) {
            console.error('Error al obtener profesor por email:', error);
            throw error;
        }
    }

    // Update
    async update(id, profesor) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).updateOne(
                { id },
                { $set: profesor }
            );
            return result;
        } catch (error) {
            console.error('Error al actualizar profesor:', error);
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
            console.error('Error al eliminar profesor:', error);
            throw error;
        }
    }

    // Métodos adicionales
    async obtenerCursosAsignados(id) {
        try {
            const db = await getDB();
            const cursos = await db.collection('cursos').find({ profesorId: id }).toArray();
            return cursos;
        } catch (error) {
            console.error('Error al obtener cursos asignados:', error);
            throw error;
        }
    }

    async obtenerHorarios(id) {
        try {
            const db = await getDB();
            const horarios = await db.collection('schedule').find({ profesorId: id }).toArray();
            return horarios;
        } catch (error) {
            console.error('Error al obtener horarios del profesor:', error);
            throw error;
        }
    }

    async obtenerEstudiantes(id) {
        try {
            const db = await getDB();
            // Primero obtener los cursos del profesor
            const cursos = await db.collection('cursos').find({ profesorId: id }).toArray();
            const cursoIds = cursos.map(curso => curso.id);

            // Luego obtener los estudiantes que están en esos cursos
            const estudiantes = await db.collection('estudiantes').find({
                cursos: { $in: cursoIds }
            }).toArray();

            return estudiantes;
        } catch (error) {
            console.error('Error al obtener estudiantes del profesor:', error);
            throw error;
        }
    }

    async actualizarEspecialidad(id, especialidad) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).updateOne(
                { id },
                { $set: { especialidad } }
            );
            return result;
        } catch (error) {
            console.error('Error al actualizar especialidad:', error);
            throw error;
        }
    }
}

export default new ProfesorController(); 