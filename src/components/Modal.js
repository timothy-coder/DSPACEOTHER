import { useState, useEffect } from 'react';
import styles from './Modal.module.css';

const Modal = ({ title, fields, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      const formattedData = { ...initialData };

      // Convertir la fecha al formato yyyy-MM-dd si es necesario
      Object.keys(formattedData).forEach((key) => {
        if (fields.find((field) => field.name === key && field.type === 'date')) {
          formattedData[key] = formattedData[key] ? formattedData[key].split('T')[0] : '';
        }
      });

      setFormData(formattedData);
    } else {
      setFormData({});
    }
  }, [initialData, fields]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        <div className={styles.modalContent}> {/* Contenedor scrollable */}
          <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <div key={index} className={styles.formGroup}>
                <label htmlFor={field.name}>{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required || false}
                  >
                    <option value="">Seleccione...</option>
                    {field.options?.map((option, index) => (
                      <option key={option.value || index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={formData[field.name] || false}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] ?? ''}
                    onChange={handleChange}
                    required={field.required || false}
                  />
                )}
              </div>
            ))}
          </form>
        </div>
        <div className={styles.buttonGroup}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitButton} onClick={handleSubmit}>
            {initialData ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
