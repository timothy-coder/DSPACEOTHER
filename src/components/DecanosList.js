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
  const [facultades, setFacultades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/api/decanos')
      .then((response) => response.json())
      .then((data) => setDECANOSList(data));
  }, []);
  useEffect(() => {
    fetch("/api/ocde") // Un nuevo endpoint para obtener facultades
      .then((res) => res.json())
      .then((data) => setFacultades(data));
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
        if (decanosList.length === 0) {
          alert('No hay registros para descargar.');
          return;
        }
        const ws = XLSX.utils.json_to_sheet(decanosList.map(({ facultad, grado, nombreapellidodecano,denominacion,modelooficio,estado }) => ({
          FACULTAD: facultad,
          'GRADO': grado,
          'NOMBRE Y APELLIDO DEL DECANO': nombreapellidodecano,
          'DENOMINACION': denominacion,
          'MODELO DE OFICIO': modelooficio,
          'DIRECTOR O DECANO DE FACULTAD': estado,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lista DECANOS');
        XLSX.writeFile(wb, 'Registros_DECANOS.xlsx');
      };



  return (
    <div>
      <h1>Lista de DECANOS</h1>
      <input
        type="text"
        placeholder="Buscar por Facultad"
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
          {decanosList.filter((decanos) =>
            (decanos.facultad && decanos.facultad?.toLowerCase().includes(searchTerm.toLowerCase()))
          ).map((decanos) => (
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
            
            {
              name: "facultad",
              label: "Facultad",
              type: "select",
              required: true,
              options: facultades.map((fac) => ({
                value: fac.facultad,
                label: fac.facultad,
              })),
              
            },
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
