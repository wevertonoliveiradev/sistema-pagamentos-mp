import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, where, limit, startAfter, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import styles from './PaymentList.module.css';
import DescriptionModal from './DescriptionModal';
import PaymentDetailsModal from './PaymentDetailsModal';

const PAGE_SIZE = 30;

// ==========================================================
//  DEFINIÇÃO DOS ÍCONES QUE ESTAVA FALTANDO
// ==========================================================
const WhatsAppIcon = () => (
    <svg viewBox="0 0 32 32" fill="#25D366" xmlns="http://www.w3.org/2000/svg"><path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.544-.527-1.146-.527-1.146s-.5-.517-.825-.517c-.325 0-1.012.36-1.49.886-.478.527-1.146 1.49-1.146 2.473s.527 2.104 1.053 2.573c.527.47 2.214 3.32 5.176 4.545 2.16.866 2.972.708 3.638.648.666-.06 2.08-.865 2.39-1.49.31-.625.31-1.21.24-1.355-.07-.145-.315-.22-.63-.38z" fillRule="evenodd"></path></svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" fill="url(#gradient-instagram)">
        <defs><radialGradient id="gradient-instagram" r="150%" cx="30%" cy="107%"><stop stopColor="#fdf497" offset="0"></stop><stop stopColor="#fdf497" offset="0.05"></stop><stop stopColor="#fd5949" offset="0.45"></stop><stop stopColor="#d6249f" offset="0.6"></stop><stop stopColor="#285AEB" offset="0.9"></stop></radialGradient></defs><path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"></path>
    </svg>
);


