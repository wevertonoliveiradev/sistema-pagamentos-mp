import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, where, limit, startAfter, getDocs, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import styles from './PaymentList.module.css';
import DescriptionModal from './DescriptionModal';
import PaymentDetailsModal from './PaymentDetailsModal';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 30;

const WhatsAppIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px"><path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.8-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4.1-.1.1-.2 0-.4-.1-.1-.6-.7-.8-.9-.2-.2-.4-.3-.5-.3h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.3c.1 0 1.5.7 3.5 2.5 2 1.8 2 1.2 2.4 1.2.5 0 1.5-.7 1.7-1.4.2-.7.2-1.2.1-1.3-.1-.1-.2-.2-.4-.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path></svg> );
const InstagramIcon = () => ( <svg viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"></path></svg> );

function PaymentList() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({ name: '', status: '', startDate: '', endDate: '' });
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isDescModalOpen, setIsDescModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');

    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved': return { text: 'Aprovado', className: styles.approved };
            case 'pending': return { text: 'Pendente', className: styles.pending };
            case 'rejected': case 'failure': case 'cancelled': return { text: 'Falhou', className: styles.rejected };
            case 'settled': return { text: 'Baixado', className: styles.settled };
            case 'cancelled': return { text: 'Cancelado', className: styles.cancelled };
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
    const handleSettlePayment = async (paymentId) => {
        const confirmationMessage = "Tem certeza que deseja baixar este pagamento?\n\nEsta ação é para pagamentos recebidos fora do sistema (ex: PIX, dinheiro) e não pode ser desfeita.";
        if (window.confirm(confirmationMessage)) {
            try {
                const paymentRef = doc(db, 'payments', paymentId);
                await updateDoc(paymentRef, { status: 'settled' });
            } catch (error) { console.error("Erro ao baixar pagamento: ", error); }
        }
    };
    const handleCancelPayment = async (paymentId) => {
        if (window.confirm('Tem certeza que deseja cancelar este pagamento? O valor não será contabilizado.')) {
            try {
                const paymentRef = doc(db, 'payments', paymentId);
                await updateDoc(paymentRef, { status: 'cancelled' });
            } catch (error) { console.error("Erro ao cancelar pagamento: ", error); }
        }
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

    // NOVA FUNÇÃO para marcar a ação como feita
    const handleMarkAsAction = async (e, paymentId, actionType) => {
        e.stopPropagation();
        
        const fieldToUpdate = actionType === 'linkSent' ? 'linkSentAt' : 'chargeSentAt';

        try {
            const paymentRef = doc(db, 'payments', paymentId);
            await updateDoc(paymentRef, {
                [fieldToUpdate]: serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao marcar ação: ", error);
        }
    };
    
    // NOVA FUNÇÃO para formatar a data e hora
    const formatTimestamp = (timestamp) => {
        if (!timestamp?.toDate) return '';
        return timestamp.toDate().toLocaleString('pt-BR');
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
        <div className={styles.paymentListContainer}>
            <div className={styles.filterBar}>
                <input type="text" name="name" placeholder="Nome do cliente..." value={filters.name} onChange={handleFilterChange} className={styles.filterInput} />
                <input type="date" name="startDate" title="Data inicial da live" value={filters.startDate} onChange={handleFilterChange} className={styles.filterInput} />
                <input type="date" name="endDate" title="Data final da live" value={filters.endDate} onChange={handleFilterChange} className={styles.filterInput} />
                <select name="status" value={filters.status} onChange={handleFilterChange} className={styles.filterInput}>
                    <option value="">Todos Status</option>
                    <option value="approved">Aprovado</option>
                    <option value="pending">Pendente</option>
                    <option value="rejected">Falhou</option>
                    <option value="settled">Baixado</option>
                    <option value="cancelled">Cancelado</option>
                </select>
            </div>
            <h2>Pagamentos Gerados</h2>
            {isLoading && payments.length === 0 ? (
                <p>Carregando...</p>
            ) : payments.length === 0 ? (
                <p>Nenhum pagamento encontrado.</p>
            ) : (
                <div className={styles.cardsGrid}>
                {payments.map((payment) => {
                    const statusInfo = getStatusInfo(payment.status);
                    const cleanWhatsapp = payment.whatsapp?.replace(/\D/g, '');
                    const instagramHandle = payment.instagram?.replace('@', '').trim();
                    const messageEnvio = encodeURIComponent(`Olá ${payment.clientName}! Segue o link para o seu pagamento: ${payment.paymentLink}`);
                    const messageCobranca = encodeURIComponent(`Olá ${payment.clientName}, tudo bem? Passando para lembrar sobre o pagamento pendente. Qualquer dúvida, estou à disposição! Link: ${payment.paymentLink}`);
                    const description = payment.description || '';
                    const isLongDescription = description.length > 80;

                    // Lógica para verificar se os botões já foram usados
                    const isLinkSent = !!payment.linkSentAt;
                    const isChargeSent = !!payment.chargeSentAt;
                    const enviarClassName = `${styles.enviarButton} ${isLinkSent ? styles.actionUsed : ''}`;
                    const cobrarClassName = `${styles.cobrarButton} ${isChargeSent ? styles.actionUsed : ''}`;
                    const enviarTitle = isLinkSent ? `Link enviado em: ${formatTimestamp(payment.linkSentAt)}` : "Enviar Link";
                    const cobrarTitle = isChargeSent ? `Cobrança enviada em: ${formatTimestamp(payment.chargeSentAt)}` : "Cobrar";

                    return (
                    <div key={payment.id} className={`${styles.paymentCard} ${styles[`card-${payment.status}`]}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.clientInfo} onClick={(e) => { e.stopPropagation(); if(payment.clientId) navigate(`/clientes/${payment.clientId}`) }}>
                                <strong>{payment.clientName || 'N/A'}</strong>
                            </div>
                            <span className={`${styles.status} ${statusInfo.className}`}>
                                {statusInfo.text}
                            </span>
                        </div>
                        <div className={styles.cardBody} onClick={() => handleShowDetails(payment)}>
                            <div className={styles.detailRow}>
                                <span>Valor:</span>
                                <span>{formatCurrency(payment.value)}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Data da Live:</span>
                                <span>{formatDateToDDMMYYYY(payment.liveDate)}</span>
                            </div>
                            <div className={styles.description} title={description}>
                                <span>Descrição:</span>
                                <p>
                                    {isLongDescription ? `${description.substring(0, 80)}...` : description}
                                    {isLongDescription && ( <button onClick={(e) => { e.stopPropagation(); handleShowDescription(description); }} className={styles.verMaisButton}>(Ver mais)</button> )}
                                </p>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <div className={styles.socialIcons}>
                                {cleanWhatsapp && (
                                    <a href={`https://wa.me/55${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" onClick={(e) => e.stopPropagation()}><WhatsAppIcon /></a>
                                )}
                                {instagramHandle && (
                                    <a href={`https://ig.me/m/${instagramHandle}`} target="_blank" rel="noopener noreferrer" title={`@${instagramHandle}`} onClick={(e) => e.stopPropagation()}><InstagramIcon /></a>
                                )}
                            </div>
                            <div className={styles.actions}>
                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(payment.paymentLink); alert('Link copiado!'); }} className={styles.copiarButton}>Copiar</button>
                                {cleanWhatsapp && payment.paymentLink && (
                                    <>
                                        <a href={`https://wa.me/55${cleanWhatsapp}?text=${messageEnvio}`} target="_blank" rel="noopener noreferrer" 
                                           className={enviarClassName} title={enviarTitle} 
                                           onClick={(e) => handleMarkAsAction(e, payment.id, 'linkSent')}>
                                           Enviar
                                        </a>
                                        <a href={`https://wa.me/55${cleanWhatsapp}?text=${messageCobranca}`} target="_blank" rel="noopener noreferrer" 
                                           className={cobrarClassName} title={cobrarTitle}
                                           onClick={(e) => handleMarkAsAction(e, payment.id, 'chargeSent')}>
                                           Cobrar
                                        </a>
                                    </>
                                )}
                                {payment.status === 'pending' && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); handleSettlePayment(payment.id); }} className={styles.settleButton}>Baixar</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleCancelPayment(payment.id); }} className={styles.cancelButton}>Cancelar</button>
                                    </>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); handleDeletePayment(payment.id); }} className={styles.deleteButton}>Excluir</button>
                            </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            )}
            {!isLoading && hasMore && (
                <div className={styles.pagination}>
                    <button onClick={loadMore} disabled={isLoading}>
                        {isLoading ? 'Carregando...' : 'Carregar Mais'}
                    </button>
                </div>
            )}
            <DescriptionModal isOpen={isDescModalOpen} onClose={() => setIsDescModalOpen(false)} description={selectedDescription} />
            <PaymentDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} payment={selectedPayment} />
        </div>
    );
}

export default PaymentList;