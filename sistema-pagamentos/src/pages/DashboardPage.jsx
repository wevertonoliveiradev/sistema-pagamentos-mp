// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import PaymentList from '../components/PaymentList';
import PaymentModal from '../components/PaymentModal'; // Importa o novo modal

import styles from './DashboardPage.module.css';

function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para ser chamada quando um pagamento for criado com sucesso
  const handlePaymentCreated = () => {
    setIsModalOpen(false); // Fecha o modal
    // Futuramente, podemos adicionar uma notificação de sucesso aqui
  };

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.header}>
       
        <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
          Gerar Novo Pagamento
        </button>
      </header>

      {/* Adiciona o modal à página, controlando sua visibilidade */}
      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <hr className={styles.divider} />
      <PaymentList />
    </div>
  );
}

export default DashboardPage;