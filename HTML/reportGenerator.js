import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ReportGenerator {
    constructor() {
        this.client = null;
        this.db = null;
        this.templatesDir = path.join(__dirname, 'templates');
        this.reportsDir = path.join(__dirname, 'reports');
    }

    async initialize() {
        try {
            // Conexión a MongoDB Atlas
            const uri = "mongodb+srv://bella:bella123@cluster0.egukohg.mongodb.net/escuela?retryWrites=true&w=majority&appName=Cluster0";
            this.client = await MongoClient.connect(uri);
            this.db = this.client.db('escuela');
            await this.ensureDirectories();
        } catch (error) {
            console.error('Error al inicializar ReportGenerator:', error);
            throw error;
        }
    }

    async ensureDirectories() {
        await fs.mkdir(this.templatesDir, { recursive: true });
        await fs.mkdir(this.reportsDir, { recursive: true });
    }

    async generateCursosProgramadosReport(fechaInicio, fechaFin) {
        const cursos = await this.db.collection('cursos').find({
            fechaInicio: { $gte: new Date(fechaInicio) },
            fechaFin: { $lte: new Date(fechaFin) }
        }).toArray();

        const reportData = {
            titulo: 'Cursos Programados',
            fechaInicio,
            fechaFin,
            headers: ['ID', 'Nombre', 'Profesor', 'Fecha Inicio', 'Fecha Fin', 'Estado'],
            rows: cursos.map(curso => [
                curso._id,
                curso.nombre,
                curso.profesor,
                curso.fechaInicio.toLocaleDateString(),
                curso.fechaFin.toLocaleDateString(),
                curso.estado
            ])
        };

        return this.generateTableReport(reportData, 'cursos_programados');
    }

    async generateCursoDetalleReport(cursoId) {
        const curso = await this.db.collection('cursos').findOne({ _id: cursoId });
        if (!curso) throw new Error('Curso no encontrado');

        const estudiantes = await this.db.collection('estudiantes')
            .find({ cursoId }).toArray();

        const reportData = {
            titulo: `Detalle del Curso: ${curso.nombre}`,
            curso: curso,
            headers: ['ID', 'Nombre', 'Email', 'Nota Final'],
            rows: estudiantes.map(est => [
                est._id,
                est.nombre,
                est.email,
                est.notaFinal || 'Pendiente'
            ])
        };

        return this.generateTableReport(reportData, `curso_${cursoId}`);
    }

    async generateCursoProfesorReport(profesorId, cursoId, fecha) {
        const curso = await this.db.collection('cursos').findOne({
            _id: cursoId,
            profesor: profesorId,
            fechaInicio: { $lte: new Date(fecha) }
        });

        if (!curso) throw new Error('Curso no encontrado para el profesor en la fecha especificada');

        const reportData = {
            titulo: `Reporte de Curso por Profesor`,
            profesor: await this.db.collection('profesores').findOne({ _id: profesorId }),
            curso: curso,
            fecha: fecha,
            headers: ['ID', 'Nombre', 'Asistencia', 'Notas'],
            rows: (await this.db.collection('estudiantes')
                .find({ cursoId })
                .toArray())
                .map(est => [
                    est._id,
                    est.nombre,
                    est.asistencia || 'No registrada',
                    est.notas ? est.notas.join(', ') : 'Sin notas'
                ])
        };

        return this.generateTableReport(reportData, `curso_profesor_${profesorId}_${cursoId}`);
    }

    async generateNotasEstudianteReport(estudianteId) {
        const estudiante = await this.db.collection('estudiantes').findOne({ _id: estudianteId });
        if (!estudiante) throw new Error('Estudiante no encontrado');

        const cursos = await this.db.collection('cursos')
            .find({ _id: { $in: estudiante.cursos || [] } })
            .toArray();

        const reportData = {
            titulo: `Registro de Notas - ${estudiante.nombre}`,
            estudiante: estudiante,
            headers: ['Curso', 'Nota Final', 'Estado', 'Fecha'],
            rows: cursos.map(curso => [
                curso.nombre,
                curso.notaFinal || 'Pendiente',
                curso.estado,
                curso.fechaFin.toLocaleDateString()
            ])
        };

        return this.generateTableReport(reportData, `notas_${estudianteId}`);
    }

    async generateTableReport(data, filename) {
        const template = await this.getTemplate('table');
        const html = this.fillTemplate(template, data);
        const reportPath = path.join(this.reportsDir, `${filename}.html`);
        await fs.writeFile(reportPath, html);
        return reportPath;
    }

    async getTemplate(templateName) {
        const templatePath = path.join(this.templatesDir, `${templateName}.html`);
        try {
            return await fs.readFile(templatePath, 'utf-8');
        } catch (error) {
            // Si el template no existe, crear uno por defecto
            const defaultTemplate = this.getDefaultTemplate(templateName);
            await fs.writeFile(templatePath, defaultTemplate);
            return defaultTemplate;
        }
    }

    getDefaultTemplate(templateName) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{titulo}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        }
        .header h1 {
            color: #333;
            margin: 0;
        }
        .header p {
            color: #666;
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #4a90e2;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        td {
            vertical-align: middle;
        }
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #eee;
            font-size: 0.9em;
            color: #666;
        }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        .status-active {
            background-color: #d4edda;
            color: #155724;
        }
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        .status-completed {
            background-color: #cce5ff;
            color: #004085;
        }
        .table-responsive {
            overflow-x: auto;
            margin: 20px 0;
        }
        .table-caption {
            caption-side: top;
            text-align: left;
            padding: 10px;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{titulo}}</h1>
            {{#if fechaInicio}}
            <p>Período: {{fechaInicio}} - {{fechaFin}}</p>
            {{/if}}
            {{#if curso}}
            <p>Curso: {{curso.nombre}}</p>
            {{/if}}
            {{#if profesor}}
            <p>Profesor: {{profesor.nombre}}</p>
            {{/if}}
        </div>

        <div class="table-responsive">
            <table>
                <caption>Datos del Reporte</caption>
                <thead>
                    <tr>
                        {{#each headers}}
                        <th>{{this}}</th>
                        {{/each}}
                    </tr>
                </thead>
                <tbody>
                    {{#each rows}}
                    <tr>
                        {{#each this}}
                        <td>{{this}}</td>
                        {{/each}}
                    </tr>
                    {{/each}}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Generado el {{fecha}}</p>
        </div>
    </div>
</body>
</html>`;
    }

    fillTemplate(template, data) {
        let html = template;
        
        // Reemplazar variables simples
        Object.keys(data).forEach(key => {
            if (typeof data[key] !== 'object') {
                html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
            }
        });

        // Reemplazar fecha
        html = html.replace('{{fecha}}', new Date().toLocaleDateString());

        // Reemplazar headers
        if (data.headers) {
            const headersHtml = data.headers.map(h => `<th>${h}</th>`).join('\n');
            html = html.replace('{{#each headers}}', headersHtml);
        }

        // Reemplazar rows
        if (data.rows) {
            const rowsHtml = data.rows.map(row => {
                const cells = row.map(cell => `<td>${cell}</td>`).join('\n');
                return `<tr>\n${cells}\n</tr>`;
            }).join('\n');
            html = html.replace('{{#each rows}}', rowsHtml);
        }

        return html;
    }

    async close() {
        if (this.client) {
            await this.client.close();
        }
    }
} 