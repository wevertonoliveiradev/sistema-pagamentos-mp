import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Login bem-sucedido, redireciona para o painel
        navigate('/');
      })
      .catch((error) => {
        setError('Email ou senha inválidos.');
        console.error(error);
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