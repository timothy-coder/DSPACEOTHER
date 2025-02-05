// src/app/components/OCDEList.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "./Modal";
import * as XLSX from "xlsx";

const OCDEList = () => {
  const [ocdeList, setOCDEList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOCDE, setEditingOCDE] = useState(null); // Estado para la edición
  const [facultades, setFacultades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    fetch("/api/ocde") // Un nuevo endpoint para obtener facultades
      .then((res) => res.json())
      .then((data) => setFacultades(data));
  }, []);

  useEffect(() => {
    fetch("/api/ocde")
      .then((response) => response.json())
      .then((data) => setOCDEList(data));
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm("¿Estás seguro de eliminar este registro?");
    if (confirmDelete) {
      await fetch(`/api/ocde/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setOCDEList(ocdeList.filter((item) => item.id !== id));
    }
  };

  const handleAddOrUpdateOCDE = async (formData) => {
    if (editingOCDE) {
      // Modo Edición
      const response = await fetch(`/api/ocde/${editingOCDE.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedOCDE = await response.json();
        setOCDEList(
          ocdeList.map((item) =>
            item.id === updatedOCDE.id ? updatedOCDE : item
          )
        );
      }
    } else {
      // Modo Creación
      const response = await fetch("/api/ocde", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newOCDE = await response.json();
        setOCDEList([...ocdeList, newOCDE]);
      }
    }
    setIsModalOpen(false);
    setEditingOCDE(null); // Resetear estado de edición
  };

  const filteredOCDEList = ocdeList.filter((ocde) =>
    ocde.facultad?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEdit = (ocde) => {
    setEditingOCDE(ocde); // Cargar datos al estado de edición
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

        fetch("/api/ocde/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json),
        })
          .then((response) => response.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setOCDEList([...ocdeList, ...data]);
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
      <h1>Lista de OCDE</h1>
      <input
        type="text"
        placeholder="Buscar por Facultad"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "10px" }}
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
            <th>Facultad</th>
            <th>OCDE</th>
            <th>Código de Programa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ocdeList
            .filter((ocde) =>
              ocde.facultad?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((ocde) => (
              <tr key={ocde.id}>
                <td>{ocde.facultad}</td>
                <td>{ocde.ocde}</td>
                <td>{ocde.codigoprograma}</td>
                <td>
                  <button onClick={() => handleEdit(ocde)}>Editar</button>
                  <button onClick={() => handleDelete(ocde.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {isModalOpen && (
        <Modal
          title={editingOCDE ? "Editar OCDE" : "Agregar OCDE"}
          fields={[
            {
              name: "facultad",
              label: "Facultad",
              type: "text",
              required: true,
            },
            { name: "ocde", label: "OCDE", type: "text", required: true },
            {
              name: "codigoprograma",
              label: "Código de Programa",
              type: "text",
              required: true,
            },
          ]}
          initialData={editingOCDE} // Pasar datos existentes si estamos editando
          onClose={() => {
            setIsModalOpen(false);
            setEditingOCDE(null);
          }}
          onSubmit={handleAddOrUpdateOCDE}
        />
      )}
    </div>
  );
};

export default OCDEList;
