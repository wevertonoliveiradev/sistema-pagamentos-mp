import React, { useState } from 'react';
import styles from './AuthForm.module.css';

function AuthForm({ formType, onSubmit, error, isLoading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2>{formType === 'login' ? 'Entrar no Painel' : 'Criar Nova Conta'}</h2>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Aguarde...' : (formType === 'login' ? 'Entrar' : 'Cadastrar')}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;