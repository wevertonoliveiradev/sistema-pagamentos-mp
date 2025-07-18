// src/components/PaymentModal.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import styles from './PaymentModal.module.css';

function PaymentModal({ isOpen, onClose }) {
  // Estados do formulário
  const [selectedClient, setSelectedClient] = useState(null);
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [liveDate, setLiveDate] = useState('');

  // Estados da busca de cliente
  const [clientSearch, setClientSearch] = useState('');
  const [clientsFound, setClientsFound] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Efeito para buscar clientes enquanto o usuário digita
  useEffect(() => {
    // Não busca se o campo estiver vazio ou um cliente já foi selecionado
    if (!clientSearch || selectedClient) {
      setClientsFound([]);
      return;
    }

    setIsSearching(true);
    // Um pequeno delay (debounce) para não fazer buscas a cada letra digitada
    const searchTimeout = setTimeout(async () => {
      const searchTerm = clientSearch.toLowerCase();
      const q = query(
        collection(db, 'clients'),
        where('name_lowercase', '>=', searchTerm),
        where('name_lowercase', '<=', searchTerm + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      const found = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientsFound(found);
      setIsSearching(false);
    }, 500); // 500ms de espera

    return () => clearTimeout(searchTimeout);
  }, [clientSearch, selectedClient]);

  // Função para limpar e fechar o modal
  const handleClose = () => {
    setSelectedClient(null);
    setClientSearch('');
    setValue('');
    setDescription('');
    setLiveDate('');
    setError('');
    onClose();
  };

  // Função para submeter o formulário
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
      handleClose(); // Fecha e limpa o modal
    } catch (err) {
      console.error("Erro ao gerar pagamento:", err);
      setError(err.message || 'Falha ao gerar o link.');
    } finally {
      setIsLoading(false);
    }
  };

  // Adiciona um campo 'name_lowercase' ao salvar clientes para a busca funcionar
  // (Esta é uma melhoria para fazer na ClientFormModal depois)

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Gerar Novo Pagamento</h2>
        <form onSubmit={handleSubmit}>
          {/* Seção de busca de cliente */}
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
                />
                {isSearching && <p>Buscando...</p>}
                {clientsFound.length > 0 && (
                  <ul className={styles.searchResults}>
                    {clientsFound.map(client => (
                      <li key={client.id} onClick={() => setSelectedClient(client)}>
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
          
          {/* Outros campos do formulário */}
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
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? 'Gerando...' : 'Gerar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;