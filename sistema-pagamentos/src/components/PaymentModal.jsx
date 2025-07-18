import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import styles from './PaymentModal.module.css';

function PaymentModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();

  const [selectedClient, setSelectedClient] = useState(null);
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [liveDate, setLiveDate] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientsFound, setClientsFound] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clientSearch || selectedClient || !currentUser) {
      setClientsFound([]);
      return;
    }

    setIsSearching(true);
    const searchTimeout = setTimeout(async () => {
      try {
        const searchTerm = clientSearch.toLowerCase();
        const q = query(
          collection(db, 'clients'),
          where('userId', '==', currentUser.uid),
          where('name_lowercase', '>=', searchTerm),
          where('name_lowercase', '<=', searchTerm + '\uf8ff'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const found = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClientsFound(found);
      } catch (err) {
        // AQUI ESTÁ A MELHORIA: Capturamos o erro e informamos o usuário.
        console.error("Erro ao buscar cliente (provavelmente falta um índice):", err);
        setError("Erro ao buscar clientes. Verifique o console para criar o índice.");
      } finally {
        // Garante que a mensagem "Buscando..." sempre desapareça.
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [clientSearch, selectedClient, currentUser]);

  const handleClose = () => {
    setSelectedClient(null);
    setClientSearch('');
    setValue('');
    setDescription('');
    setLiveDate('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      setError('Por favor, selecione um cliente.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const createPaymentPreference = httpsCallable(functions, 'createPaymentPreference');
      await createPaymentPreference({
        clientId: selectedClient.id,
        value,
        description,
        liveDate,
      });
      alert('Link de pagamento gerado com sucesso!');
      handleClose();
    } catch (err) {
      console.error("Erro ao gerar pagamento:", err);
      setError(err.message || 'Falha ao gerar o link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Gerar Novo Pagamento</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="clientSearch">Buscar Cliente</label>
            {!selectedClient ? (
              <>
                <input
                  type="text"
                  id="clientSearch"
                  placeholder="Digite o nome do cliente..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  autoComplete="off"
                />
                {isSearching && <p className={styles.searchingText}>Buscando...</p>}
                {clientsFound.length > 0 && (
                  <ul className={styles.searchResults}>
                    {clientsFound.map(client => (
                      <li key={client.id} onClick={() => {
                        setSelectedClient(client);
                        setClientSearch(client.name);
                        setClientsFound([]);
                      }}>
                        {client.name}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className={styles.selectedClient}>
                <span>{selectedClient.name}</span>
                <button type="button" onClick={() => { setSelectedClient(null); setClientSearch(''); }}>
                  Trocar
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="value">Valor (R$)</label>
            <input type="number" id="value" value={value} onChange={(e) => setValue(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição</label>
            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="liveDate">Data da Live</label>
            <input type="date" id="liveDate" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} required />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.buttonGroup}>
            <button type="button" onClick={handleClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton} disabled={isLoading || !selectedClient}>
              {isLoading ? 'Gerando...' : 'Gerar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;