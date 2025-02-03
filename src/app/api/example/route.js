// src/app/api/example/route.js
import pool from '@/app/lib/db';

export async function GET() {
  try {
    // Obtener una conexión del pool
    const connection = await pool.getConnection();

    // Ejecutar una consulta
    const [rows] = await connection.query('SELECT * FROM investigaciones');

    // Liberar la conexión
    connection.release();

    // Devolver los resultados
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la consulta:', error);
    return new Response(JSON.stringify({ error: 'Error en la consulta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}