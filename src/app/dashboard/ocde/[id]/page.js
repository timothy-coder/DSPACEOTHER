// src/app/dashboard/ocde/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import React from 'react';

const EditOCDEPage = () => {
  const router = useRouter();
  const params = useParams(); // Obtener los parámetros de la ruta
  const id = params.id; // Acceder al ID de la ruta

  const [ocde, setOCDE] = useState({ facultad: '', ocde: '', codigoprograma: '' });

  useEffect(() => {
    if (id !== 'new') {
      fetch(`/api/ocde?id=${id}`)
        .then((response) => response.json())
        .then((data) => setOCDE(data[0]));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = id === 'new' ? 'POST' : 'PUT';
    const response = await fetch('/api/ocde', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...ocde }),
    });
    if (response.ok) {
      router.push('/dashboard/ocde');
    }
  };

  return (
    <div>
      <h1>{id === 'new' ? 'Agregar OCDE' : 'Editar OCDE'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Facultad:
          <input
            type="text"
            value={ocde.facultad}
            onChange={(e) => setOCDE({ ...ocde, facultad: e.target.value })}
          />
        </label>
        <label>
          OCDE:
          <input
            type="text"
            value={ocde.ocde}
            onChange={(e) => setOCDE({ ...ocde, ocde: e.target.value })}
          />
        </label>
        <label>
          Código de Programa:
          <input
            type="text"
            value={ocde.codigoprograma}
            onChange={(e) => setOCDE({ ...ocde, codigoprograma: e.target.value })}
          />
        </label>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default EditOCDEPage;