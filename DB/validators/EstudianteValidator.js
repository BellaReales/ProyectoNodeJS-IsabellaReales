export class EstudianteValidator {
    static schema = {
        bsonType: "object",
        required: ["numeroIdentificacion", "tipoIdentificacion", "codigo", "primerNombre", "segundoNombre", "fechaRegistro"],
        properties: {
            numeroIdentificacion: {
                bsonType: "string",
                description: "Número de identificación del estudiante"
            },
            tipoIdentificacion: {
                bsonType: "string",
                description: "Tipo de identificación (DNI, pasaporte, etc.)"
            },
            codigo: {
                bsonType: "string",
                pattern: "^[A-Z0-9]{6}$",
                description: "Código único del estudiante"
            },
            primerNombre: {
                bsonType: "string",
                minLength: 2,
                maxLength: 50,
                description: "Primer nombre del estudiante"
            },
            segundoNombre: {
                bsonType: "string",
                minLength: 2,
                maxLength: 50,
                description: "Segundo nombre del estudiante"
            },
            fechaRegistro: {
                bsonType: "date",
                description: "Fecha de registro del estudiante"
            }
        }
    }
}

module.exports = EstudianteValidator; 