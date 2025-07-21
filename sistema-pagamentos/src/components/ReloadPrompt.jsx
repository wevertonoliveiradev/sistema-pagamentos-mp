// src/components/ReloadPrompt.jsx
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './ReloadPrompt.module.css';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.log('Erro no registro do Service Worker:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className={styles.container}>
      {(offlineReady || needRefresh) && (
        <div className={styles.toast}>
          <div className={styles.message}>
            {offlineReady ? (
              <span>O app está pronto para funcionar offline.</span>
            ) : (
              <span>Nova versão disponível, clique para atualizar!</span>
            )}
          </div>
          {needRefresh && (
            <button className={styles.reloadButton} onClick={() => updateServiceWorker(true)}>
              Atualizar
            </button>
          )}
          <button className={styles.closeButton} onClick={close}>
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}

export default ReloadPrompt;