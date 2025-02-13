import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExcelUpload({ file}) {
  const [excelData, setExcelData] = useState({
    titulo: "", autor1: "", dniAutor1: "", autor2: "", dniAutor2: "",
    asesor: "", dniAsesor: "", orcid: "", grado: "", institucion: "",
    facultad: "", tipoTrabajo: "", jurado1: "", jurado2: "", jurado3: "",
    gradoAcademico: "", palabrasClave: "",
  });
  const [facultades, setFacultades] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        const getCellValue = (cell) => (firstSheet[cell] ? firstSheet[cell].v : "");

        setExcelData({
          titulo: getCellValue("C7"), autor1: getCellValue("C11"), dniAutor1: getCellValue("C14"),
          autor2: getCellValue("C16"), dniAutor2: getCellValue("C19"), asesor: getCellValue("C21"),
          dniAsesor: getCellValue("C24"), orcid: getCellValue("C26"), grado: getCellValue("C30"),
          institucion: getCellValue("B36"), facultad: getCellValue("C38"), tipoTrabajo: getCellValue("C42"),
          jurado1: getCellValue("C45"), jurado2: getCellValue("C46"), jurado3: getCellValue("C47"),
          gradoAcademico: getCellValue("C50"), palabrasClave: getCellValue("C53"),
        });
      };
      reader.readAsArrayBuffer(file);
    }

    fetch("/api/ocde") // Un nuevo endpoint para obtener facultades
    .then((res) => res.json())
    .then((data) => setFacultades(data));

  fetch("/api/orcid") // Un nuevo endpoint para obtener asesores
    .then((res) => res.json())
    .then((data) => setAsesores(data));
  }, [file]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExcelData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cargarexcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(excelData),
      });
      if (response.ok) {
        alert("Datos enviados correctamente");
      } else {
        alert("Error al enviar los datos");
      }
    } catch (error) {
      console.error(error);
      alert("Error al enviar los datos");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Datos del archivo</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(excelData).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}:</label>
            {key === "asesor" ? (
              <select name={key} value={value} onChange={handleChange} className="border p-2 rounded-md">
                <option value="">Seleccione un asesor</option>
                {asesores.map((ase) => (
                  <option key={ase.nombreapellido} value={ase.nombreapellido}>{ase.nombreapellido}</option>
                ))}
              </select>
            ) : key === "facultad" ? (
              <select name={key} value={value} onChange={handleChange} className="border p-2 rounded-md">
                <option value="">Seleccione una facultad</option>
                {facultades.map((fac) => (
                  <option key={fac.facultad} value={fac.facultad}>{fac.facultad}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name={key}
                value={value}
                onChange={handleChange}
                className="border p-2 rounded-md"
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Cargando..." : "Cargar Datos"}
      </button>
    </div>
  );
}
