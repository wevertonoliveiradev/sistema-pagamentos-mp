import React, { useState } from 'react';
// 1. Importa as funções de persistência aqui também
import { getAuth, setPersistence, createUserWithEmailAndPassword, browserLocalPersistence } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import styles from './AuthPages.module.css';

function SignupPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSignup = (email, password) => {
    setIsLoading(true);
    setError('');
    
    // 2. Define a persistência antes de criar o usuário
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // 3. Após definir, tenta criar o novo usuário
        return createUserWithEmailAndPassword(auth, email, password);
      })
      .then((userCredential) => {
        // Cadastro e login bem-sucedidos, redireciona para o painel
        navigate('/');
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          setError('Este email já está em uso.');
        } else {
          setError('Falha ao criar a conta. A senha deve ter no mínimo 6 caracteres.');
        }
        console.error("Erro de cadastro:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <AuthForm formType="signup" onSubmit={handleSignup} error={error} isLoading={isLoading} />
      <p className={styles.redirectText}>
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}

export default SignupPage;