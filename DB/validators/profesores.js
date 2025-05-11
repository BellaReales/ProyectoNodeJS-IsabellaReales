export const profesoresSchema = {
    id: { type: 'string', required: true, unique: true },
    nombre: { type: 'string', required: true },
    especialidad: { type: 'string', required: true },
    email: { type: 'string', required: true, unique: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    telefono: { type: 'string', required: true, pattern: /^\d{3}-\d{4}$/ }
};

export const profesoresDatos = [
    {
        id: "PROF001",
        nombre: "Juan Pérez",
        especialidad: "Matemáticas",
        email: "juan.perez@escuela.com",
        telefono: "555-0101"
    },
    {
        id: "PROF002",
        nombre: "María García",
        especialidad: "Literatura",
        email: "maria.garcia@escuela.com",
        telefono: "555-0102"
    },
    {
        id: "PROF003",
        nombre: "Carlos Rodríguez",
        especialidad: "Física",
        email: "carlos.rodriguez@escuela.com",
        telefono: "555-0103"
    },
    {
        id: "PROF004",
        nombre: "Ana Martínez",
        especialidad: "Historia",
        email: "ana.martinez@escuela.com",
        telefono: "555-0104"
    }
]; 