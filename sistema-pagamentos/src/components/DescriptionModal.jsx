// src/components/DescriptionModal.jsx
import React from 'react';
import styles from './DescriptionModal.module.css';

function DescriptionModal({ isOpen, onClose, description }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Descrição Completa</h2>
        <p className={styles.descriptionText}>
          {description}
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.closeButton}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default DescriptionModal;