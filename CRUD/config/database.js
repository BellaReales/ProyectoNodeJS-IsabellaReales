import { connectDB } from '../../DB/connection.js';

export async function getDB() {
    return await connectDB();
} 