import pool from '@/app/lib/db';

// Obtener todos los registros
export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT i.*, o.facultad, o.ocde, o.codigoprograma,d.nombreapellidodecano FROM investigaciones i JOIN ocde o ON i.ocde_id = o.id JOIN decanos d ON i.decano_id = d.id; ');
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

        const { facultad, nombreapellido,codigo, titulo, autor, dni_autor, autor2, dni_autor2, fecha, titulo_grado, denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2, jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no, porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado } = await request.json();

        // Obtener ocde_id correspondiente a la facultad
        const connection = await pool.getConnection();
        const [ocdeResult] = await connection.query('SELECT id FROM ocde WHERE facultad = ?', [facultad]);

        if (ocdeResult.length === 0) {
            connection.release();
            return new Response(JSON.stringify({ error: 'Facultad no encontrada' }), { status: 400 });
        }

        const ocde_id = ocdeResult[0].id;

        // Obtener orcid_id correspondiente al asesor
        const connectionn = await pool.getConnection();
        const [orcidResult] = await connectionn.query('SELECT id FROM orcid WHERE dni_autor = ?', [nombreapellido]);

        if (orcidResult.length === 0) {
            connectionn.release();
            return new Response(JSON.stringify({ error: 'Asesor no encontrada' }), { status: 400 });
        }

        const orcid_id = orcidResult[0].id;
        // Obtener decano_id correspondiente a la facultad
        const connectionnn = await pool.getConnection();
        const [decanoResult] = await connectionnn.query('SELECT d.id FROM decanos d JOIN ocde o ON d.ocde_id = o.id WHERE o.facultad = ?;', [facultad]);

        if (decanoResult.length === 0) {
            connectionnn.release();
            return new Response(JSON.stringify({ error: 'Facultad no encontrada' }), { status: 400 });
        }

        const decano_id = decanoResult[0].id;


        // Actualizar decano con el ocde_id correcto
        const [result] = await connection.query(
            'INSERT INTO investigaciones (ocde_id,orcid_id,decano_id,codigo,titulo,autor,dni_autor,autor2,dni_autor2,fecha,titulo_grado,denominacion,tipo,porcentaje_similitud_oti,porcentaje_similitud_asesor,jurado_1,jurado_2,jurado_3,numero_oficio_referencia,autorizacion,denominacion_si_no,titulo_si_no,tipo_tesis_si_no,porcentaje_reporte_tesis_si_no,observaciones,urllink,numero_oficio,palabrasclave,estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2, fecha, titulo_grado, denominacion, tipo, porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2, jurado_3, numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no, porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado]
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
