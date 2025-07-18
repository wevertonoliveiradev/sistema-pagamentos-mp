import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Se não há usuário logado, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  // Se há um usuário logado, renderiza a página solicitada
  return children;
}

export default ProtectedRoute;