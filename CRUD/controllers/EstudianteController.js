import { getDB } from '../config/database.js';

class EstudianteController {
    constructor() {
        this.collection = 'estudiantes';
    }

    // Create
    async create(estudiante) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).insertOne(estudiante);
            return result;
        } catch (error) {
            console.error('Error al crear estudiante:', error);
            throw error;
        }
    }

    // Read
    async findAll() {
        try {
            const db = await getDB();
            return await db.collection(this.collection).find({}).toArray();
        } catch (error) {
            console.error('Error al obtener estudiantes:', error);
            throw error;
        }
    }

    async findById(codigo) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).findOne({ codigo });
        } catch (error) {
            console.error('Error al obtener estudiante por código:', error);
            throw error;
        }
    }

    async findByNumeroIdentificacion(numeroIdentificacion) {
        try {
            const db = await getDB();
            return await db.collection(this.collection).findOne({ numeroIdentificacion });
        } catch (error) {
            console.error('Error al obtener estudiante por número de identificación:', error);
            throw error;
        }
    }

    // Update
    async update(codigo, estudiante) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).updateOne(
                { codigo },
                { $set: estudiante }
            );
            return result;
        } catch (error) {
            console.error('Error al actualizar estudiante:', error);
            throw error;
        }
    }

    // Delete
    async delete(codigo) {
        try {
            const db = await getDB();
            const result = await db.collection(this.collection).deleteOne({ codigo });
            return result;
        } catch (error) {
            console.error('Error al eliminar estudiante:', error);
            throw error;
        }
    }

    // Métodos adicionales para manejar notas
    async agregarNota(codigo, cursoId, nota, peso) {
        try {
            const db = await getDB();
            const estudiante = await this.findById(codigo);
            
            if (!estudiante) {
                throw new Error('Estudiante no encontrado');
            }

            const notas = estudiante.notas || {};
            notas[cursoId] = { nota, peso };

            // Calcular nuevo promedio general
            const cursos = Object.keys(notas);
            let sumaPonderada = 0;
            let sumaPesos = 0;

            cursos.forEach(curso => {
                sumaPonderada += notas[curso].nota * notas[curso].peso;
                sumaPesos += notas[curso].peso;
            });

            const promedioGeneral = sumaPonderada / sumaPesos;

            const result = await db.collection(this.collection).updateOne(
                { codigo },
                { 
                    $set: { 
                        notas,
                        promedioGeneral,
                        cursos: [...new Set([...estudiante.cursos, cursoId])]
                    }
                }
            );
            return result;
        } catch (error) {
            console.error('Error al agregar nota:', error);
            throw error;
        }
    }

    async obtenerNotas(codigo) {
        try {
            const estudiante = await this.findById(codigo);
            if (!estudiante) {
                throw new Error('Estudiante no encontrado');
            }
            return estudiante.notas || {};
        } catch (error) {
            console.error('Error al obtener notas:', error);
            throw error;
        }
    }
}

export default new EstudianteController(); 