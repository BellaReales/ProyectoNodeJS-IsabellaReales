import ReportGenerator from './reportGenerator.js';

async function testReportGeneration() {
    try {
        const generator = new ReportGenerator();
        await generator.initialize();

        // Datos de prueba
        const testData = {
            titulo: 'Reporte de Prueba',
            fechaInicio: '2024-01-01',
            fechaFin: '2024-12-31',
            curso: {
                nombre: 'Curso de Prueba'
            },
            profesor: {
                nombre: 'Profesor de Prueba'
            },
            headers: ['ID', 'Nombre', 'Nota'],
            rows: [
                ['1', 'Estudiante 1', '4.5'],
                ['2', 'Estudiante 2', '3.8'],
                ['3', 'Estudiante 3', '4.2']
            ]
        };

        // Generar reporte de prueba
        const reportPath = await generator.generateTableReport(testData, 'test_report');
        console.log('Reporte generado en:', reportPath);

        // Cerrar conexión
        await generator.close();
    } catch (error) {
        console.error('Error en la prueba:', error);
    }
}

// Ejecutar prueba
testReportGeneration(); 