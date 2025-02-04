// src/app/api/facultades/route.js
import pool from '@/app/lib/db';

export async function GET(req) {
  try {
    // Realiza la consulta
    const result = await pool.query('SELECT id, facultad FROM ocde');
    
    // Verifica si hay datos antes de enviar la respuesta
    if (result.rows.length === 0) {
      console.error('No facultades found.');
      return new Response('No facultades found', { status: 404 });
    }

    const facultades = result.rows; // Datos obtenidos de la consulta
    
    // Responde con los datos
    return new Response(JSON.stringify(facultades), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching facultades:', error);
    return new Response('Error fetching facultades', { status: 500 });
  }
}
