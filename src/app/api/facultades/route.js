import pool from "@/app/lib/db";
export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM ocde');
    connection.release();
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en la consulta:', error);
    return new Response(JSON.stringify({ error: 'Error en la consulta' }), { status: 500 });
  }
}
