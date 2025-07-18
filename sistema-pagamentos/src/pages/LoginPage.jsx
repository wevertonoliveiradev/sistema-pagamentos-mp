import React, { useState } from 'react';
// 1. Importa as funções de persistência do Firebase Auth
import { getAuth, setPersistence, signInWithEmailAndPassword, browserLocalPersistence } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import styles from './AuthPages.module.css';

function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = (email, password) => {
    setIsLoading(true);
    setError('');

    // 2. Define a persistência como LOCAL (guarda no navegador mesmo se fechar)
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // 3. Após definir a persistência, tenta fazer o login
        return signInWithEmailAndPassword(auth, email, password);
      })
      .then((userCredential) => {
        // Login bem-sucedido, redireciona para o painel
        navigate('/');
      })
      .catch((error) => {
        setError('Email ou senha inválidos.');
        console.error("Erro de login:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <AuthForm formType="login" onSubmit={handleLogin} error={error} isLoading={isLoading} />
      <p className={styles.redirectText}>
        Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
      </p>
    </div>
  );
}

export default LoginPage;