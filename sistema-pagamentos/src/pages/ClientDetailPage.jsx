import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './ClientDetailPage.module.css';

function ClientDetailPage() {
  const { clientId } = useParams(); // Pega o ID do cliente da URL
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ approved: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função para buscar os dados do cliente e seus pagamentos
    const fetchData = async () => {
      setIsLoading(true);
      
      // 1. Busca os dados do cliente
      const clientRef = doc(db, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);

      if (clientSnap.exists()) {
        setClient(clientSnap.data());

        // 2. Busca os pagamentos associados a este cliente
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        );
        const paymentsSnap = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnap.docs.map(doc => doc.data());
        setPayments(paymentsData);

        // 3. Calcula o resumo (saldo)
        const approvedTotal = paymentsData
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + p.value, 0);
        
        const pendingTotal = paymentsData
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.value, 0);

        setSummary({ approved: approvedTotal, pending: pendingTotal });

      } else {
        console.error("Cliente não encontrado!");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [clientId]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return <p>Carregando dados do cliente...</p>;
  }

  if (!client) {
    return (
      <div>
        <h2>Cliente não encontrado</h2>
        <Link to="/clientes">Voltar para a lista de clientes</Link>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Extrato de {client.name}</h1>
        <Link to="/clientes" className={styles.backButton}>Voltar</Link>
      </header>
      
      <div className={styles.summaryContainer}>
        <div className={`${styles.summaryCard} ${styles.approved}`}>
          <span>Total Aprovado</span>
          <strong>{formatCurrency(summary.approved)}</strong>
        </div>
        <div className={`${styles.summaryCard} ${styles.pending}`}>
          <span>Total Pendente</span>
          <strong>{formatCurrency(summary.pending)}</strong>
        </div>
      </div>

      <div className={styles.paymentsTable}>
        <h3>Histórico de Pagamentos</h3>
        <table>
          <thead>
            <tr>
              <th>Data da Live</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={index}>
                <td>{formatDateToDDMMYYYY(payment.liveDate)}</td>
                <td>{payment.description}</td>
                <td>{formatCurrency(payment.value)}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientDetailPage;