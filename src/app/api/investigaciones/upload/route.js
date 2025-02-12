import pool from '@/app/lib/db';

export async function POST(request) {
    try {
        const data = await request.json();
        const connection = await pool.getConnection();

        // Insertar múltiples registros
        const results = await Promise.all(
            data.map(async (item) => {
                const {
                    facultad, nombreapellido, titulo, autor, dni_autor, autor2, dni_autor2, fecha, titulo_grado, denominacion, tipo,
                    porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2, jurado_3,
                    numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no,
                    porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado
                } = item;

                // Obtener conexión a la base de datos
                const connection = await pool.getConnection();

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

                // **Convertir la fecha al formato YYYY-MM-DD**
                const formattedFecha = fecha ? new Date(fecha).toISOString().split('T')[0] : null;

                // Generar el código basado en el grado académico
                let gradoCodigo = "";
                if (denominacion.toLowerCase().startsWith("especialista")) {
                    gradoCodigo = "S";
                } else if (denominacion.toLowerCase().startsWith("maestro") || denominacion.toLowerCase().startsWith("maestra")) {
                    gradoCodigo = "M";
                } else if (denominacion.toLowerCase().startsWith("doctor") || denominacion.toLowerCase().startsWith("doctora")) {
                    gradoCodigo = "D";
                } else {
                    gradoCodigo = "T"; // Si no es especialista, maestro, maestra, doctor o doctora, asignamos 'T'
                }

                // Generar los códigos para los autores
                const codigo1 = `T010_${dni_autor}_${gradoCodigo}`;
                const codigo2 = autor2 && dni_autor2 ? `T010_${dni_autor2}_${gradoCodigo}` : null;
                const codigo = codigo1 + (codigo2 ? `, ${codigo2}` : "");

                // Insertar la investigación en la base de datos
                const [result] = await connection.query(
                    'INSERT INTO investigaciones (ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2, fecha, titulo_grado, denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2, jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no, porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2, formattedFecha, titulo_grado,
                        denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2,
                        jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no,
                        porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado
                    ]
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