function PaymentList() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({ name: '', status: '', startDate: '', endDate: '' });
    const { currentUser } = useAuth();
    
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isDescModalOpen, setIsDescModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');

    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved': return { text: 'Aprovado', className: styles.approved };
            case 'pending': return { text: 'Pendente', className: styles.pending };
            case 'rejected': case 'failure': case 'cancelled': return { text: 'Falhou', className: styles.rejected };
            default: return { text: status || 'N/A', className: '' };
        }
    };
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };
    const formatDateToDDMMYYYY = (dateStr) => {
        if (!dateStr) return 'N/A';
        const [year, month, day] = dateStr.split('-');
        if (!day || !month || !year) return dateStr;
        return `${day}/${month}/${year}`;
    };
    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Tem certeza que deseja excluir este pagamento? Esta ação é irreversível.')) {
            try { await deleteDoc(doc(db, 'payments', paymentId)); } 
            catch (error) { console.error("Erro ao excluir pagamento:", error); }
        }
    };
    const handleShowDescription = (description) => {
        setSelectedDescription(description);
        setIsDescModalOpen(true);
    };
    const handleShowDetails = (payment) => {
        setSelectedPayment(payment);
        setIsDetailsModalOpen(true);
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const buildQuery = useCallback(() => {
        let q = query(collection(db, 'payments'), where('userId', '==', currentUser.uid));
        
        if (filters.status) { q = query(q, where('status', '==', filters.status)); }
        if (filters.name) {
            const nameLower = filters.name.toLowerCase();
            q = query(q, where('clientName_lowercase', '>=', nameLower), where('clientName_lowercase', '<=', nameLower + '\uf8ff'));
        } else {
            if (filters.startDate) { q = query(q, where('liveDate', '>=', filters.startDate)); }
            if (filters.endDate) { q = query(q, where('liveDate', '<=', filters.endDate)); }
        }
        return query(q, orderBy('createdAt', 'desc'));
    }, [filters, currentUser]);

    useEffect(() => {
        if (!currentUser) { setPayments([]); setIsLoading(false); return; }

        setIsLoading(true);
        const q = query(buildQuery(), limit(PAGE_SIZE));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newPayments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPayments(newPayments);
            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setHasMore(newPayments.length === PAGE_SIZE);
            setIsLoading(false);
        }, (error) => {
            console.error("Erro na consulta com onSnapshot: ", error);
            alert("Erro ao buscar dados. Verifique o console para um link de criação de índice.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [buildQuery, currentUser]);
    
    const loadMore = async () => {
        if (!hasMore || !lastDoc || !currentUser) return;
        
        setIsLoading(true);
        const q = query(buildQuery(), startAfter(lastDoc), limit(PAGE_SIZE));
        
        const documentSnapshots = await getDocs(q);
        const newPayments = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(prev => [...prev, ...newPayments]);
        setLastDoc(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        setHasMore(newPayments.length === PAGE_SIZE);
        setIsLoading(false);
    };

    return (
        <>
            <div className={styles.filterBar}>
                <input type="text" name="name" placeholder="Nome do cliente..." value={filters.name} onChange={handleFilterChange} className={styles.filterInput} />
                <input type="date" name="startDate" title="Data inicial da live" value={filters.startDate} onChange={handleFilterChange} className={styles.filterInput} />
                <input type="date" name="endDate" title="Data final da live" value={filters.endDate} onChange={handleFilterChange} className={styles.filterInput} />
                <select name="status" value={filters.status} onChange={handleFilterChange} className={styles.filterInput}>
                    <option value="">Todos Status</option>
                    <option value="approved">Aprovado</option>
                    <option value="pending">Pendente</option>
                    <option value="rejected">Falhou</option>
                </select>
            </div>
            <div className={styles.tableContainer}>
                <h2>Pagamentos Gerados</h2>
                <table>
                    <thead>
                        <tr><th>Cliente</th><th>Descrição</th><th>Valor</th><th>Data da Live</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        {isLoading && payments.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Carregando...</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhum pagamento encontrado.</td></tr>
                        ) : (
                            payments.map((payment) => {
                                const statusInfo = getStatusInfo(payment.status);
                                const cleanWhatsapp = payment.whatsapp?.replace(/\D/g, '');
                                const instagramHandle = payment.instagram?.replace('@', '').trim();
                                const messageEnvio = encodeURIComponent(`Olá ${payment.clientName}! Segue o link para o seu pagamento: ${payment.paymentLink}`);
                                const messageCobranca = encodeURIComponent(`Olá ${payment.clientName}, tudo bem? Passando para lembrar sobre o pagamento pendente. Qualquer dúvida, estou à disposição! Link: ${payment.paymentLink}`);
                                const description = payment.description || '';
                                const isLongDescription = description.length > 40;

                                return (
                                    <tr key={payment.id} onClick={() => handleShowDetails(payment)} className={styles.clickableRow}>
                                        <td data-label="Cliente">
                                            <div className={styles.clientCell}>
                                                <span>{payment.clientName || 'N/A'}</span>
                                                <div className={styles.socialIcons}>
                                                    {cleanWhatsapp && (
                                                        <a href={`https://wa.me/55${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer" title={payment.whatsapp} onClick={(e) => e.stopPropagation()}>
                                                            <WhatsAppIcon />
                                                        </a>
                                                    )}
                                                    {instagramHandle && (
                                                        <a href={`https://ig.me/m/${instagramHandle}`} target="_blank" rel="noopener noreferrer" title={`@${instagramHandle}`} onClick={(e) => e.stopPropagation()}>
                                                            <InstagramIcon />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Descrição" title={description}>
                                            <div className={styles.descriptionContent}>
                                                <span className={styles.descriptionText}>{isLongDescription ? `${description.substring(0, 40)}...` : description}</span>
                                                {isLongDescription && ( <button onClick={(e) => { e.stopPropagation(); handleShowDescription(description); }} className={styles.verMaisButton}>(Ver mais)</button> )}
                                            </div>
                                        </td>
                                        <td data-label="Valor">{formatCurrency(payment.value)}</td>
                                        <td data-label="Data da Live">{formatDateToDDMMYYYY(payment.liveDate)}</td>
                                        <td data-label="Status"><span className={`${styles.status} ${statusInfo.className}`}>{statusInfo.text}</span></td>
                                        <td data-label="Ações" className={styles.actions} onClick={(e) => e.stopPropagation()}>
                                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(payment.paymentLink); alert('Link copiado!'); }} className={styles.copiarButton} title="Copiar Link">Copiar</button>
                                            {cleanWhatsapp && payment.paymentLink && (
                                                <>
                                                    <a href={`https://wa.me/55${cleanWhatsapp}?text=${messageEnvio}`} target="_blank" rel="noopener noreferrer" className={styles.enviarButton} title="Enviar Link">Enviar</a>
                                                    <a href={`https://wa.me/55${cleanWhatsapp}?text=${messageCobranca}`} target="_blank" rel="noopener noreferrer" className={styles.cobrarButton} title="Cobrar">Cobrar</a>
                                                </>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleDeletePayment(payment.id); }} className={styles.deleteButton} title="Excluir">Excluir</button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                {!isLoading && hasMore && (
                    <div className={styles.pagination}>
                        <button onClick={loadMore} disabled={isLoading}>
                            {isLoading ? 'Carregando...' : 'Carregar Mais'}
                        </button>
                    </div>
                )}
            </div>
            <DescriptionModal isOpen={isDescModalOpen} onClose={() => setIsDescModalOpen(false)} description={selectedDescription} />
            <PaymentDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} payment={selectedPayment} />
        </>
    );
}

export default PaymentList;