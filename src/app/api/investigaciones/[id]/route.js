import pool from '@/app/lib/db';

// ACTUALIZAR DECANO POR ID
export async function PUT(request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // Extraer el ID de la URL

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID no proporcionado' }), { status: 400 });
    }

    const {
      facultad, nombreapellido, titulo, autor, dni_autor, autor2, dni_autor2, fecha, titulo_grado, denominacion, tipo,
      porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2, jurado_3,
      numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no,
      porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado
    } = await request.json();

    const connection = await pool.getConnection();

    try {
      // Obtener ocde_id correspondiente a la facultad
      const [ocdeResult] = await connection.query('SELECT id FROM ocde WHERE facultad = ?', [facultad]);
      if (ocdeResult.length === 0) {
        return new Response(JSON.stringify({ error: 'Facultad no encontrada' }), { status: 400 });
      }
      const ocde_id = ocdeResult[0].id;

      // Obtener orcid_id correspondiente al asesor
      const [orcidResult] = await connection.query('SELECT id FROM orcid WHERE nombreapellido = ?', [nombreapellido]);
      if (orcidResult.length === 0) {
        return new Response(JSON.stringify({ error: 'Asesor no encontrado' }), { status: 400 });
      }
      const orcid_id = orcidResult[0].id;

      // Obtener decano_id correspondiente a la facultad
      const [decanoResult] = await connection.query(
        'SELECT d.id FROM decanos d JOIN ocde o ON d.ocde_id = o.id WHERE o.facultad = ?;',
        [facultad]
      );
      if (decanoResult.length === 0) {
        return new Response(JSON.stringify({ error: 'Facultad no encontrada' }), { status: 400 });
      }
      const decano_id = decanoResult[0].id;

      // Generar código basado en el grado académico
      let gradoCodigo = "";
      if (denominacion.toLowerCase().startsWith("especialista")) {
        gradoCodigo = "S";
      } else if (denominacion.toLowerCase().startsWith("maestro") || denominacion.toLowerCase().startsWith("maestra")) {
        gradoCodigo = "M";
      } else if (denominacion.toLowerCase().startsWith("doctor") || denominacion.toLowerCase().startsWith("doctora")) {
        gradoCodigo = "D";
      } else {
        gradoCodigo = "T";
      }

      // Generar los códigos para los autores
      const codigo1 = `T010_${dni_autor}_${gradoCodigo}`;
      const codigo2 = autor2 && dni_autor2 ? `T010_${dni_autor2}_${gradoCodigo}` : null;
      const codigo = codigo1 + (codigo2 ? `, ${codigo2}` : "");

      // Actualizar el registro en la base de datos
      const [result] = await connection.query(
        `UPDATE investigaciones SET 
          ocde_id=?, orcid_id=?, decano_id=?, codigo=?, titulo=?, autor=?, dni_autor=?, autor2=?, dni_autor2=?, fecha=?, 
          titulo_grado=?, denominacion=?, tipo=?, porcentaje_similitud_oti=?, porcentaje_similitud_asesor=?, 
          jurado_1=?, jurado_2=?, jurado_3=?, numero_oficio_referencia=?, autorizacion=?, 
          denominacion_si_no=?, titulo_si_no=?, tipo_tesis_si_no=?, porcentaje_reporte_tesis_si_no=?, 
          observaciones=?, urllink=?, numero_oficio=?, palabrasclave=?, estado=? 
        WHERE id=?`,
        [
          ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2, fecha, titulo_grado,
          denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2,
          jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no,
          porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado, id
        ]
      );

      if (result.affectedRows === 0) {
        return new Response(JSON.stringify({ error: 'Registro no encontrado' }), { status: 404 });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error en la actualización:', error);
      return new Response(JSON.stringify({ error: 'Error en la actualización' }), { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en la petición:', error);
    return new Response(JSON.stringify({ error: 'Error en la petición' }), { status: 500 });
  }
}


// Eliminar ORCID por ID
export async function DELETE(request) {
  try {
    // Obtener el ID desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // Extraer el último segmento de la URL

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID no válido' }), { status: 400 });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM investigaciones WHERE id = ?', [id]);
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

