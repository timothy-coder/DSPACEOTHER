// src/app/api/decano/upload/route.js
import pool from '@/app/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const connection = await pool.getConnection();

    // Insertar múltiples registros
    const results = await Promise.all(
      data.map(async (item) => {
        const { ocde_id, grado, nombreapellidodecano, denominacion, modelooficio, estado } = item;

        // Insertar decano con referencia al ocde_id
        const [result] = await connection.query(
          'INSERT INTO decanos (ocde_id, grado, nombreapellidodecano, denominacion, modelooficio, estado) VALUES (?, ?, ?, ?, ?, ?)',
          [ocde_id, grado, nombreapellidodecano, denominacion, modelooficio, estado]
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
