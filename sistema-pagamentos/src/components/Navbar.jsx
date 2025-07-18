import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext'; // Importa nosso hook de autenticação
import styles from './Navbar.module.css';

function Navbar() {
  const { currentUser } = useAuth(); // Pega o usuário logado do nosso contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Logout bem-sucedido, redireciona para a página de login
        navigate('/login');
      })
      .catch((error) => {
        console.error('Erro ao fazer logout:', error);
      });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <NavLink to="/" className={styles.navLogo}>
          MP
        </NavLink>
        <ul className={styles.navMenu}>
          {/* Mostra os links do painel apenas se o usuário estiver logado */}
          {currentUser && (
            <>
              <li className={styles.navItem}>
                <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                  Painel
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink to="/clientes" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                  Clientes
                </NavLink>
              </li>
            </>
          )}
          {/* Mostra o botão de Sair apenas se o usuário estiver logado */}
          {currentUser && (
             <li className={styles.navItem}>
              <button onClick={handleLogout} className={styles.logoutButton}>Sair</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;