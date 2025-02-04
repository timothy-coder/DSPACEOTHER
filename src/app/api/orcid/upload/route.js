// src/app/api/orcid/upload/route.js
import pool from '@/app/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const connection = await pool.getConnection();

    // Insertar múltiples registros
    const results = await Promise.all(
      data.map(async (item) => {
        const [result] = await connection.query(
          'INSERT INTO orcid (dni, nombreapellido, orcid) VALUES (?, ?, ?)',
          [item.dni, item.nombreapellido, item.orcid]
        );
        return { id: result.insertId, ...item };
      })
    );

    connection.release();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la carga masiva:', error);
    return new Response(JSON.stringify({ error: 'Error en la carga masiva' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}