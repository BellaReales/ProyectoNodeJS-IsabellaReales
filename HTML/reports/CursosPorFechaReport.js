import { connectDB } from '../../DB/connection.js';
import fs from 'fs/promises';
import path from 'path';

class CursosPorFechaReport {
    async generarReporte(fechaInicio, fechaFin) {
        // Validar fechas
        if (!fechaInicio || !fechaFin) {
            throw new Error('Las fechas de inicio y fin son requeridas');
        }

        try {
            // Validar formato de fechas
            const fechaInicioObj = new Date(fechaInicio);
            const fechaFinObj = new Date(fechaFin);

            if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
                throw new Error('Formato de fecha inválido');
            }

            if (fechaInicioObj > fechaFinObj) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }

            const db = await connectDB();
            
            // Obtener cursos en el rango de fechas
            const cursos = await db.collection('cursos').find({
                fechaInicio: { $gte: fechaInicio },
                fechaFin: { $lte: fechaFin }
            }).toArray();

            if (cursos.length === 0) {
                throw new Error('No se encontraron cursos en el período especificado');
            }

            // Obtener información adicional de cada curso
            const cursosConDetalles = await Promise.all(cursos.map(async (curso) => {
                try {
                    // Obtener profesor
                    const profesor = await db.collection('profesores').findOne({ id: curso.profesorId });
                    
                    // Obtener horarios
                    const horarios = await db.collection('schedule').find({ cursoId: curso.id }).toArray();
                    
                    // Obtener cantidad de estudiantes
                    const estudiantes = await db.collection('estudiantes').countDocuments({
                        cursos: curso.id
                    });

                    return {
                        ...curso,
                        profesor: profesor || { nombre: 'No asignado', apellido: '', especialidad: 'No especificada' },
                        horarios: horarios || [],
                        cantidadEstudiantes: estudiantes
                    };
                } catch (error) {
                    console.error(`Error al obtener detalles del curso ${curso.id}:`, error);
                    return {
                        ...curso,
                        profesor: { nombre: 'Error', apellido: '', especialidad: 'Error al cargar datos' },
                        horarios: [],
                        cantidadEstudiantes: 0
                    };
                }
            }));

            const html = this.generarHTML(fechaInicio, fechaFin, cursosConDetalles);
            const fileName = `cursos_${fechaInicio}_${fechaFin}.html`;
            await this.guardarReporte(html, fileName);
            return fileName;
        } catch (error) {
            console.error('Error al generar reporte de cursos por fecha:', error);
            throw error;
        }
    }

    generarHTML(fechaInicio, fechaFin, cursos) {
        const totalEstudiantes = cursos.reduce((sum, curso) => sum + curso.cantidadEstudiantes, 0);
        const cursosPorNivel = this.agruparCursosPorNivel(cursos);

        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Cursos por Fecha</title>
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
                .stats { display: flex; gap: 20px; margin-top: 10px; }
                .stat-item { padding: 10px; background-color: #B2223422; border-radius: 5px; color: #003366; font-weight: 500; }
                .profesor-info { margin-top: 10px; padding: 10px; background-color: #00336611; border-radius: 5px; }
                .nivel-section { margin: 20px 0; }
                .nivel-header { background-color: #B22234; color: white; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Cursos por Fecha</h1>
            
            <div class="periodo-info">
                <h2>Período del Reporte</h2>
                <div><span class="label">Fecha Inicio:</span> ${fechaInicio}</div>
                <div><span class="label">Fecha Fin:</span> ${fechaFin}</div>
                <div><span class="label">Total Cursos:</span> ${cursos.length}</div>
                <div><span class="label">Total Estudiantes:</span> ${totalEstudiantes}</div>
            </div>

            <div class="resumen">
                <h2>Resumen por Nivel</h2>
                ${Object.entries(cursosPorNivel).map(([nivel, cursosNivel]) => `
                    <div class="nivel-section">
                        <div class="nivel-header">
                            <h3>${nivel}</h3>
                            <div>Cursos: ${cursosNivel.length}</div>
                            <div>Estudiantes: ${cursosNivel.reduce((sum, curso) => sum + curso.cantidadEstudiantes, 0)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h2>Cursos Programados</h2>
            
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
                        
                        <div class="profesor-info">
                            <h4>Profesor</h4>
                            <div><span class="label">Nombre:</span> ${curso.profesor.nombre} ${curso.profesor.apellido}</div>
                            <div><span class="label">Especialidad:</span> ${curso.profesor.especialidad}</div>
                        </div>
                        
                        ${curso.horarios.length > 0 ? `
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
                        ` : '<p>No hay horarios registrados para este curso</p>'}
                    </div>
                </div>
            `).join('')}
        </body>
        </html>
        `;
    }

    agruparCursosPorNivel(cursos) {
        return cursos.reduce((grupos, curso) => {
            const nivel = curso.nivel || 'No especificado';
            if (!grupos[nivel]) {
                grupos[nivel] = [];
            }
            grupos[nivel].push(curso);
            return grupos;
        }, {});
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

export { CursosPorFechaReport }; 