const { IsString, IsIn, Matches, Length, IsNotEmpty, ValidateIf } = require('class-validator');

export class ScheduleValidator {
    static schema = {
        bsonType: "object",
        required: ["id", "cursoId", "profesorId", "dia", "horaInicio", "horaFin", "aula"],
        properties: {
            id: { 
                bsonType: "string",
                pattern: "^[A-Z0-9]{6}$"
            },
            cursoId: { 
                bsonType: "string",
                pattern: "^[A-Z0-9]{6}$"
            },
            profesorId: { 
                bsonType: "string",
                pattern: "^[A-Z0-9]{6}$"
            },
            dia: { 
                bsonType: "string",
                enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
            },
            horaInicio: { 
                bsonType: "string",
                pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
            },
            horaFin: { 
                bsonType: "string",
                pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
            },
            aula: { 
                bsonType: "string",
                pattern: "^[A-Z][0-9]{3}$"
            }
        }
    };
}

module.exports = ScheduleValidator; 