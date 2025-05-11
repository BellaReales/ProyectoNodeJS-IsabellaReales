import { connectDB } from '../../DB/connection.js';
import fs from 'fs/promises';
import path from 'path';

class NotasEstudianteReport {
    async generarReporte(estudianteId) {
        if (!estudianteId) {
            throw new Error('El ID del estudiante es requerido');
        }

        try {
            const db = await connectDB();
            const estudiante = await db.collection('estudiantes').findOne({ id: estudianteId });
            
            if (!estudiante) {
                throw new Error('Estudiante no encontrado');
            }

            // Obtener cursos del estudiante
            const cursosIds = Array.isArray(estudiante.cursos) ? estudiante.cursos : [];
            const cursos = await db.collection('cursos').find({
                id: { $in: cursosIds }
            }).toArray();

            if (cursos.length === 0) {
                throw new Error('El estudiante no está matriculado en ningún curso');
            }

            // Obtener notas de cada curso
            const notasPorCurso = await Promise.all(cursos.map(async (curso) => {
                const notas = (estudiante.notas || []).filter(nota => nota.cursoId === curso.id);
                const promedio = this.calcularPromedio(notas);
                
                return {
                    ...curso,
                    notas,
                    promedio,
                    estado: this.determinarEstado(promedio)
                };
            }));

            const promedioGeneral = this.calcularPromedioGeneral(notasPorCurso);
            const html = this.generarHTML(estudiante, notasPorCurso, promedioGeneral);
            const fileName = `notas_estudiante_${estudianteId}.html`;
            await this.guardarReporte(html, fileName);
            return fileName;
        } catch (error) {
            console.error('Error al generar reporte de notas del estudiante:', error);
            throw error;
        }
    }

    calcularPromedio(notas) {
        if (!notas || notas.length === 0) return 0;
        const suma = notas.reduce((sum, nota) => sum + nota.valor, 0);
        return suma / notas.length;
    }

    calcularPromedioGeneral(cursosConNotas) {
        if (!cursosConNotas || cursosConNotas.length === 0) return 0;
        const suma = cursosConNotas.reduce((sum, curso) => sum + curso.promedio, 0);
        return suma / cursosConNotas.length;
    }

    determinarEstado(promedio) {
        if (promedio >= 4.5) return { texto: 'Excelente', clase: 'excelente' };
        if (promedio >= 3.5) return { texto: 'Bueno', clase: 'bueno' };
        if (promedio >= 3.0) return { texto: 'Aceptable', clase: 'aceptable' };
        return { texto: 'Necesita Mejorar', clase: 'necesita-mejorar' };
    }

    generarHTML(estudiante, cursosConNotas, promedioGeneral) {
        const estadoGeneral = this.determinarEstado(promedioGeneral);
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Notas del Estudiante</title>
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
                .promedio { font-size: 1.2em; color: #003366; margin-top: 10px; }
                .nota-alta { color: #003366; font-weight: bold; }
                .nota-baja { color: #B22234; font-weight: bold; }
                .estado { padding: 5px 10px; border-radius: 3px; font-weight: bold; }
                .excelente { background-color: #003366; color: white; }
                .bueno { background-color: #B22234; color: white; }
                .aceptable { background-color: #f1c40f; color: black; }
                .necesita-mejorar { background-color: #B22234; color: white; }
            </style>
        </head>
        <body>
            <h1>Notas del Estudiante</h1>
            <div class="periodo-info">
                <h2>Información del Estudiante</h2>
                <div><span class="label">Nombre:</span> ${estudiante.nombre}</div>
                <div><span class="label">Identificación:</span> ${estudiante.numeroIdentificacion}</div>
                <div><span class="label">Email:</span> ${estudiante.email}</div>
            </div>
            <div class="resumen">
                <h2>Resumen Académico</h2>
                <div><span class="label">Promedio General:</span> ${promedioGeneral.toFixed(2)}</div>
                <div><span class="label">Estado:</span> <span class="estado ${estadoGeneral.clase}">${estadoGeneral.texto}</span></div>
                <div><span class="label">Total Cursos:</span> ${cursosConNotas.length}</div>
            </div>
            <h2>Notas por Curso</h2>
            ${cursosConNotas.map(curso => `
                <div class="curso-card">
                    <div class="curso-header">
                        <h3>${curso.nombre}</h3>
                        <div class="stats">
                            <div class="stat-item">
                                <span class="label">Nivel:</span> ${curso.nivel}
                            </div>
                            <div class="stat-item">
                                <span class="label">Estado:</span> <span class="estado ${curso.estado.clase}">${curso.estado.texto}</span>
                            </div>
                        </div>
                    </div>
                    <div class="curso-details">
                        ${curso.notas && curso.notas.length > 0 ? `
                            <h4>Notas</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Evaluación</th>
                                        <th>Nota</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${curso.notas.map(nota => `
                                        <tr>
                                            <td>${nota.evaluacion}</td>
                                            <td class="${nota.valor >= 3.0 ? 'nota-alta' : 'nota-baja'}">${nota.valor}</td>
                                            <td>${nota.fecha}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <div class="promedio">
                                <span class="label">Promedio del Curso:</span> ${curso.promedio.toFixed(2)}
                            </div>
                        ` : '<p>No hay notas registradas para este curso</p>'}
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

export { NotasEstudianteReport }; 