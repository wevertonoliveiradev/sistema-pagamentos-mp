import React from 'react';
import styles from './PaymentDetailsModal.module.css';

function PaymentDetailsModal({ isOpen, onClose, payment }) {
  if (!isOpen || !payment) {
    return null;
  }

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Detalhes do Pagamento</h2>
        <div className={styles.detailsGrid}>
          <strong>Cliente:</strong><span>{payment.clientName}</span>
          <strong>Valor:</strong><span>{formatCurrency(payment.value)}</span>
          <strong>Status:</strong><span>{payment.status}</span>
          <strong>Data da Live:</strong><span>{formatDate(payment.liveDate)}</span>
          <strong>Descrição:</strong><p>{payment.description}</p>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.closeButton}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailsModal;