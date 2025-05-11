export class CursoValidator {
    static schema = {
        bsonType: "object",
        required: ["id", "nombre", "profesorId", "descripcion", "duracion", "nivel"],
        properties: {
            id: { 
                bsonType: "string",
                pattern: "^[A-Z0-9]{6}$"
            },
            nombre: { 
                bsonType: "string",
                minLength: 3,
                maxLength: 50
            },
            profesorId: { 
                bsonType: "string",
                pattern: "^[A-Z0-9]{6}$"
            },
            descripcion: { 
                bsonType: "string",
                minLength: 10,
                maxLength: 200
            },
            duracion: { 
                bsonType: "string",
                pattern: "^\\d+\\s+(mes|meses|año|años)$"
            },
            nivel: { 
                bsonType: "string",
                enum: ["Básico", "Intermedio", "Avanzado"]
            }
        }
    };
} 