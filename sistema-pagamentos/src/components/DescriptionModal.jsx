import React from 'react';
import styles from './DescriptionModal.module.css';

function DescriptionModal({ isOpen, onClose, description }) {
  if (!isOpen) {
    return null;
  }

  // --- NOVA LÓGICA DE INTERPRETAÇÃO DE TEXTO ---
  const parseDescription = (text) => {
    if (!text) return [];

    // 1. Usa uma expressão regular para encontrar todos os preços no formato "R$ XX,XX"
    const prices = text.match(/R\$ ?\d+,\d{2}/g) || [];
    
    // 2. Separa o texto em blocos usando os preços como delimitadores
    const descriptions = text.split(/R\$ ?\d+,\d{2}/g);

    // 3. Junta as descrições com seus respectivos preços
    const items = [];
    for (let i = 0; i < prices.length; i++) {
      // Limpa a descrição, removendo quebras de linha e espaços extras
      const desc = (descriptions[i] || '').replace(/\n/g, ' ').trim();
      const price = prices[i];
      if (desc) { // Adiciona apenas se a descrição não estiver vazia
        items.push({ id: i, desc, price });
      }
    }
    return items;
  };

  const items = parseDescription(description);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Descrição Completa</h2>
        <div className={styles.descriptionContainer}>
          {items.length > 0 ? (
            items.map(item => (
              <div key={item.id} className={styles.itemRow}>
                <span className={styles.itemDesc}>{item.desc}</span>
                <span className={styles.itemPrice}>{item.price}</span>
              </div>
            ))
          ) : (
            // Caso a lógica falhe ou a descrição não tenha preços, mostra o texto original
            <p className={styles.rawText}>{description}</p>
          )}
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.closeButton}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default DescriptionModal;