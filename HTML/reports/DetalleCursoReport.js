import { connectDB } from '../../DB/connection.js';
import fs from 'fs/promises';
import path from 'path';

class DetalleCursoReport {
    async generarReporte(cursoId) {
        try {
            const db = await connectDB();
            const curso = await db.collection('cursos').findOne({ id: cursoId });
            
            if (!curso) {
                throw new Error('Curso no encontrado');
            }

            // Obtener información del profesor
            const profesor = await db.collection('profesores').findOne({ id: curso.profesorId });
            
            // Obtener horarios del curso
            const horarios = await db.collection('schedule').find({ cursoId }).toArray();

            const html = this.generarHTML(curso, profesor, horarios);
            const fileName = `detalle_curso_${cursoId}.html`;
            await this.guardarReporte(html, fileName);
            return fileName;
        } catch (error) {
            console.error('Error al generar reporte de detalle de curso:', error);
            throw error;
        }
    }

    generarHTML(curso, profesor, horarios) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Detalle de Curso</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #fff; color: #222; }
                h1, h2, h3 { color: #003366; }
                .periodo-info, .resumen { margin-bottom: 30px; padding: 20px; background-color: #f4f6fa; border-radius: 8px; border-left: 6px solid #B22234; }
                .curso-card { margin-bottom: 24px; padding: 18px; border: 1px solid #00336622; border-radius: 8px; background: #f9fafc; box-shadow: 0 2px 8px #00336611; }
                .curso-header { margin-bottom: 10px; }
                .curso-details { margin-left: 20px; }
                .label { font-weight: bold; color: #B22234; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; }
                th, td { border: 1px solid #00336644; padding: 10px; text-align: left; }
                th { background-color: #003366; color: #fff; }
                tr:nth-child(even) { background-color: #f4f6fa; }
                .contenido-item { margin: 10px 0; padding: 10px; background-color: #00336611; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Detalle del Curso: ${curso.nombre}</h1>
            <div class="periodo-info">
                <h2>Información General</h2>
                <div><span class="label">ID:</span> ${curso.id}</div>
                <div><span class="label">Nivel:</span> ${curso.nivel}</div>
                <div><span class="label">Intensidad Horaria:</span> ${curso.intensidadHoraria} horas</div>
                <div><span class="label">Profesor:</span> ${profesor ? `${profesor.nombre} ${profesor.apellido}` : 'No asignado'}</div>
                <div><span class="label">Período:</span> ${curso.fechaInicio} al ${curso.fechaFin}</div>
            </div>
            <div class="curso-card">
                <div class="curso-header">
                    <h3>Contenido Temático</h3>
                </div>
                <div class="curso-details">
                    ${curso.contenidoTematico ? curso.contenidoTematico.map((contenido, index) => `
                        <div class="contenido-item">
                            <div class="label">Unidad ${index + 1}:</div>
                            <div>${contenido.titulo}</div>
                            <div>${contenido.descripcion}</div>
                            <div>Duración: ${contenido.duracion} horas</div>
                        </div>
                    `).join('') : '<p>No hay contenido temático disponible</p>'}
                </div>
            </div>
            <div class="curso-card">
                <div class="curso-header">
                    <h3>Horarios</h3>
                </div>
                <div class="curso-details">
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
                            ${horarios.map(horario => `
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

export { DetalleCursoReport }; 