export const createIndexes = async (db) => {
    // Índices para estudiantes
    await db.collection('estudiantes').createIndex({ numeroIdentificacion: 1 }, { unique: true, name: "numeroIdentificacion_unique" });
    await db.collection('estudiantes').createIndex({ codigo: 1 }, { unique: true, name: "codigo_unique" });
    await db.collection('estudiantes').createIndex({ tipoIdentificacion: 1 }, { name: "tipoIdentificacion_index" });
    await db.collection('estudiantes').createIndex({ fechaRegistro: 1 }, { name: "fechaRegistro_index" });

    // Índices para profesores
    await db.collection('profesores').createIndex({ id: 1 }, { unique: true, name: "id_unique" });
    await db.collection('profesores').createIndex({ email: 1 }, { unique: true, name: "email_unique" });
    await db.collection('profesores').createIndex({ especialidad: 1 }, { name: "especialidad_index" });

    // Índices para cursos
    await db.collection('cursos').createIndex({ id: 1 }, { unique: true, name: "id_unique" });
    await db.collection('cursos').createIndex({ profesorId: 1 }, { name: "profesor_index" });
    await db.collection('cursos').createIndex({ nivel: 1 }, { name: "nivel_index" });

    // Índices para horarios
    await db.collection('schedule').createIndex({ id: 1 }, { unique: true, name: "id_unique" });
    await db.collection('schedule').createIndex({ cursoId: 1 }, { name: "curso_index" });
    await db.collection('schedule').createIndex({ profesorId: 1 }, { name: "profesor_index" });
    await db.collection('schedule').createIndex(
        { dia: 1, horaInicio: 1, horaFin: 1 }, 
        { name: "horario_compuesto" }
    );
    await db.collection('schedule').createIndex(
        { aula: 1, dia: 1, horaInicio: 1, horaFin: 1 }, 
        { unique: true, name: "aula_horario_unique" }
    );
}; 