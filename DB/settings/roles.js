export const roles = {
    admin: {
        description: "Administrador del sistema",
        privileges: [
            {
                resource: { db: "escuela", collection: "" },
                actions: ["find", "insert", "update", "delete", "createIndex", "dropIndex"]
            }
        ]
    },
    profesor: {
        description: "Profesor del instituto",
        privileges: [
            {
                resource: { db: "escuela", collection: "cursos" },
                actions: ["find"]
            },
            {
                resource: { db: "escuela", collection: "estudiantes" },
                actions: ["find", "update"]
            },
            {
                resource: { db: "escuela", collection: "horarios" },
                actions: ["find"]
            }
        ]
    },
    estudiante: {
        description: "Estudiante del instituto",
        privileges: [
            {
                resource: { db: "escuela", collection: "cursos" },
                actions: ["find"]
            },
            {
                resource: { db: "escuela", collection: "horarios" },
                actions: ["find"]
            },
            {
                resource: { db: "escuela", collection: "estudiantes" },
                actions: ["find", "update"]
            }
        ]
    }
};

export const createRoles = async (db) => {
    // Crear roles
    await db.command({
        createRole: "admin",
        privileges: [
            {
                resource: { db: "escuela", collection: "" },
                actions: ["find", "insert", "update", "delete", "createIndex", "dropIndex"]
            }
        ],
        roles: []
    });

    await db.command({
        createRole: "profesor",
        privileges: [
            {
                resource: { db: "escuela", collection: "cursos" },
                actions: ["find"]
            },
            {
                resource: { db: "escuela", collection: "estudiantes" },
                actions: ["find", "update"]
            },
            {
                resource: { db: "escuela", collection: "horarios" },
                actions: ["find"]
            }
        ],
        roles: []
    });

    await db.command({
        createRole: "estudiante",
        privileges: [
            {
                resource: { db: "escuela", collection: "cursos" },
                actions: ["find"]
            },
            {
                resource: { db: "escuela", collection: "horarios" },
                actions: ["find"]
            },
            {
                resource: { db: "escuela", collection: "estudiantes" },
                actions: ["find", "update"]
            }
        ],
        roles: []
    });
};

export const createUsers = async (db) => {
    // Crear usuarios con sus respectivos roles
    await db.command({
        createUser: "admin",
        pwd: "admin123", // En producción usar variables de entorno
        roles: [
            { role: "admin", db: "escuela" }
        ]
    });

    await db.command({
        createUser: "profesor1",
        pwd: "prof123",
        roles: [
            { role: "profesor", db: "escuela" }
        ]
    });

    await db.command({
        createUser: "estudiante1",
        pwd: "est123",
        roles: [
            { role: "estudiante", db: "escuela" }
        ]
    });
}; 