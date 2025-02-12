import pool from '@/app/lib/db';

// ACTUALIZAR DECANO POR ID
export async function PUT(request) {
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
      'UPDATE decanos SET ocde_id = ?, grado = ?, nombreapellidodecano = ?, denominacion = ?, modelooficio = ?, estado = ? WHERE id = ?',
      [ocde_id, grado, nombreapellidodecano, denominacion, modelooficio, estado, id]
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

// Eliminar ORCID por ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM decanos WHERE id = ?', [id]);
    connection.release();

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Registro no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la eliminación:', error);
    return new Response(JSON.stringify({ error: 'Error en la eliminación' }), { status: 500 });
  }
}
