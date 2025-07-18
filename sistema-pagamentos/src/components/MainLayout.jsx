import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
// import styles from '../App.css'; // Podemos reusar o estilo do App

function MainLayout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="content-wrapper">
        <Outlet /> {/* O <Outlet> é onde as páginas (Dashboard, Clientes) serão renderizadas */}
      </main>
    </div>
  );
}

export default MainLayout;