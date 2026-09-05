import {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './Navbar.module.css';
import logoSmartCity from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  /*
   * Agrega espacio lateral únicamente cuando
   * existe un usuario con sesión iniciada.
   */
  useEffect(() => {
    const root = document.getElementById('root');

    if (user) {
      root?.classList.add('with-sidebar');
    } else {
      root?.classList.remove('with-sidebar');
    }

    return () => {
      root?.classList.remove('with-sidebar');
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const getLinkClass = ({ isActive }) =>
    `${styles.navLink} ${
      isActive ? styles.activeLink : ''
    }`;

  /*
   * Si no hay una sesión iniciada, no se muestra
   * el navbar en Inicio, Login ni Registro.
   */
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Botón para dispositivos móviles */}

      <button
        type="button"
        className={styles.mobileButton}
        onClick={() => setMenuOpen((current) => !current)}
        aria-label={
          menuOpen
            ? 'Cerrar menú de navegación'
            : 'Abrir menú de navegación'
        }
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Fondo oscuro para cerrar el menú en celulares */}

      {menuOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={closeMenu}
          aria-label="Cerrar menú"
        ></button>
      )}

      {/* Menú lateral */}

      <aside
        className={`${styles.sidebar} ${
          menuOpen ? styles.sidebarOpen : ''
        }`}
      >
        <div className={styles.sidebarHeader}>
         <Link
  to="/"
  className={styles.logo}
  onClick={closeMenu}
>
  <div className={styles.logoIcon}>
    <img
      src={logoSmartCity}
      alt="Logo de SmartCityCore"
    />
  </div>

  <span>Capacitación</span>
</Link>
        </div>

        <div className={styles.sidebarContent}>
          <span className={styles.menuLabel}>
            MENÚ PRINCIPAL
          </span>

          <nav className={styles.links}>
            <NavLink
              to="/"
              end
              className={getLinkClass}
              onClick={closeMenu}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 3-9 8h2v9h5v-6h4v6h5v-9h2l-9-8Z" />
              </svg>

              <span>Inicio</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={getLinkClass}
              onClick={closeMenu}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 4h6v7H4V4Zm10 0h6v7h-6V4ZM4 15h6v5H4v-5Zm10 0h6v5h-6v-5Z" />
              </svg>

              <span>Cursos</span>
            </NavLink>
            <div className={styles.accountSection}>
  <span className={styles.menuLabel}>
    MI CUENTA
  </span>

  <nav className={styles.links}>
    <NavLink
      to="/progress"
      className={getLinkClass}
      onClick={closeMenu}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19h16v2H2V3h2v16Zm3-3-2-2 5-5 4 4 5-6 2 1.5-6.4 8-4.6-4.1L7 16Z" />
      </svg>

      <span>Avance</span>
    </NavLink>

    <NavLink
      to="/profile"
      className={getLinkClass}
      onClick={closeMenu}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z" />
      </svg>

      <span>Perfil</span>
    </NavLink>
  </nav>
</div>

            {user.role === 'ADMIN' && (
              <NavLink
                to="/admin"
                className={getLinkClass}
                onClick={closeMenu}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2 4 5v6c0 5.1 3.4 9.7 8 11 4.6-1.3 8-5.9 8-11V5l-8-3Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 11.5c-1.7-.6-3.1-1.6-4.1-2.9.7-1.1 2.3-1.8 4.1-1.8s3.4.7 4.1 1.8c-1 1.3-2.4 2.3-4.1 2.9Z" />
                </svg>

                <span>Panel de administración</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Información del usuario */}

        <div className={styles.sidebarFooter}>
          <div className={styles.userInformation}>
            <div className={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase() ||
                'U'}
            </div>

            <div>
              <strong>
                {user.name || 'Usuario'}
              </strong>

              <span>
                {user.role === 'ADMIN'
                  ? 'Administrador'
                  : 'Usuario'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 17v3H4V4h6v3h2V2H2v20h10v-5h-2Zm11-5-4-4v3H9v2h8v3l4-4Z" />
            </svg>

            Cerrar sesión
          </button>

          <p className={styles.copyright}>
            © 2026 GAD Capacitación
          </p>
        </div>
      </aside>
    </>
  );
};

export default Navbar;