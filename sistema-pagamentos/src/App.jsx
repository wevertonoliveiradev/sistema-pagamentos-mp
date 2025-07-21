import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'; 

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import ReloadPrompt from './components/ReloadPrompt';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <BrowserRouter>
     <ReloadPrompt /> 
      <Routes>
        {/* Rotas Públicas (continuam as mesmas, fora do layout principal) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* --- ESTRUTURA CORRIGIDA PARA ROTAS PROTEGIDAS --- */}
        {/* 1. Criamos uma rota "pai" que renderiza nosso layout protegido */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* 2. A rota 'index' é a página padrão para o caminho "/" */}
          <Route index element={<DashboardPage />} />
          
          {/* 3. As outras rotas são "filhas" e seus caminhos são relativos ao pai */}
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="clientes/:clientId" element={<ClientDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;