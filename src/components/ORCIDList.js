// src/app/components/ORCIDList.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Modal from './Modal';
import * as XLSX from 'xlsx';

const ORCIDList = () => {
  const [orcidList, setORCIDList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingORCID, setEditingORCID] = useState(null); // Estado para la edición
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    fetch('/api/orcid')
      .then((response) => response.json())
      .then((data) => setORCIDList(data));
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm('¿Estás seguro de eliminar este registro?');
    if (confirmDelete) {
      await fetch(`/api/orcid/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setORCIDList(orcidList.filter((item) => item.id !== id));
    }
  };

  const handleAddOrUpdateORCID = async (formData) => {
    if (editingORCID) {
      // Modo Edición
      const response = await fetch(`/api/orcid/${editingORCID.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedORCID = await response.json();
        setORCIDList(orcidList.map((item) => (item.id === updatedORCID.id ? updatedORCID : item)));
      }
    } else {
      // Modo Creación
      const response = await fetch('/api/orcid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newORCID = await response.json();
        setORCIDList([...orcidList, newORCID]);
      }
    }
    setIsModalOpen(false);
    setEditingORCID(null); // Resetear estado de edición
  };
  const filteredORCIDList = orcidList.filter((orcid) =>
    (orcid.dni && orcid.dni.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (orcid.nombreapellido && orcid.nombreapellido.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleEdit = (orcid) => {
    setEditingORCID(orcid); // Cargar datos al estado de edición
    setIsModalOpen(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        fetch('/api/orcid/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        })
          .then((response) => response.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setORCIDList([...orcidList, ...data]);
            } else {
              console.error('La respuesta de la API no es un array:', data);
            }
          })
          .catch((error) => {
            console.error('Error al cargar el archivo:', error);
          });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <h1>Lista de ORCID</h1>
      <input
  type="text"
  placeholder="Buscar por DNI o Nombre y Apellido"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

      <button onClick={() => setIsModalOpen(true)}>Agregar Nuevo</button>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ marginLeft: '10px' }} />
      <table>
        <thead>
          <tr>
            <th>DNI</th>
            <th>NOMBRE Y APELLIDO</th>
            <th>ORCID</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
        {orcidList.filter((orcid) =>
    (orcid.dni && orcid.dni.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (orcid.nombreapellido && orcid.nombreapellido.toLowerCase().includes(searchTerm.toLowerCase()))
  ).map((orcid) => (
            <tr key={orcid.id}>
              <td>{orcid.dni}</td>
              <td>{orcid.nombreapellido}</td>
              <td>{orcid.orcid}</td>
              <td>
                <button onClick={() => handleEdit(orcid)}>Editar</button>
                <button onClick={() => handleDelete(orcid.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <Modal
          title={editingORCID ? 'Editar ORCID' : 'Agregar ORCID'}
          fields={[
            { name: 'dni', label: 'Facultad', type: 'text', required: true },
            { name: 'nombreapellido', label: 'Nombre Apellido', type: 'text', required: true },
            { name: 'orcid', label: 'Orcid', type: 'text', required: true },
          ]}
          initialData={editingORCID} // Pasar datos existentes si estamos editando
          onClose={() => {
            setIsModalOpen(false);
            setEditingORCID(null);
          }}
          onSubmit={handleAddOrUpdateORCID}
        />
      )}
    </div>
  );
};

export default ORCIDList;
