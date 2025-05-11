import { connectDB } from '../../DB/connection.js';
import fs from 'fs/promises';
import path from 'path';

class CursosPorProfesorReport {
    async generarReporte(profesorId) {
        try {
            const db = await connectDB();
            const profesor = await db.collection('profesores').findOne({ id: profesorId });
            
            if (!profesor) {
                throw new Error('Profesor no encontrado');
            }

            // Obtener cursos del profesor
            const cursos = await db.collection('cursos').find({ profesorId }).toArray();

            // Obtener información adicional de cada curso
            const cursosConDetalles = await Promise.all(cursos.map(async (curso) => {
                // Obtener horarios
                const horarios = await db.collection('schedule').find({ cursoId: curso.id }).toArray();
                
                // Obtener cantidad de estudiantes
                const estudiantes = await db.collection('estudiantes').countDocuments({
                    cursos: curso.id
                });

                return {
                    ...curso,
                    horarios,
                    cantidadEstudiantes: estudiantes
                };
            }));

            const html = this.generarHTML(profesor, cursosConDetalles);
            const fileName = `cursos_profesor_${profesorId}.html`;
            await this.guardarReporte(html, fileName);
            return fileName;
        } catch (error) {
            console.error('Error al generar reporte de cursos por profesor:', error);
            throw error;
        }
    }

    generarHTML(profesor, cursos) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Cursos por Profesor</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #fff; color: #222; }
                h1, h2 { color: #003366; }
                .profesor-info { margin-bottom: 30px; padding: 20px; background-color: #f4f6fa; border-radius: 8px; border-left: 6px solid #B22234; }
                .curso-card { margin-bottom: 24px; padding: 18px; border: 1px solid #00336622; border-radius: 8px; background: #f9fafc; box-shadow: 0 2px 8px #00336611; }
                .curso-header { margin-bottom: 10px; }
                .curso-details { margin-left: 20px; }
                .label { font-weight: bold; color: #B22234; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; }
                th, td { border: 1px solid #00336644; padding: 10px; text-align: left; }
                th { background-color: #003366; color: #fff; }
                tr:nth-child(even) { background-color: #f4f6fa; }
                .stats { display: flex; gap: 20px; margin-top: 10px; }
                .stat-item { padding: 10px; background-color: #B2223422; border-radius: 5px; color: #003366; font-weight: 500; }
            </style>
        </head>
        <body>
            <h1>Cursos por Profesor</h1>
            
            <div class="profesor-info">
                <h2>Información del Profesor</h2>
                <div><span class="label">Nombre:</span> ${profesor.nombre} ${profesor.apellido}</div>
                <div><span class="label">Especialidad:</span> ${profesor.especialidad}</div>
                <div><span class="label">Email:</span> ${profesor.email}</div>
            </div>

            <h2>Cursos Asignados (${cursos.length})</h2>
            
            ${cursos.map(curso => `
                <div class="curso-card">
                    <div class="curso-header">
                        <h3>${curso.nombre}</h3>
                        <div class="stats">
                            <div class="stat-item">
                                <span class="label">Nivel:</span> ${curso.nivel}
                            </div>
                            <div class="stat-item">
                                <span class="label">Estudiantes:</span> ${curso.cantidadEstudiantes}
                            </div>
                            <div class="stat-item">
                                <span class="label">Intensidad:</span> ${curso.intensidadHoraria} horas
                            </div>
                        </div>
                    </div>
                    
                    <div class="curso-details">
                        <div><span class="label">Período:</span> ${curso.fechaInicio} al ${curso.fechaFin}</div>
                        
                        <h4>Horarios</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Día</th>
                                    <th>Hora Inicio</th>
                                    <th>Hora Fin</th>
                                    <th>Aula</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${curso.horarios.map(horario => `
                                    <tr>
                                        <td>${horario.dia}</td>
                                        <td>${horario.horaInicio}</td>
                                        <td>${horario.horaFin}</td>
                                        <td>${horario.aula}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('')}
        </body>
        </html>
        `;
    }

    async guardarReporte(html, fileName) {
        const reportsDir = path.join(process.cwd(), 'HTML', 'reports');
        try {
            await fs.mkdir(reportsDir, { recursive: true });
            await fs.writeFile(path.join(reportsDir, fileName), html);
        } catch (error) {
            console.error('Error al guardar el reporte:', error);
            throw error;
        }
    }
}

export { CursosPorProfesorReport }; 