import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setError('');
        const usersData = await api.get('/users');
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error('Error al cargar los usuarios:', error);
        setError('No fue posible cargar la información de los usuarios.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((currentUser) => {
      const matchesSearch =
        currentUser.name?.toLowerCase().includes(searchValue) ||
        currentUser.email?.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === 'ALL' || currentUser.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalUsers = users.length;

  const totalAdministrators = users.filter(
    (currentUser) => currentUser.role === 'ADMIN'
  ).length;

  const totalActiveUsers = users.filter(
    (currentUser) => Boolean(currentUser.status)
  ).length;

  if (user?.role !== 'ADMIN') {
    return (
      <main className={styles.accessPage}>
        <div className={styles.accessDenied}>
          <span className={styles.accessIcon}>!</span>
          <h2>Acceso denegado</h2>
          <p>Esta sección está disponible únicamente para administradores.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Cargando panel administrativo...</p>
      </main>
    );
  }

  return (
    <main className={styles.adminPage}>
      <section className={styles.adminContainer}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.pageSubtitle}>ADMINISTRACIÓN</span>
            <h1>Panel administrativo</h1>
            <p>
              Gestiona y consulta los usuarios registrados en la plataforma.
            </p>
          </div>

          <div className={styles.adminProfile}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>

            <div>
              <span>Administrador</span>
              <strong>{user?.name || 'Administrador general'}</strong>
            </div>
          </div>
        </header>

        <section className={styles.statistics}>
          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blueIcon}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.4 0-.8.1-1.2.2a5 5 0 0 1 0 5.6c.4.1.8.2 1.2.2ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 2c-.3 0-.7 0-1 .1 1.2 1 2 2.3 2 3.9v2h5v-2c0-2.2-2.7-4-6-4ZM8 13c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4Z" />
              </svg>
            </div>

            <div>
              <span>Total de usuarios</span>
              <strong>{totalUsers}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.1 3.4 9.7 8 11 4.6-1.3 8-5.9 8-11V5l-8-3Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 11.5c-1.7-.6-3.1-1.6-4.1-2.9.7-1.1 2.3-1.8 4.1-1.8s3.4.7 4.1 1.8c-1 1.3-2.4 2.3-4.1 2.9Z" />
              </svg>
            </div>

            <div>
              <span>Administradores</span>
              <strong>{totalAdministrators}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.greenIcon}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 16.2 4.8 12 3.4 13.4 9 19 21 7l-1.4-1.4L9 16.2Z" />
              </svg>
            </div>

            <div>
              <span>Usuarios activos</span>
              <strong>{totalActiveUsers}</strong>
            </div>
          </article>
        </section>

        <section className={styles.usersCard}>
          <div className={styles.tableHeader}>
            <div>
              <h2>Gestión de usuarios</h2>
              <p>Consulta las cuentas registradas y su estado actual.</p>
            </div>

            <span className={styles.resultCount}>
              {filteredUsers.length} resultados
            </span>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchContainer}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m20.7 19.3-4.2-4.2A7.5 7.5 0 1 0 15.1 16l4.2 4.2 1.4-1.4ZM5 10.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z" />
              </svg>

              <input
                type="search"
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className={styles.roleFilter}
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="ALL">Todos los roles</option>
              <option value="ADMIN">Administradores</option>
              <option value="USER">Usuarios</option>
            </select>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo electrónico</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((currentUser) => (
                    <tr key={currentUser.id}>
                      <td>
                        <div className={styles.userInformation}>
                          <div className={styles.userAvatar}>
                            {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                          </div>

                          <span>{currentUser.name || 'Sin nombre'}</span>
                        </div>
                      </td>

                      <td className={styles.email}>
                        {currentUser.email || 'Sin correo'}
                      </td>

                      <td>
                        <span
                          className={
                            currentUser.role === 'ADMIN'
                              ? styles.adminRole
                              : styles.userRole
                          }
                        >
                          {currentUser.role === 'ADMIN'
                            ? 'Administrador'
                            : 'Usuario'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            currentUser.status
                              ? styles.activeStatus
                              : styles.inactiveStatus
                          }
                        >
                          <span className={styles.statusDot}></span>
                          {currentUser.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>
                      No se encontraron usuarios con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
};

export default AdminDashboard;