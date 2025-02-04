import pool from '@/app/lib/db';

// Actualizar ORCID por ID
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { ocde_id, grado, nombreapellidodecano,denominacion,modelooficio,estado } = await request.json();

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE decanos SET ocde_id = ?, grado = ?, nombreapellidodecano = ?,denominacion = ?,modelooficio = ?,estado = ? WHERE id = ?',
      [ocde_id, grado, nombreapellidodecano,denominacion,modelooficio,estado, id]
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
