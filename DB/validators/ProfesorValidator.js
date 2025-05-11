export class ProfesorValidator {
    static schema = {
        bsonType: "object",
        required: ["id", "nombre", "especialidad", "email", "telefono"],
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
            especialidad: { 
                bsonType: "string",
                minLength: 3,
                maxLength: 30
            },
            email: { 
                bsonType: "string",
                pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            telefono: { 
                bsonType: "string",
                pattern: "^[0-9-]{8,15}$"
            }
        }
    };
} 