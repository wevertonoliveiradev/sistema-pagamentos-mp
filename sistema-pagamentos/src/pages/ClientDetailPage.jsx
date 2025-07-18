import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './ClientDetailPage.module.css';
import DescriptionModal from '../components/DescriptionModal';

function ClientDetailPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ approved: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const clientRef = doc(db, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);

      if (clientSnap.exists()) {
        setClient(clientSnap.data());

        const paymentsQuery = query(
          collection(db, 'payments'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        );
        const paymentsSnap = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnap.docs.map(doc => doc.data());
        setPayments(paymentsData);

        const approvedTotal = paymentsData
          .filter(p => p.status === 'approved' || p.status === 'settled')
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

  // 1. ADICIONA A FUNÇÃO getStatusInfo
  const getStatusInfo = (status) => {
    switch (status) {
        case 'approved': return { text: 'Aprovado', className: styles.approved };
        case 'pending': return { text: 'Pendente', className: styles.pending };
        case 'rejected': case 'failure': case 'cancelled': return { text: 'Falhou', className: styles.rejected };
        case 'settled': return { text: 'Baixado', className: styles.settled };
        default: return { text: status || 'N/A', className: '' };
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleShowDescription = (description) => {
    setSelectedDescription(description);
    setIsDescModalOpen(true);
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
    <>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>Extrato de {client.name}</h1>
          <Link to="/clientes" className={styles.backButton}>Voltar</Link>
        </header>
        
        <div className={styles.summaryContainer}>
          <div className={`${styles.summaryCard} ${styles.approved}`}>
            <span>Total Recebido (Aprovado + Baixado)</span>
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
              {payments.map((payment, index) => {
                const description = payment.description || '';
                const isLongDescription = description.length > 50;
                const statusInfo = getStatusInfo(payment.status); // 2. Usa a função para pegar texto e estilo

                return (
                  <tr key={index}>
                    <td>{formatDateToDDMMYYYY(payment.liveDate)}</td>
                    <td title={description}>
                      <div className={styles.descriptionContent}>
                        <span className={styles.descriptionText}>
                          {isLongDescription ? `${description.substring(0, 50)}...` : description}
                        </span>
                        {isLongDescription && (
                          <button onClick={() => handleShowDescription(description)} className={styles.verMaisButton}>
                            (Ver mais)
                          </button>
                        )}
                      </div>
                    </td>
                    <td>{formatCurrency(payment.value)}</td>
                    {/* 3. ATUALIZA A CÉLULA DE STATUS */}
                    <td>
                      <span className={`${styles.status} ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <DescriptionModal
        isOpen={isDescModalOpen}
        onClose={() => setIsDescModalOpen(false)}
        description={selectedDescription}
      />
    </>
  );
}

export default ClientDetailPage;