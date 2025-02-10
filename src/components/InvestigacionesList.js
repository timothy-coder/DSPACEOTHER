// src/app/components/ORCIDList.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "./Modal";
import * as XLSX from "xlsx";

const INVESTIGACIONESList = () => {
  const [investigacionesList, setINVESTIGACIONESList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingINVESTIGACIONES, setEditingINVESTIGACIONES] = useState(null); // Estado para la edición
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    fetch("/api/investigaciones")
      .then((response) => response.json())
      .then((data) => setINVESTIGACIONESList(data));
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

  const handleAddOrUpdateINVESTIGACIONES = async (formData) => {
    if (editingINVESTIGACIONES) {
      // Modo Edición
      const response = await fetch(`/api/investigaciones/${editingORCID.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedINVESTIGACIONES = await response.json();
        setINVESTIGACIONESList(
          investigacionesList.map((item) =>
            item.id === updatedORCID.id ? updatedORCID : item
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
      (investigaciones.dni &&
        investigaciones.dni.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (investigaciones.nombreapellido &&
        investigaciones.nombreapellido
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
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
                (investigaciones.dni &&
                  investigaciones.dni
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())) ||
                (investigaciones.nombreapellido &&
                  investigaciones.nombreapellido
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
            )
            .map((investigaciones) => (
              <tr key={investigaciones.id}>
                <td>{investigaciones.id}</td>
                <td>{investigaciones.codigo}</td>
                <td>{investigaciones.titulo}</td>
                <td>{investigaciones.autor}</td>
                <td>{investigaciones.dni_autor}</td>
                <td>{investigaciones.autor2}</td>
                <td>{investigaciones.dni_autor2}</td>
                <td>{investigaciones.asesor}</td>
                <td>{investigaciones.dni_asesor}</td>
                <td>{investigaciones.fecha}</td>
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
                <td>{investigaciones.url}</td>
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
            {
              name: "autor",
              label: "Nombre y Apellido del Autor 1",
              type: "text",
              required: true,
            }, {
              name: "dni_autor",
              label: "DNI del autor 1",
              type: "text",
              required: true,
            },
            {
              name: "autor2",
              label: "Nombre y Apellido del Autor 2",
              type: "text",
              required: true,
            },
            {
              name: "dni_autor2",
              label: "DNI del autor 2",
              type: "text",
              required: true,
            },
            {
              name: "nombreapellido",
              label: "DNI del asesor",
              type: "text",
              required: true,
            },
            {
              name: "fecha",
              label: "FECHA",
              type: "text",
              required: true,
            },
            {
              name: "titulo",
              label: "TITULO O GRADO",
              type: "text",
              required: true,
            },
            {
              name: "denominacion",
              label: "DENOMINACION",
              type: "text",
              required: true,
            },
            {
              name: "facultad",
              label: "FACULTAD",
              type: "text",
              required: true,
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
              type: "text",
              required: true
            },
            {
              name: "porcentaje_similitud_asesor",
              label: "PORCENTAJE SIMILITUD ASESOR",
              type: "text",
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
              name: "nombreapellidodecano",
              label: "Autoridad firmante",
              type: "text",
              required: true
            },
            {
              name: "numerooficio",
              label: "N° DE OFICIO Referencia",
              type: "text",
              required: true
            },
            {
              name: "autorizacion",
              label: "AUTORIZACIÓN",
              type: "select",
              required: true,
              options: [
                { value: 'ABIERTA', label: 'Abierta' },
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
              type: "text",
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
              name: "url",
              label: "URL",
              type: "text",
              required: true,
            },
            {
              name: "numero de oficio",
              label: "NUMERO DE OFICIO",
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
