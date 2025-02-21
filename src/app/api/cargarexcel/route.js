import pool from '@/app/lib/db';

export async function POST(request) {
  try {
    const {
      titulo, autor, dni_autor, autor2, dni_autor2, asesor, dni_asesor, orcid, denominacion, facultad, tipo,
      jurado_1, jurado_2, jurado_3, titulo_grado, palabrasClave
    } = await request.json();

    if (!titulo || !autor || !dni_autor || !asesor || !dni_asesor || !facultad) {
      return new Response(JSON.stringify({ error: 'Datos insuficientes' }), { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      // Obtener ocde_id correspondiente a la facultad
      const [ocdeResult] = await connection.query('SELECT id FROM ocde WHERE facultad = ?', [facultad]);
      if (ocdeResult.length === 0) {
        return new Response(JSON.stringify({ error: 'Facultad no encontrada' }), { status: 400 });
      }
      const ocde_id = ocdeResult[0].id;

      // Obtener orcid_id correspondiente al asesor
      const [orcidResult] = await connection.query('SELECT id FROM orcid WHERE dni = ?', [dni_asesor]);
      if (orcidResult.length === 0) {
        return new Response(JSON.stringify({ error: 'Asesor no encontrado' }), { status: 400 });
      }
      const orcid_id = orcidResult[0].id;

      // Obtener decano_id correspondiente a la facultad
      const [decanoResult] = await connection.query(
        'SELECT d.id FROM decanos d JOIN ocde o ON d.ocde_id = o.id WHERE o.facultad = ?',
        [facultad]
      );
      if (decanoResult.length === 0) {
        return new Response(JSON.stringify({ error: 'Decano no encontrado' }), { status: 400 });
      }
      const decano_id = decanoResult[0].id;

      // Generar código basado en el grado académico
      let gradoCodigo = denominacion.toLowerCase().startsWith("especialista") ? "S" :
                        denominacion.toLowerCase().startsWith("maestro") || denominacion.toLowerCase().startsWith("maestra") ? "M" :
                        denominacion.toLowerCase().startsWith("doctor") || denominacion.toLowerCase().startsWith("doctora") ? "D" : "T";
      
      const codigo1 = `T010_${dni_autor}_${gradoCodigo}`;
      const codigo2 = autor2 && dni_autor2 ? `T010_${dni_autor2}_${gradoCodigo}` : null;
      const codigo = codigo1 + (codigo2 ? `, ${codigo2}` : "");

      // Insertar la investigación en la base de datos
      const [result] = await connection.query(
        `INSERT INTO investigaciones (
          ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2,
          titulo_grado, denominacion, tipo, jurado_1, jurado_2, jurado_3,autorizacion,denominacion_si_no,
            titulo_si_no, tipo_tesis_si_no, porcentaje_reporte_tesis_si_no, palabrasclave, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,'Abierto', 'Si','Si','Si','Si',?, 'Por Enviar')`,
        [ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2,
         titulo_grado, denominacion, tipo, jurado_1, jurado_2, jurado_3, palabrasClave]
      );

      if (result.affectedRows === 0) {
        return new Response(JSON.stringify({ error: 'No se pudo insertar el registro' }), { status: 500 });
      }

      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en la inserción:', error);
    return new Response(JSON.stringify({ error: 'Error en el servidor' }), { status: 500 });
  }
}
          /* Insertar la investigación en la base de datos
          const [result] = await connection.query(
              `INSERT INTO investigaciones (
                  ocde_id, orcid_id, decano_id, codigo, titulo, autor,dni_autor, autor2, dni_autor2, fecha,
                  titulo_grado, denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor,
                  jurado_1, jurado_2, jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no,
                  titulo_si_no, tipo_tesis_si_no, porcentaje_reporte_tesis_si_no, observaciones, urllink,
                  numero_oficio, palabrasclave, estado
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                  ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2, fecha, titulo_grado,
                  denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2,
                  jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no,
                  porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado
              ]
          );*/
