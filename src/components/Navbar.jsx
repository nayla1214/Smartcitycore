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

import {
  FiHome,
  FiGrid,
  FiUsers,
  FiBookOpen,
  FiTrendingUp,
  FiBell,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';

import { AuthContext } from '../context/AuthContext';
import useNotificationCount from '../hooks/useNotificationCount';
import styles from './Navbar.module.css';
import logoSmartCity from '../assets/logo.png';

const ParticipantNotifications = ({
  getLinkClass,
  closeMenu,
}) => {
  const unreadCount = useNotificationCount();

  return (
    <NavLink
      to="/notifications"
      className={getLinkClass}
      onClick={closeMenu}
      aria-label={
        unreadCount > 0
          ? `Notificaciones: ${unreadCount} sin leer`
          : 'Notificaciones'
      }
    >
      <FiBell aria-hidden="true" />

      <span>Notificaciones</span>

      {unreadCount > 0 && (
        <span
          className={styles.notificationBadge}
          aria-hidden="true"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </NavLink>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const isManagement = [
    'ADMIN',
    'SUPERADMIN',
  ].includes(user?.role);

  const roleName =
    user?.role === 'SUPERADMIN'
      ? 'Superadministrador'
      : user?.role === 'ADMIN'
        ? 'Director del proyecto'
        : 'Participante';

  useEffect(() => {
    const root = document.getElementById('root');

    root?.classList.toggle(
      'with-sidebar',
      Boolean(user)
    );

    return () => {
      root?.classList.remove('with-sidebar');
    };
  }, [user]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const getLinkClass = ({ isActive }) =>
    `${styles.navLink} ${
      isActive ? styles.activeLink : ''
    }`;

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        className={styles.mobileButton}
        onClick={() =>
          setMenuOpen((current) => !current)
        }
        aria-label={
          menuOpen
            ? 'Cerrar menú de navegación'
            : 'Abrir menú de navegación'
        }
        aria-expanded={menuOpen}
        aria-controls="sidebar-navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={closeMenu}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        id="sidebar-navigation"
        className={`${styles.sidebar} ${
          menuOpen ? styles.sidebarOpen : ''
        }`}
      >
        <div className={styles.sidebarHeader}>
          <Link
            to={isManagement ? '/admin' : '/'}
            className={styles.logo}
            onClick={closeMenu}
          >
            <div className={styles.logoIcon}>
              <img
                src={logoSmartCity}
                alt="SmartCityCore"
              />
            </div>

            <span>
              {isManagement
                ? 'Gestión del proyecto'
                : 'Capacitación'}
            </span>
          </Link>
        </div>

        <div className={styles.sidebarContent}>
          <span className={styles.menuLabel}>
            {isManagement
              ? 'ADMINISTRACIÓN'
              : 'MENÚ PRINCIPAL'}
          </span>

          <nav
            className={styles.links}
            aria-label={
              isManagement
                ? 'Menú administrativo'
                : 'Menú principal'
            }
          >
            {isManagement ? (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={getLinkClass}
                  onClick={closeMenu}
                >
                  <FiGrid aria-hidden="true" />
                  <span>Resumen</span>
                </NavLink>

                <NavLink
                  to="/admin/users"
                  className={getLinkClass}
                  onClick={closeMenu}
                >
                  <FiUsers aria-hidden="true" />
                  <span>Usuarios y seguimiento</span>
                </NavLink>

                {user.role === 'ADMIN' && (
                  <NavLink
                    to="/admin/courses"
                    className={getLinkClass}
                    onClick={closeMenu}
                  >
                    <FiBookOpen aria-hidden="true" />
                    <span>Gestión de cursos</span>
                  </NavLink>
                )}
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  end
                  className={getLinkClass}
                  onClick={closeMenu}
                >
                  <FiHome aria-hidden="true" />
                  <span>Inicio</span>
                </NavLink>

                <NavLink
                  to="/dashboard"
                  className={getLinkClass}
                  onClick={closeMenu}
                >
                  <FiGrid aria-hidden="true" />
                  <span>Cursos</span>
                </NavLink>
              </>
            )}
          </nav>

          <div className={styles.accountSection}>
            <span className={styles.menuLabel}>
              MI CUENTA
            </span>

            <nav
              className={styles.links}
              aria-label="Mi cuenta"
            >
              {!isManagement && (
                <>
                  <NavLink
                    to="/progress"
                    className={getLinkClass}
                    onClick={closeMenu}
                  >
                    <FiTrendingUp aria-hidden="true" />
                    <span>Avance</span>
                  </NavLink>

                  <ParticipantNotifications
                    getLinkClass={getLinkClass}
                    closeMenu={closeMenu}
                  />
                </>
              )}

              <NavLink
                to="/profile"
                className={getLinkClass}
                onClick={closeMenu}
              >
                <FiUser aria-hidden="true" />
                <span>Mi perfil</span>
              </NavLink>
            </nav>
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInformation}>
            <div className={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div>
              <strong>
                {user.name || 'Usuario'}
              </strong>

              <span>{roleName}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <FiLogOut aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;