import pool from '@/app/lib/db';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const {
      titulo, autor, dni_autor, autor2, dni_autor2, nombreapellido, facultad,
      grado, tipoTrabajo, jurado1, jurado2, jurado3, gradoAcademico, palabrasClave,
    } = req.body;

    // Generar código basado en el grado académico
    let gradoCodigo = gradoAcademico.toLowerCase().startsWith("especialista") ? "S" :
                      gradoAcademico.toLowerCase().startsWith("maestro") || gradoAcademico.toLowerCase().startsWith("maestra") ? "M" :
                      gradoAcademico.toLowerCase().startsWith("doctor") || gradoAcademico.toLowerCase().startsWith("doctora") ? "D" : "T";

    // Generar código de investigación
    const codigo1 = `T010_${dni_autor}_${gradoCodigo}`;
    const codigo2 = autor2 && dni_autor2 ? `T010_${dni_autor2}_${gradoCodigo}` : null;
    const codigo = codigo1 + (codigo2 ? `, ${codigo2}` : "");

    // Obtener ocde_id por facultad
    const [ocdeResult] = await pool.query("SELECT id FROM ocde WHERE facultad = ?", [facultad]);
    if (ocdeResult.length === 0) return res.status(400).json({ message: "No se encontraron valores de OCDE." });
    const ocde_id = ocdeResult[0].id;

    // Obtener orcid_id del asesor
    const [asesorResult] = await pool.query("SELECT id FROM orcid WHERE nombreapellido = ?", [nombreapellido]);
    if (asesorResult.length === 0) return res.status(400).json({ message: "No se encontraron datos del asesor." });
    const orcid_id = asesorResult[0].id;

    // Obtener decano_id basado en la facultad
    const [decanoResult] = await pool.query("SELECT id FROM decanos WHERE ocde_id = ?", [ocde_id]);
    if (decanoResult.length === 0) return res.status(400).json({ message: "No se encontró un decano para la facultad." });
    const decano_id = decanoResult[0].id;

    // Insertar en la base de datos
    await pool.query(
      `INSERT INTO investigaciones 
      (ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2, asesor, dni_asesor, titulo_grado, denominacion, tipo, jurado_1, jurado_2, jurado_3, palabrasclave, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Por Enviar')`,
      [ocde_id, orcid_id, decano_id, codigo, titulo, autor, dni_autor, autor2, dni_autor2, orcid_nombreapellido, dniAsesor, grado, gradoAcademico, tipoTrabajo, jurado1, jurado2, jurado3, palabrasClave]
    );

    res.status(200).json({ message: "Datos insertados correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al insertar los datos" });
  }
}
