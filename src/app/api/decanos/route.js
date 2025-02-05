import pool from '@/app/lib/db';

// Obtener todos los registros
export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT decanos.*, ocde.facultad FROM decanos JOIN ocde ON decanos.ocde_id = ocde.id ');
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
    const { ocde_id, grado, nombreapellidodecano,denominacion,modelooficio,estado } = await request.json();
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO decanos (ocde_id, grado, nombreapellidodecano,denominacion,modelooficio,estado) VALUES (?,?,?,?, ?, ?)',
      [ocde_id, grado, nombreapellidodecano,denominacion,modelooficio,estado]
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
