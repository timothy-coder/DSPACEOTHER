import pool from '@/app/lib/db';

// Obtener todos los registros
export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT i.*, o.facultad, o.ocde, o.codigoprograma, d.nombreapellidodecano, orcid.id AS orcid_id, orcid.dni AS orcid_dni, orcid.nombreapellido AS orcid_nombreapellido, orcid.orcid AS orcid_codigo FROM investigaciones i JOIN ocde o ON i.ocde_id = o.id JOIN decanos d ON i.decano_id = d.id JOIN orcid ON i.orcid_id = orcid.id; ');
        connection.release();
        return new Response(JSON.stringify(rows), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error en la consulta:', error);
        return new Response(JSON.stringify({ error: 'Error en la consulta' }), { status: 500 });
    }
}


export async function POST(request) {
    try {
        const url = new URL(request.url);
        const id = url.pathname.split('/').pop(); // Extraer el ID de la URL

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID no proporcionado' }), { status: 400 });
        }

        const {
            facultad, nombreapellido, titulo, autor,dni_autor, autor2, dni_autor2, fecha, titulo_grado, denominacion, tipo,
            porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2, jurado_3,
            numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no,
            porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado
        } = await request.json();

        // Obtener conexión a la base de datos
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

            // Generar el código basado en el grado académico
            let gradoCodigo = "";
            if (titulo_grado.toLowerCase().startsWith("especialista")) {
                gradoCodigo = "S";
            } else if (titulo_grado.toLowerCase().startsWith("maestro") || titulo_grado.toLowerCase().startsWith("maestra")) {
                gradoCodigo = "M";
            } else if (titulo_grado.toLowerCase().startsWith("doctor") || titulo_grado.toLowerCase().startsWith("doctora")) {
                gradoCodigo = "D";
            } else {
                gradoCodigo = "T"; // Si no es especialista, maestro, maestra, doctor o doctora, asignamos 'T'
            }

            // Generar los códigos para los autores
            const codigo1 = `T010_${dni_autor}_${gradoCodigo}`; // Código para el primer autor
            const codigo2 = autor2 && dni_autor2 ? `T010_${dni_autor2}_${gradoCodigo}` : null; // Código para el segundo autor (si existe)
            const codigo=codigo1 + (codigo2 ? `, ${codigo2}` : "");
            // Insertar la investigación en la base de datos
            const [result] = await connection.query(
                `INSERT INTO investigaciones (
                    ocde_id, orcid_id, decano_id, codigo, titulo, autor,dni_autor, autor2, dni_autor2, fecha,
                    titulo_grado, denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor,
                    jurado_1, jurado_2, jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no,
                    titulo_si_no, tipo_tesis_si_no, porcentaje_reporte_tesis_si_no, observaciones, urllink,
                    numero_oficio, palabrasclave, estado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    ocde_id, orcid_id, decano_id, codigo, titulo, autor,dni_autor, autor2, dni_autor2, fecha, titulo_grado,
                    denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2,
                    jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no,
                    porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado
                ]
            );

            if (result.affectedRows === 0) {
                return new Response(JSON.stringify({ error: 'Registro no insertado' }), { status: 404 });
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' },
            });
        } finally {
            connection.release(); // Liberar la conexión dentro del bloque `finally`
        }
    } catch (error) {
        console.error('Error en la inserción:', error);
        return new Response(JSON.stringify({ error: 'Error en la inserción' }), { status: 500 });
    }
}
