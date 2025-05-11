import { connectDB, closeDB } from '../../DB/connection.js';
import { CursosPorFechaReport } from './CursosPorFechaReport.js';
import { NotasEstudianteReport } from './NotasEstudianteReport.js';
import { CursosPorProfesorReport } from './CursosPorProfesorReport.js';
import { DetalleCursoReport } from './DetalleCursoReport.js';

async function ejecutarReportes() {
    try {
        console.log('Iniciando generación de reportes...');

        // Reporte de cursos por fecha
        console.log('\nGenerando reporte de cursos por fecha...');
        const cursosPorFecha = new CursosPorFechaReport();
        const fechaInicio = '2024-01-01';
        const fechaFin = '2024-12-31';
        await cursosPorFecha.generarReporte(fechaInicio, fechaFin);

        // Reporte de notas de estudiante
        console.log('\nGenerando reporte de notas de estudiante...');
        const notasEstudiante = new NotasEstudianteReport();
        await notasEstudiante.generarReporte('EST001');

        // Reporte de cursos por profesor
        console.log('\nGenerando reporte de cursos por profesor...');
        const cursosPorProfesor = new CursosPorProfesorReport();
        await cursosPorProfesor.generarReporte('PROF001');

        // Reporte de detalle de curso
        console.log('\nGenerando reporte de detalle de curso...');
        const detalleCurso = new DetalleCursoReport();
        await detalleCurso.generarReporte('C001');

        console.log('\n¡Todos los reportes han sido generados exitosamente!');
    } catch (error) {
        console.error('Error al generar reportes:', error);
    } finally {
        await closeDB();
    }
}

// Ejecutar los reportes
ejecutarReportes().catch(console.error); 