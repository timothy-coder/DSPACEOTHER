import pool from '@/app/lib/db';

// Obtener todos los registros
export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM orcid');
    connection.release();
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la consulta:', error);
    return new Response(JSON.stringify({ error: 'Error en la consulta' }), { status: 500 });
  }
}

// Insertar un nuevo OCDE
export async function POST(request) {
  try {
    const { dni, nombreapellido, orcid } = await request.json();
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO ocde (dni, nombreapellido, orcid) VALUES (?, ?, ?)',
      [dni, nombreapellido, orcid]
    );
    connection.release();
    return new Response(JSON.stringify({ id: result.insertId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la inserción:', error);
    return new Response(JSON.stringify({ error: 'Error en la inserción' }), { status: 500 });
  }
}
