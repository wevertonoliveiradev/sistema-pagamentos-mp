import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, orderBy, where, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ClientFormModal from '../components/ClientFormModal';
import styles from './ClientsPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 30; // Define o número de clientes por página

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Novos estados para a paginação
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setClients([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const q = query(
      collection(db, 'clients'), 
      where("userId", "==", currentUser.uid),
      orderBy('name'),
      limit(PAGE_SIZE) // Limita a busca inicial à primeira página
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]); // Guarda o último item para a próxima busca
      setHasMore(clientsData.length === PAGE_SIZE); // Verifica se há mais páginas
      setIsLoading(false);
    }, (error) => {
        console.error("Erro ao buscar clientes:", error);
        alert("Ocorreu um erro ao carregar os clientes.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    // A busca por texto filtra apenas os clientes já carregados
    const results = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);
  
  // Nova função para carregar mais clientes
  const loadMore = async () => {
    if (!currentUser || !lastDoc) return;

    setIsLoading(true);
    const q = query(
      collection(db, 'clients'),
      where("userId", "==", currentUser.uid),
      orderBy('name'),
      startAfter(lastDoc), // Começa a busca depois do último item carregado
      limit(PAGE_SIZE)
    );

    const documentSnapshots = await getDocs(q);
    const newClients = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClients(prev => [...prev, ...newClients]); // Adiciona os novos clientes à lista existente
    setLastDoc(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
    setHasMore(newClients.length === PAGE_SIZE);
    setIsLoading(false);
  };

  const getCleanInstagramHandle = (input) => {
    if (!input) return '';
    let handle = input.trim();
    try {
      if (handle.includes('instagram.com')) {
        const url = new URL(handle.startsWith('http') ? handle : `https://${handle}`);
        const pathname = url.pathname.replace(/\//g, '');
        if (pathname) return pathname;
      }
    } catch (e) { /* Ignora erros */ }
    return handle.replace('@', '');
  };
  
  const handleNavigateToClient = (clientId) => {
    navigate(`/clientes/${clientId}`);
  };

  const handleAddNewClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteDoc(doc(db, 'clients', clientId));
      } catch (error) { console.error("Erro ao excluir cliente: ", error); }
    }
  };

  const handleSaveClient = async (formData) => {
    if (!currentUser) {
      alert("Sua sessão expirou. Por favor, faça o login novamente.");
      return;
    }
    if (!formData.name || !formData.whatsapp) {
      alert('Por favor, preencha o Nome e o WhatsApp.');
      return;
    }
    const dataToSave = {
      ...formData,
      name_lowercase: formData.name.toLowerCase()
    };

    try {
      if (editingClient) {
        const clientRef = doc(db, 'clients', editingClient.id);
        await updateDoc(clientRef, dataToSave);
      } else {
        await addDoc(collection(db, 'clients'), {
          ...dataToSave,
          userId: currentUser.uid,
          createdAt: new Date(),
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar cliente: ", error);
      alert('Ocorreu um erro ao salvar o cliente.');
    }
  };

  return (
    <div className={styles.clientsPage}>
      <header className={styles.header}>
        <h1>Meus Clientes</h1>
        <button onClick={handleAddNewClient} className={styles.addButton}>Novo Cliente</button>
      </header>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar cliente por nome..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.tableContainer}>
        <table>
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>WhatsApp</th>
                    <th>Instagram</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {isLoading && clients.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>Carregando...</td></tr>
                ) : filteredClients.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>Nenhum cliente encontrado.</td></tr>
                ) : (
                    filteredClients.map(client => {
                        const cleanWhatsapp = client.whatsapp?.replace(/\D/g, '');
                        const instagramHandle = getCleanInstagramHandle(client.instagram);

                        return (
                            <tr key={client.id} className={styles.clickableRow} onClick={() => handleNavigateToClient(client.id)}>
                                <td data-label="Cliente">{client.name}</td>
                                <td data-label="WhatsApp">
                                    {cleanWhatsapp ? (
                                        <a href={`https://wa.me/55${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.contactLink} onClick={(e) => e.stopPropagation()}>
                                            {client.whatsapp}
                                        </a>
                                    ) : ( <span>N/A</span> )}
                                </td>
                                <td data-label="Instagram">
                                    {instagramHandle ? (
                                        <a href={`https://ig.me/m/${instagramHandle}`} target="_blank" rel="noopener noreferrer" className={styles.contactLink} onClick={(e) => e.stopPropagation()}>
                                            @{instagramHandle}
                                        </a>
                                    ) : ( <span>N/A</span> )}
                                </td>
                                <td data-label="Ações" className={styles.actions} onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleEditClient(client)} className={styles.editButton}>Editar</button>
                                    <button onClick={() => handleDeleteClient(client.id)} className={styles.deleteButton}>Excluir</button>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
      </div>

      {!isLoading && hasMore && (
        <div className={styles.pagination}>
            <button onClick={loadMore} disabled={isLoading}>
                {isLoading ? 'Carregando...' : 'Carregar Mais'}
            </button>
        </div>
      )}

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </div>
  );
}

export default ClientsPage;