// src/app/components/DecanosList.js
'use client'; // Necesario para usar hooks en el App Router

import { useEffect, useState } from 'react';

const DecanosList = () => {
  const [decanos, setDecanos] = useState([]);



  return (
    <div>
      <h1>Lista de Decanos</h1>
      <ul>
        {decanos.map(decano => (
          <li key={decano.id}>{decano.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default DecanosList;