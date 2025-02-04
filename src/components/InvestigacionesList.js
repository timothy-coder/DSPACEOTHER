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
            <th>oCDE_ID</th>
            <th>ORCID_ID</th>
            <th>DECANO_ID</th>
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
            <th>TIPO</th>
            <th>PORCENTAJE OTI</th>
            <th>PORCENTAJE ASESOR</th>
            <th>JURADO 1</th>
            <th>JURADO 2</th>
            <th>JURADO 3</th>
            <th>NUMERO OFICIO REFERENCIA</th>
            <th>AUTORIZACION</th>
            <th>DENOMINACION SI O NO</th>
            <th>TITULO SI O NO</th>
            <th>TIPO TESIS SI O NO</th>
            <th>PORCENTAJE REPORTE SI O NO</th>
            <th>OBSERVACIONES</th>
            <th>URL</th>
            <th>NUMERO DE OFICIO</th>
            <th>CLAVES</th>
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
                <td>{investigaciones.dni}</td>
                <td>{investigaciones.dni}</td>
                <td>{investigaciones.dni}</td>
                <td>{investigaciones.dni}</td>
                <td>{investigaciones.nombreapellido}</td>
                <td>{investigaciones.orcid}</td>
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
            { name: "dni", label: "Facultad", type: "text", required: true },
            {
              name: "nombreapellido",
              label: "Nombre Apellido",
              type: "text",
              required: true,
            },
            { name: "orcid", label: "Orcid", type: "text", required: true },
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
