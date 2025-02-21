// src/app/components/ORCIDList.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "./Modal";
import * as XLSX from "xlsx";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const INVESTIGACIONESList = () => {
  const [investigacionesList, setINVESTIGACIONESList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingINVESTIGACIONES, setEditingINVESTIGACIONES] = useState(null); // Estado para la edición
  const [searchTerm, setSearchTerm] = useState("");
  const [facultades, setFacultades] = useState([]);
  const [asesores, setAsesores] = useState([]);
  useEffect(() => {
    
      fetch('/api/investigaciones')
          .then((res) => res.json())
          .then((data) => {
              console.log('Datos cargados:', data); // Verifica si hay datos en la consola
              setINVESTIGACIONESList(data);
          })
          .catch((error) => console.error('Error al cargar los datos:', error));
  
  

    fetch("/api/ocde") // Un nuevo endpoint para obtener facultades
      .then((res) => res.json())
      .then((data) => setFacultades(data));

    fetch("/api/orcid") // Un nuevo endpoint para obtener asesores
      .then((res) => res.json())
      .then((data) => setAsesores(data));

  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm("¿Estás seguro de eliminar este registro?");
    if (confirmDelete) {
      await fetch(`/api/investigaciones/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setINVESTIGACIONESList(
        investigacionesList.filter((item) => item.id !== id)
      );
    }
  };
  const handlePrint = (item) => {
   
    // Usar fetch para obtener el archivo binario
    fetch("/images/modelo.docx")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar el archivo");
        }
        return response.arrayBuffer();
      })
      .then((content) => {
        // Crear un PizZip a partir del contenido del archivo
        const zip = new PizZip(content);
  
        // Crear una instancia de Docxtemplater con el archivo cargado
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });
  
        // Pasar los datos dinámicos al documento
        doc.setData({
          fecha: item.fecha,
          numero_oficio: item.numero_oficio,
          decano: item.asesor,
          oficio_referencia: item.numero_oficio_referencia || 'No disponible',  // Valor por defecto
          codigo: item.codigo,
          titulo: item.titulo,
          autor: item.autor,
          dni_autor: item.dni_autor,
          similitud: item.porcentaje_similitud_oti,
          titulo_grado: item.titulo_grado,
          facultad: item.facultad,
          url: item.url,
          autoridad_firmante: item.asesor,
          cargo_autoridad: item.asesor,
        });
  
        try {
          // Renderizar el documento con los datos
          doc.render();
        } catch (renderError) {
          console.error("Error al renderizar el documento:", renderError);
          return;
        }
  
        // Exportar el archivo modificado
        const output = doc.getZip().generate({
          type: "blob",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
  
        // Descargar el archivo generado
        saveAs(output, `OFICIO N° ${item.numero_oficio}-2025-JEF-OTI-RI-UNCP.docx`);
      })
      .catch((error) => {
        console.error("Error al cargar el archivo:", error);
      });
  };
  const handleAddOrUpdateINVESTIGACIONES = async (formData) => {
    if (editingINVESTIGACIONES) {
      // Modo Edición
      const response = await fetch(`/api/investigaciones/${editingINVESTIGACIONES.id}`, {

        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedINVESTIGACIONES = await response.json();
        setINVESTIGACIONESList(
          investigacionesList.map((item) =>
            item.id === updatedINVESTIGACIONES.id ? updatedINVESTIGACIONES : item
          )
        );
      }
    } else {
      // Modo Creación
      const response = await fetch("/api/investigaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newINVESTIGACIONES = await response.json();
        setINVESTIGACIONESList([...investigacionesList, newINVESTIGACIONES]);
      }
    }
    setIsModalOpen(false);
    setEditingINVESTIGACIONES(null); // Resetear estado de edición
  };
  const filteredINVESTIGACIONESList = investigacionesList.filter(
    (investigaciones) =>
      (investigaciones.dni && investigaciones.dni.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (investigaciones.nombreapellido && investigaciones.nombreapellido.toLowerCase().includes(searchTerm.toLowerCase()))||
      (investigaciones.titulo && investigaciones.titulo.toLowerCase().includes(searchTerm.toLowerCase()))||
      (investigaciones.dni_autor && investigaciones.dni_autor.toLowerCase().includes(searchTerm.toLowerCase()))||
      (investigaciones.autor && investigaciones.autor.toLowerCase().includes(searchTerm.toLowerCase()))||
      (investigaciones.dni_autor2 && investigaciones.dni_autor2.toLowerCase().includes(searchTerm.toLowerCase()))||
      (investigaciones.autor2 && investigaciones.autor2.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (investigaciones) => {
    setEditingINVESTIGACIONES(investigaciones); // Cargar datos al estado de edición
    setIsModalOpen(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        fetch("/api/investigaciones/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json),
        })
          .then((response) => response.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setINVESTIGACIONESList([...investigacionesList, ...data]);
            } else {
              console.error("La respuesta de la API no es un array:", data);
            }
          })
          .catch((error) => {
            console.error("Error al cargar el archivo:", error);
          });
      };
      reader.readAsArrayBuffer(file);
    }
  };
  // Descargar formato vacío
        const handleDownloadFormat = () => {
          const ws = XLSX.utils.json_to_sheet([
            { facultad: '', 'grado': '', nombreapellidodecano: '', denominacion: '', modelooficio: '', estado: '' }
          ]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Formato DECANOS');
          XLSX.writeFile(wb, 'Formato_DECANOS.xlsx');
        };
      
        // Descargar registros actuales
        const handleDownloadRecords = () => {
          if (investigacionesList.length === 0) {
            alert('No hay registros para descargar.');
            return;
          }
          
          const ws = XLSX.utils.json_to_sheet(
            investigacionesList.map(({ codigo, titulo, autor, dni_autor, autor2, dni_autor2, orcid_nombreapellido, orcid_dni, fecha, titulo_grado, denominacion, facultad, ocde, tipo, codigoprograma, porcentaje_similitud_oti, porcentaje_similitud_asesor, jurado_1, jurado_2, jurado_3, nombreapellidodecano, numero_oficio_referencia, autorizacion, denominacion_si_no, titulo_si_no, tipo_tesis_si_no, porcentaje_reporte_tesis_si_no, observaciones, urllink, numero_oficio, palabrasclave, estado }) => ({
              'CÓDIGO': codigo,
              'TÍTULO': titulo,
              'AUTOR': autor,
              'DNI AUTOR': dni_autor,
              'AUTOR 2': autor2,
              'DNI AUTOR 2': dni_autor2,
              'ASESOR': orcid_nombreapellido,
              'DNI ASESOR': orcid_dni,
              'FECHA': fecha ? new Date(fecha).toLocaleDateString() : '',
              'TÍTULO GRADO': titulo_grado,
              'DENOMINACIÓN': denominacion,
              'FACULTAD': facultad,
              'OCDE': ocde,
              'TIPO': tipo,
              'CÓDIGO DE PROGRAMA': codigoprograma,
              'PORCENTAJE OTI': porcentaje_similitud_oti,
              'PORCENTAJE ASESOR': porcentaje_similitud_asesor,
              'JURADO 1': jurado_1,
              'JURADO 2': jurado_2,
              'JURADO 3': jurado_3,
              'AUTORIDAD FIRMANTE': nombreapellidodecano,
              'NÚMERO OFICIO REFERENCIA': numero_oficio_referencia,
              'AUTORIZACIÓN': autorizacion,
              'DENOMINACIÓN SI O NO': denominacion_si_no,
              'TÍTULO SI O NO': titulo_si_no,
              'TIPO TESIS SI O NO': tipo_tesis_si_no,
              'PORCENTAJE REPORTE SI O NO': porcentaje_reporte_tesis_si_no,
              'OBSERVACIONES': observaciones,
              'URL': urllink,
              'NÚMERO DE OFICIO': numero_oficio,
              'PALABRAS CLAVES': palabrasclave,
              'ESTADO': estado
            }))
          );
        
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Lista Investigaciones');
          XLSX.writeFile(wb, 'Registros_Investigaciones.xlsx');
        };
        
  

  return (
    <div>
      <h1>Lista de investigaciones</h1>
      <input
        type="text"
        placeholder="Buscar por DNI o Nombre y Apellido"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button onClick={() => setIsModalOpen(true)}>Agregar Nuevo</button>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ marginLeft: "10px" }}
      />
      <button onClick={handleDownloadFormat} style={{ marginLeft: '10px' }}>Descargar Formato</button>
      <button onClick={handleDownloadRecords} style={{ marginLeft: '10px' }}>Descargar Registros</button>
      <table>
        <thead>
          <tr>
            <th>N°</th>
            <th>CODIGO</th>
            <th>TITULO</th>
            <th>AUTOR</th>
            <th>DNI AUTOR</th>
            <th>AUTOR 2</th>
            <th>DNI AUTOR 2</th>
            <th>ASESOR</th>
            <th>DNI_ASESOR</th>
            <th>FECHA</th>
            <th>TITULO GRADO</th>
            <th>DENOMINACION</th>
            <th>FACULTAD</th>
            <th>OCDE</th>
            <th>TIPO</th>
            <th>CODIGO DE PROGRAMA</th>
            <th>PORCENTAJE OTI</th>
            <th>PORCENTAJE ASESOR</th>
            <th>JURADO 1</th>
            <th>JURADO 2</th>
            <th>JURADO 3</th>
            <th>AUTORIDAD FIRMANTE</th>
            <th>NUMERO OFICIO REFERENCIA</th>
            <th>AUTORIZACION</th>
            <th>DENOMINACION SI O NO</th>
            <th>TITULO SI O NO</th>
            <th>TIPO TESIS SI O NO</th>
            <th>PORCENTAJE REPORTE SI O NO</th>
            <th>OBSERVACIONES</th>
            <th>URL</th>
            <th>NUMERO DE OFICIO</th>
            <th>PALABRAS CLAVES</th>
            <th>ESTADO</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {investigacionesList
            .filter(
              (investigaciones) =>
                (investigaciones.orcid_dni && investigaciones.orcid_dni.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (investigaciones.nombreapellido && investigaciones.nombreapellido.toLowerCase().includes(searchTerm.toLowerCase()))||
                (investigaciones.titulo && investigaciones.titulo.toLowerCase().includes(searchTerm.toLowerCase()))||
                (investigaciones.dni_autor && investigaciones.dni_autor.toLowerCase().includes(searchTerm.toLowerCase()))||
                (investigaciones.autor && investigaciones.autor.toLowerCase().includes(searchTerm.toLowerCase()))||
                (investigaciones.dni_autor2 && investigaciones.dni_autor2.toLowerCase().includes(searchTerm.toLowerCase()))||
                (investigaciones.autor2 && investigaciones.autor2.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((investigaciones,index) => (
              <tr key={investigaciones.id}>
                <td>{index+1}</td>
                <td>{investigaciones.codigo}</td>
                <td>{investigaciones.titulo}</td>
                <td>{investigaciones.autor}</td>
                <td>{investigaciones.dni_autor}</td>
                <td>{investigaciones.autor2}</td>
                <td>{investigaciones.dni_autor2}</td>
                <td>{investigaciones.orcid_nombreapellido}</td>
                <td>{investigaciones.orcid_dni}</td>
                <td>{new Date(investigaciones.fecha).toISOString().split('T')[0]}</td>
                <td>{investigaciones.titulo_grado}</td>
                <td>{investigaciones.denominacion}</td>
                <td>{investigaciones.facultad}</td>
                <td>{investigaciones.ocde}</td>
                <td>{investigaciones.tipo}</td>
                <td>{investigaciones.codigoprograma}</td>
                <td>{investigaciones.porcentaje_similitud_oti}</td>
                <td>{investigaciones.porcentaje_similitud_asesor}</td>
                <td>{investigaciones.jurado_1}</td>
                <td>{investigaciones.jurado_2}</td>
                <td>{investigaciones.jurado_3}</td>
                <td>{investigaciones.nombreapellidodecano}</td>
                <td>{investigaciones.numero_oficio_referencia}</td>
                <td>{investigaciones.autorizacion}</td>
                <td>{investigaciones.denominacion_si_no}</td>
                <td>{investigaciones.titulo_si_no}</td>
                <td>{investigaciones.tipo_tesis_si_no}</td>
                <td>{investigaciones.porcentaje_reporte_tesis_si_no}</td>
                <td>{investigaciones.observaciones}</td>
                <td>{investigaciones.urllink}</td>
                <td>{investigaciones.numero_oficio}</td>
                <td>{investigaciones.palabrasclave}</td>
                <td>{investigaciones.estado}</td>
                <td>
                  <button onClick={() => handleEdit(investigaciones)}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(investigaciones.id)}>
                    Eliminar
                  </button>
                  <button onClick={() => handlePrint()}>
                    Imprimir
                  </button>
                </td>
              </tr>

            ))}
        </tbody>
      </table>

      {isModalOpen && (
        <Modal
          title={
            editingINVESTIGACIONES
              ? "Editar INVESTIGACIONES"
              : "Agregar INVESTIGACIONES"
          }
          fields={[
            { name: "titulo", label: "TITULO DE LA INVESTIGACION", type: "text", required: true },
            { name: "autor", label: "Nombre y Apellido del Autor 1", type: "text", required: true },
            { name: "dni_autor", label: "DNI del autor 1", type: "number", required: true },
            { name: "autor2", label: "Nombre y Apellido del Autor 2", type: "text",required: true },
            { name: "dni_autor2", label: "DNI del autor 2", type: "number" ,required: true},
            {
              name: "nombreapellido", label: "NOMBRE del asesor", type: "select", required: true,
              options: asesores.map((ase) => ({
                value: ase.nombreapellido,
                label: ase.nombreapellido,
              })),
            },
            { name: "fecha", label: "FECHA", type: "date", required: true },
            { name: "titulo_grado", label: "TITULO O GRADO", type: "text", required: true, },
            { name: "denominacion", label: "DENOMINACION", type: "text", required: true, },
            {
              name: "facultad", label: "FACULTAD", type: "select", required: true,
              options: facultades.map((fac) => ({
                value: fac.facultad,
                label: fac.facultad,
              })),
            },
            {
              name: "tipo",
              label: "TIPO DE TRABAJO",
              type: "select",
              required: true,
              options: [
                { value: 'TESIS', label: 'Tesis' },
                { value: 'PROYECTO DE INVESTIGACION', label: 'Proyecto de investigación' },
                { value: 'TRABAJO DE SUFICIENCIA PROFESIONAL', label: 'Trabajo de suficiencia profesional' }
              ]
            },
            {
              name: "porcentaje_similitud_oti",
              label: "PORCENTAJE SIMILITUD OTI",
              type: "number",
              required: true
            },
            {
              name: "porcentaje_similitud_asesor",
              label: "PORCENTAJE SIMILITUD ASESOR",
              type: "number",
              required: true
            },
            {
              name: "jurado_1",
              label: "JURADO N° 1",
              type: "text",
              required: true
            },
            {
              name: "jurado_2",
              label: "JURADO N° 2",
              type: "text",
              required: true
            },
            {
              name: "jurado_3",
              label: "JURADO N° 3",
              type: "text",
              required: true
            },
            {
              name: "numero_oficio_referencia",
              label: "N° DE OFICIO Referencia",
              type: "number",
              required: true
            },
            {
              name: "autorizacion",
              label: "AUTORIZACIÓN",
              type: "select",
              required: true,
              options: [
                { value: 'ABIERTO', label: 'Abierto' },
                { value: 'RESTRINGIDO', label: 'Restringido' },
                { value: 'CONFIDENCIAL', label: 'Confidencial' }
              ]
            },
            {
              name: "denominacion_si_no",
              label: "Denominación",
              type: "select",
              required: true,
              options: [
                { value: 'SI', label: 'Si' },
                { value: 'NO', label: 'No' }
              ]
            },
            {
              name: "titulo_si_no",
              label: "Título",
              type: "select",
              required: true,
              options: [
                { value: 'SI', label: 'Si' },
                { value: 'NO', label: 'No' }
              ]
            },
            {
              name: "tipo_tesis_si_no",
              label: "Tipo tesis",
              type: "select",
              required: true,
              options: [
                { value: 'SI', label: 'Si' },
                { value: 'NO', label: 'No' }
              ]
            },
            {
              name: "porcentaje_reporte_tesis_si_no",
              label: "Tipo porcentaje",
              type: "select",
              required: true,
              options: [
                { value: 'SI', label: 'Si' },
                { value: 'NO', label: 'No' }
              ]
            },
            {
              name: "observaciones",
              label: "OBSERVACIONES",
              type: "text",
              required: true,
            },
            {
              name: "urllink",
              label: "URL",
              type: "text",
              required: true,
            },
            {
              name: "numero_oficio",
              label: "NUMERO DE OFICIO",
              type: "number",
              required: true,
            },
            {
              name: "palabrasclave",
              label: "PALABRAS CLAVE",
              type: "text",
              required: true,
            },
            {
              name: "estado",
              label: "ESTADO",
              type: "select",
              required: true,
              options: [
                { value: 'OBSERVADO', label: 'Observado' },
                { value: 'POR ENVIAR', label: 'Por enviar' },
                { value: 'ENVIADO', label: 'Enviado' }
              ]
            }
          ]}
          initialData={editingINVESTIGACIONES} // Pasar datos existentes si estamos editando
          onClose={() => {
            setIsModalOpen(false);
            setEditingINVESTIGACIONES(null);
          }}
          onSubmit={handleAddOrUpdateINVESTIGACIONES}
        />
      )}
    </div>
  );
};

export default INVESTIGACIONESList;
