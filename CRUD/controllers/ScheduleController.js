import { getDB } from '../config/database.js';

class ScheduleController {
    constructor() {
        this.collection = 'schedule';
    }

    // Create
    async create(horario) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).insertOne(horario);
            return result;
        } catch (error) {
            console.error('Error al crear horario:', error);
            throw error;
        }
    }

    // Read
    async findAll() {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({}).toArray();
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).findOne({ id });
        } catch (error) {
            console.error('Error al obtener horario por ID:', error);
            throw error;
        }
    }

    async findByCurso(cursoId) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({ cursoId }).toArray();
        } catch (error) {
            console.error('Error al obtener horarios por curso:', error);
            throw error;
        }
    }

    async findByProfesor(profesorId) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({ profesorId }).toArray();
        } catch (error) {
            console.error('Error al obtener horarios por profesor:', error);
            throw error;
        }
    }

    // Update
    async update(id, horario) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).updateOne(
                { id },
                { $set: horario }
            );
            return result;
        } catch (error) {
            console.error('Error al actualizar horario:', error);
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
            console.error('Error al eliminar horario:', error);
            throw error;
        }
    }

    // Métodos adicionales
    async obtenerHorariosPorFecha(fechaInicio, fechaFin) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({
                fechaInicio: { $gte: fechaInicio },
                fechaFin: { $lte: fechaFin }
            }).toArray();
        } catch (error) {
            console.error('Error al obtener horarios por fecha:', error);
            throw error;
        }
    }

    async obtenerHorariosPorAula(aula) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({ aula }).toArray();
        } catch (error) {
            console.error('Error al obtener horarios por aula:', error);
            throw error;
        }
    }

    async verificarDisponibilidadAula(aula, dia, horaInicio, horaFin) {
        try {
            const db = await getDB();
            const horarioExistente = await db.collection(this.collection).findOne({
                aula,
                dia,
                $or: [
                    {
                        $and: [
                            { horaInicio: { $lte: horaInicio } },
                            { horaFin: { $gt: horaInicio } }
                        ]
                    },
                    {
                        $and: [
                            { horaInicio: { $lt: horaFin } },
                            { horaFin: { $gte: horaFin } }
                        ]
                    }
                ]
            });
            return !horarioExistente;
        } catch (error) {
            console.error('Error al verificar disponibilidad de aula:', error);
            throw error;
        }
    }
}

export default new ScheduleController(); 