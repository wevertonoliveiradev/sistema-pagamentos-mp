// src/components/ClientFormModal.jsx

import React, { useState, useEffect } from 'react';
import styles from './ClientFormModal.module.css';

function ClientFormModal({ isOpen, onClose, onSave, client }) {
  const [formData, setFormData] = useState({ name: '', whatsapp: '', instagram: '' });

  // useEffect para atualizar o formulário quando um cliente é passado para edição
  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      // Limpa o formulário se não houver cliente (modo de criação)
      setFormData({ name: '', whatsapp: '', instagram: '' });
    }
  }, [client, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      name_lowercase: formData.name.toLowerCase() 
    });
};

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{client ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome do Cliente</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="whatsapp">WhatsApp (com DDD)</label>
            <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="11987654321" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="instagram">@Instagram (opcional)</label>
            <input type="text" id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@usuario" />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientFormModal;