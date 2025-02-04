// src/app/components/DECANOSList.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Modal from './Modal';
import * as XLSX from 'xlsx';

const DECANOSList = () => {
  const [decanosList, setDECANOSList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDECANOS, setEditingDECANOS] = useState(null); // Estado para la edición

  useEffect(() => {
    fetch('/api/decanos')
      .then((response) => response.json())
      .then((data) => setDECANOSList(data));
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm('¿Estás seguro de eliminar este registro?');
    if (confirmDelete) {
      await fetch(`/api/decanos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setDECANOSList(decanosList.filter((item) => item.id !== id));
    }
  };

  const handleAddOrUpdateDECANOS = async (formData) => {
    if (editingDECANOS) {
      // Modo Edición
      const response = await fetch(`/api/decanos/${editingDECANOS.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedDECANOS = await response.json();
        setDECANOSList(decanosList.map((item) => (item.id === updatedDECANOS.id ? updatedDECANOS : item)));
      }
    } else {
      // Modo Creación
      const response = await fetch('/api/decanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newDECANOS = await response.json();
        setDECANOSList([...decanosList, newDECANOS]);
      }
    }
    setIsModalOpen(false);
    setEditingDECANOS(null); // Resetear estado de edición
  };

  const handleEdit = (decanos) => {
    setEditingDECANOS(decanos); // Cargar datos al estado de edición
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

        fetch('/api/decanos/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        })
          .then((response) => response.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setDECANOSList([...decanosList, ...data]);
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
      <h1>Lista de DECANOS</h1>
      <button onClick={() => setIsModalOpen(true)}>Agregar Nuevo</button>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ marginLeft: '10px' }} />
      <table>
        <thead>
          <tr>
            <th>Facultad</th>
            <th>Grado</th>
            <th>NombreApellidoDecano</th>
            <th>Denominacion</th>
            <th>Modelo Oficio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {decanosList.map((decanos) => (
            <tr key={decanos.id}>
              <td>{decanos.facultad}</td>
              <td>{decanos.grado}</td>
              <td>{decanos.nombreapellidodecano}</td>
              <td>{decanos.denominacion}</td>
              <td>{decanos.modelooficio}</td>
              <td>{decanos.estado}</td>
              <td>
                <button onClick={() => handleEdit(decanos)}>Editar</button>
                <button onClick={() => handleDelete(decanos.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
          <Modal
          title={editingDECANOS ? 'Editar DECANOS' : 'Agregar DECANOS'}
          fields={[
            { name: 'facultad', label: 'Facultad', type: 'text', required: true },
            { name: 'grado', label: 'Grado', type: 'text', required: true },
            { name: 'nombreapellidodecano', label: 'Nombre y Apellido del Decano', type: 'text', required: true },
            { name: 'denominacion', label: 'Denominación', type: 'text', required: true },
            { name: 'modelooficio', label: 'Modelo de Oficio', type: 'text', required: true },
            { 
              name: 'estado', 
              label: 'Estado', 
              type: 'select', 
              required: true,
              options: [
                { value: 'DECANO', label: 'Decano' },
                { value: 'DIRECTOR', label: 'Director' }
              ]
            },
          ]}
          initialData={editingDECANOS} // Pasar datos existentes si estamos editando
          onClose={() => {
            setIsModalOpen(false);
            setEditingDECANOS(null);
          }}
          onSubmit={handleAddOrUpdateDECANOS}
        />
      
      
      )}
    </div>
  );
};

export default DECANOSList;
