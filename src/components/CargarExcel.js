// src/app/components/OCDEList.js
"use client";
import { useState } from "react";
import ExcelUpload from "../components/ExcelUpload";


export default function CargarExcel() {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#ecf0f1" }}>
        <h2 className="text-2xl font-bold mb-4">Cargar Archivo Excel</h2>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="mb-4" />
        {uploadedFile && <ExcelUpload file={uploadedFile} />}
      </div>
    </>
  );
}
