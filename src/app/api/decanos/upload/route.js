import pool from '@/app/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const connection = await pool.getConnection();

    // Insertar múltiples registros
    const results = await Promise.all(
      data.map(async (item) => {
        const { facultad, grado, nombreapellidodecano, denominacion, modelooficio, estado } = item;

        // Obtener ocde_id correspondiente a la facultad
        const [ocdeResult] = await connection.query('SELECT id FROM ocde WHERE facultad = ?', [facultad]);

        if (ocdeResult.length === 0) {
          return { error: `Facultad "${facultad}" no encontrada` };
        }

        const ocde_id = ocdeResult[0].id;

        // Insertar decano con el ocde_id correcto
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
