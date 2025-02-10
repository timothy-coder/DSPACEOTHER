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
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // Extraer el ID de la URL

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID no proporcionado' }), { status: 400 });
    }

    const { facultad, grado, nombreapellidodecano, denominacion, modelooficio, estado } = await request.json();

    // Obtener ocde_id correspondiente a la facultad
    const connection = await pool.getConnection();
    const [ocdeResult] = await connection.query('SELECT id FROM ocde WHERE facultad = ?', [facultad]);

    if (ocdeResult.length === 0) {
      connection.release();
      return new Response(JSON.stringify({ error: 'Facultad no encontrada' }), { status: 400 });
    }

    const ocde_id = ocdeResult[0].id;

    // Actualizar decano con el ocde_id correcto
    const [result] = await connection.query(
      'INSERT INTO decanos (ocde_id, grado, nombreapellidodecano,denominacion,modelooficio,estado) VALUES (?,?,?,?, ?, ?)',
      [ocde_id, grado, nombreapellidodecano,denominacion,modelooficio,estado]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Registro no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la actualización:', error);
    return new Response(JSON.stringify({ error: 'Error en la actualización' }), { status: 500 });
  }
}
