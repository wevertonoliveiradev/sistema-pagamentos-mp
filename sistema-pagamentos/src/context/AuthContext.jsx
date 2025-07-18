import React, { useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Cria o Contexto, que é como um container global de informações.
const AuthContext = React.createContext();

// Cria um "hook" personalizado para facilitar o uso do nosso contexto em outros componentes.
export function useAuth() {
  return useContext(AuthContext);
}

// Cria o "Provedor", o componente que vai gerenciar e fornecer os dados de autenticação.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Começa carregando, pois estamos verificando o estado inicial.

  useEffect(() => {
    const auth = getAuth();
    // onAuthStateChanged é o "ouvinte" do Firebase. Ele dispara toda vez que
    // um usuário faz login ou logout. É a peça central da nossa lógica.
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user); // Define o usuário (pode ser 'null' se estiver deslogado)
      setLoading(false); // Marca que a verificação inicial foi concluída
    });

    // Retorna a função de "limpeza", que desliga o ouvinte quando o componente "morre".
    // Isso evita vazamentos de memória.
    return unsubscribe;
  }, []);

  // O valor que será compartilhado com todos os componentes filhos.
  const value = {
    currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Só renderiza o resto do app depois que a verificação inicial terminar */}
      {!loading && children}
    </AuthContext.Provider>
  );
}