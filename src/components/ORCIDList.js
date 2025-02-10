// src/app/components/ORCIDList.js
'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Modal from './Modal';

const ORCIDList = () => {
  const [orcidList, setORCIDList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingORCID, setEditingORCID] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/api/orcid')
      .then((response) => response.json())
      .then((data) => setORCIDList(data));
  }, []);

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      await fetch(`/api/orcid/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      setORCIDList(orcidList.filter((item) => item.id !== id));
    }
  };

  const handleAddOrUpdateORCID = async (formData) => {
    if (editingORCID) {
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
    setEditingORCID(null);
  };

  const handleEdit = (orcid) => {
    setEditingORCID(orcid);
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
          .catch((error) => console.error('Error al cargar el archivo:', error));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Descargar formato vacío
  const handleDownloadFormat = () => {
    const ws = XLSX.utils.json_to_sheet([
      { dni: '', 'nombreapellido': '', orcid: '' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Formato ORCID');
    XLSX.writeFile(wb, 'Formato_ORCID.xlsx');
  };

  // Descargar registros actuales
  const handleDownloadRecords = () => {
    if (orcidList.length === 0) {
      alert('No hay registros para descargar.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(orcidList.map(({ dni, nombreapellido, orcid }) => ({
      DNI: dni,
      'NOMBRE Y APELLIDO': nombreapellido,
      ORCID: orcid,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista ORCID');
    XLSX.writeFile(wb, 'Registros_ORCID.xlsx');
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
      <button onClick={handleDownloadFormat} style={{ marginLeft: '10px' }}>Descargar Formato</button>
      <button onClick={handleDownloadRecords} style={{ marginLeft: '10px' }}>Descargar Registros</button>

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
            (orcid.dni && orcid.dni?.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (orcid.nombreapellido && orcid.nombreapellido?.toLowerCase().includes(searchTerm.toLowerCase()))
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
            { name: 'dni', label: 'DNI', type: 'text', required: true },
            { name: 'nombreapellido', label: 'Nombre Apellido', type: 'text', required: true },
            { name: 'orcid', label: 'Orcid', type: 'text', required: true },
          ]}
          initialData={editingORCID}
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
