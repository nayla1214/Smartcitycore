import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useLocation,
} from 'react-router-dom';

import {
  FiUsers,
  FiShield,
  FiCheckCircle,
  FiArrowLeft,
  FiSearch,
} from 'react-icons/fi';

import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import styles from './AdminDashboard.module.css';

const ROLE_NAMES = {
  USER: 'Participante',
  ADMIN: 'Director del proyecto',
  SUPERADMIN: 'Superadministrador',
  DOCENTE: 'Docente',
};

const getId = (user) => user?.id ?? user?._id;

const formatScore = (value) =>
  value === null || value === undefined
    ? '—'
    : `${(Number(value) / 10).toLocaleString(
        'es-EC',
        { maximumFractionDigits: 2 }
      )}/10`;

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('es-EC');
};

// Formulario de asignaciones del administrador tutor.
const TeacherAssignments = ({
  teacher,
  onClose,
}) => {
  const [courses, setCourses] = useState([]);
  const [assignedIds, setAssignedIds] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);

  const mountedRef = useRef(false);
  const busyRef = useRef(false);
  const teacherId = Number(getId(teacher));

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadAssignments = async () => {
      setLoading(true);
      setError('');
      setCourseId('');

      try {
        const data = await api.get('/courses/admin');

        if (!Array.isArray(data)) {
          throw new Error(
            'La lista de cursos no es válida.'
          );
        }

        const assignments = await Promise.all(
          data.map(async (course) => {
            const rows = await api.get(
              `/teachers/courses/${course.id}/teachers`
            );

            if (!Array.isArray(rows)) {
              throw new Error(
                'La lista de asignaciones no es válida.'
              );
            }

            return rows.some(
              (row) =>
                Number(row.userId) === teacherId
            )
              ? Number(course.id)
              : null;
          })
        );

        if (!active) return;

        setCourses(data);
        setAssignedIds(
          assignments.filter((id) => id !== null)
        );
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar las asignaciones.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAssignments();

    return () => {
      active = false;
    };
  }, [teacherId, retry]);

  const assignCourse = async (event) => {
    event.preventDefault();

    if (!courseId || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setError('');
    setMessage('');

    const selectedId = Number(courseId);

    try {
      const response = await api.post(
        `/teachers/courses/${selectedId}/teachers`,
        { userId: teacherId }
      );

      if (!mountedRef.current) return;

      setAssignedIds((current) => [
        ...new Set([...current, selectedId]),
      ]);

      setCourseId('');
      setMessage(
        response.message ||
          'Curso asignado correctamente.'
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          requestError.message ||
            'No se pudo asignar el curso.'
        );
      }
    } finally {
      busyRef.current = false;

      if (mountedRef.current) setBusy(false);
    }
  };

  const removeCourse = async (course) => {
    if (busyRef.current) return;

    const confirmed = window.confirm(
      `¿Retirar el curso «${course.name}» de ${teacher.name}?`
    );

    if (!confirmed) return;

    busyRef.current = true;
    setBusy(true);
    setError('');
    setMessage('');

    try {
      // Usa request porque el servicio api puede
      // no tener un método delete definido.
      await api.post(
        `/teachers/courses/${course.id}/teachers/${teacherId}/remove`,
        {}
      );

      if (!mountedRef.current) return;

      setAssignedIds((current) =>
        current.filter(
          (id) => id !== Number(course.id)
        )
      );

      setMessage(
        'Asignación retirada correctamente.'
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          requestError.message ||
            'No se pudo retirar la asignación.'
        );
      }
    } finally {
      busyRef.current = false;

      if (mountedRef.current) setBusy(false);
    }
  };

  const assignedCourses = courses.filter(
    (course) =>
      assignedIds.includes(Number(course.id))
  );

  const availableCourses = courses.filter(
    (course) =>
      course.status === true &&
      !assignedIds.includes(Number(course.id))
  );

  return (
    <section
      className={styles.usersCard}
      aria-labelledby="teacher-assignments-title"
    >
      <div className={styles.tableHeader}>
        <div>
          <span className={styles.pageSubtitle}>
            ASIGNACIÓN DOCENTE
          </span>

          <h2 id="teacher-assignments-title">
            Cursos de {teacher.name}
          </h2>

          <p>{teacher.email}</p>
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onClose}
          disabled={busy}
        >
          Cerrar
        </button>
      </div>

      {message && (
        <p
          className={styles.successMessage}
          role="status"
        >
          {message}
        </p>
      )}

      {error && (
        <div
          className={styles.errorMessage}
          role="alert"
        >
          <p>{error}</p>

          <button
            type="button"
            className={styles.secondaryButton}
            disabled={busy || loading}
            onClick={() =>
              setRetry((current) => current + 1)
            }
          >
            Actualizar asignaciones
          </button>
        </div>
      )}

      {loading ? (
        <p role="status">
          Consultando cursos asignados…
        </p>
      ) : (
        <>
          {!error && (
            <form
              className={styles.profileForm}
              onSubmit={assignCourse}
            >
              <label>
                Curso disponible

                <select
                  className={styles.roleFilter}
                  value={courseId}
                  onChange={(event) =>
                    setCourseId(event.target.value)
                  }
                  disabled={
                    busy ||
                    !teacher.status ||
                    !availableCourses.length
                  }
                  required
                >
                  <option value="">
                    Selecciona un curso
                  </option>

                  {availableCourses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={
                  busy ||
                  !teacher.status ||
                  !courseId
                }
              >
                {busy ? 'Guardando…' : 'Asignar curso'}
              </button>
            </form>
          )}

          {!teacher.status && (
            <p>
              Activa la cuenta para asignarle nuevos cursos.
            </p>
          )}

          <h3>Cursos asignados</h3>

          {!assignedCourses.length && !error ? (
            <p>
              Este docente todavía no tiene cursos asignados.
            </p>
          ) : (
            <div className={styles.tableContainer}>
              <table>
                <caption>
                  Cursos asignados al docente
                </caption>

                <thead>
                  <tr>
                    <th scope="col">Curso</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {assignedCourses.map((course) => (
                    <tr key={course.id}>
                      <th scope="row">
                        {course.name}
                      </th>

                      <td>
                        {course.status
                          ? 'Activo'
                          : 'Inactivo'}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={busy}
                          onClick={() =>
                            removeCourse(course)
                          }
                        >
                          Retirar asignación
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const allowed = ['ADMIN', 'SUPERADMIN'].includes(
    user?.role
  );

  const isSuperAdmin =
    user?.role === 'SUPERADMIN';

  const isCourseAdmin =
    user?.role === 'ADMIN';

  const accountKey = String(getId(user) || '');
  const usersView =
    location.pathname === '/admin/users';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] =
    useState('ALL');
  const [statusFilter, setStatusFilter] =
    useState('ALL');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [selectedUser, setSelectedUser] =
    useState(null);
  const [selectedTeacher, setSelectedTeacher] =
    useState(null);

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] =
    useState(false);
  const [progressError, setProgressError] =
    useState('');

  const requestRef = useRef(0);
  const mutationRef = useRef(false);
  const detailHeadingRef = useRef(null);

  useEffect(() => {
    let active = true;

    requestRef.current += 1;

    setUsers([]);
    setSelectedUser(null);
    setSelectedTeacher(null);
    setProgress(null);
    setProgressError('');
    setProgressLoading(false);
    setError('');
    setMessage('');
    setLoading(true);

    const loadUsers = async () => {
      if (!allowed) {
        if (active) setLoading(false);
        return;
      }

      try {
        const data = await api.get('/users');

        if (!Array.isArray(data)) {
          throw new Error(
            'El servidor devolvió una lista de usuarios inválida.'
          );
        }

        if (active) setUsers(data);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No fue posible cargar los usuarios.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      active = false;
      requestRef.current += 1;
    };
  }, [
    accountKey,
    user?.role,
    allowed,
    retry,
  ]);

  useEffect(() => {
    requestRef.current += 1;
    setSelectedUser(null);
    setSelectedTeacher(null);
    setProgress(null);
    setProgressLoading(false);
    setProgressError('');
  }, [location.pathname]);

  useEffect(() => {
    if (selectedUser) {
      detailHeadingRef.current?.focus();
    }
  }, [selectedUser]);

  const visibleUsers = useMemo(
    () =>
      isSuperAdmin
        ? users
        : users.filter((item) =>
            ['USER', 'DOCENTE'].includes(item.role)
          ),
    [users, isSuperAdmin]
  );

  const participants = users.filter(
    (item) => item.role === 'USER'
  );

  const activeParticipants = participants.filter(
    (item) => item.status === true
  ).length;

  const administrators = users.filter(
    (item) => item.role === 'ADMIN'
  ).length;

  const teachers = users.filter(
    (item) => item.role === 'DOCENTE'
  ).length;

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visibleUsers.filter((item) => {
      const matchesSearch =
        (item.name || '')
          .toLowerCase()
          .includes(query) ||
        (item.email || '')
          .toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === 'ALL' ||
        item.role === roleFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' &&
          item.status === true) ||
        (statusFilter === 'INACTIVE' &&
          item.status !== true);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    visibleUsers,
    search,
    roleFilter,
    statusFilter,
  ]);

  const replaceUser = (updatedUser) => {
    setUsers((current) =>
      current.map((item) =>
        String(getId(item)) ===
        String(getId(updatedUser))
          ? { ...item, ...updatedUser }
          : item
      )
    );

    setSelectedTeacher((current) =>
      current &&
      String(getId(current)) ===
        String(getId(updatedUser))
        ? updatedUser.role === 'DOCENTE'
          ? { ...current, ...updatedUser }
          : null
        : current
    );
  };

  const canManage = (target) => {
    if (
      String(getId(target)) === accountKey ||
      !['USER', 'ADMIN', 'DOCENTE'].includes(
        target.role
      )
    ) {
      return false;
    }

    return (
      isSuperAdmin ||
      ['USER', 'DOCENTE'].includes(target.role)
    );
  };

  const changeStatus = async (target) => {
    if (
      mutationRef.current ||
      !canManage(target)
    ) {
      return;
    }

    const nextStatus = !target.status;

    if (
      !window.confirm(
        `${nextStatus ? '¿Activar' : '¿Desactivar'} la cuenta de ${target.name}?`
      )
    ) {
      return;
    }

    mutationRef.current = true;
    setBusyId(getId(target));
    setError('');
    setMessage('');

    try {
      const response = await api.put(
        `/users/${getId(target)}/status`,
        { status: nextStatus }
      );

      replaceUser(response.user);
      setMessage(response.message);
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo cambiar el estado.'
      );
    } finally {
      mutationRef.current = false;
      setBusyId(null);
    }
  };

  const changeRole = async (target, role) => {
    if (
      !isSuperAdmin ||
      mutationRef.current ||
      !canManage(target) ||
      role === target.role
    ) {
      return;
    }

    const removalNotice =
      target.role === 'DOCENTE' &&
      role !== 'DOCENTE'
        ? ' Se retirarán sus asignaciones docentes.'
        : '';

    if (
      !window.confirm(
        `¿Cambiar el rol de ${target.name} a ${ROLE_NAMES[role]}?${removalNotice}`
      )
    ) {
      return;
    }

    mutationRef.current = true;
    setBusyId(getId(target));
    setError('');
    setMessage('');

    try {
      const response = await api.put(
        `/users/${getId(target)}/role`,
        { role }
      );

      replaceUser(response.user);
      setMessage(response.message);
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo cambiar el rol.'
      );
    } finally {
      mutationRef.current = false;
      setBusyId(null);
    }
  };

  const loadProgress = async (target) => {
    const request = ++requestRef.current;

    setSelectedTeacher(null);
    setSelectedUser(target);
    setProgress(null);
    setProgressError('');
    setProgressLoading(true);

    try {
      const data = await api.get(
        `/users/${getId(target)}/progress`
      );

      if (request !== requestRef.current) return;

      setProgress(data);
    } catch (requestError) {
      if (request !== requestRef.current) return;

      setProgressError(
        requestError.message ||
          'No se pudo consultar el avance.'
      );
    } finally {
      if (request === requestRef.current) {
        setProgressLoading(false);
      }
    }
  };

  const closeProgress = () => {
    requestRef.current += 1;
    setSelectedUser(null);
    setProgress(null);
    setProgressLoading(false);
    setProgressError('');
  };

  if (!allowed) {
    return (
      <div className={styles.accessPage}>
        <div className={styles.accessDenied}>
          <h1>Acceso denegado</h1>
          <p>
            Esta sección requiere permisos
            administrativos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminContainer}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.pageSubtitle}>
              GESTIÓN DEL PROYECTO
            </span>

            <h1>
              {usersView
                ? 'Gestión de usuarios'
                : 'Panel administrativo'}
            </h1>

            <p>
              Administra participantes y docentes,
              asigna cursos y consulta el seguimiento
              académico.
            </p>
          </div>

          <div className={styles.adminProfile}>
            <div className={styles.avatar}>
              {user?.name
                ?.charAt(0)
                .toUpperCase() || 'A'}
            </div>

            <div>
              <span>{ROLE_NAMES[user.role]}</span>
              <strong>{user.name}</strong>
            </div>
          </div>
        </header>

        {!usersView && (
          <section
            className={styles.statistics}
            aria-label="Resumen de cuentas"
          >
            {[
              {
                label: 'Participantes registrados',
                value: participants.length,
                Icon: FiUsers,
                color: styles.blueIcon,
              },
              {
                label: 'Participantes activos',
                value: activeParticipants,
                Icon: FiCheckCircle,
                color: styles.greenIcon,
              },
              {
                label: 'Directores / administradores',
                value: administrators,
                Icon: FiShield,
                color: styles.purpleIcon,
              },
              {
                label: 'Docentes registrados',
                value: teachers,
                Icon: FiUsers,
                color: styles.greenIcon,
              },
            ].map(
              ({ label, value, Icon, color }) => (
                <article
                  key={label}
                  className={styles.statCard}
                >
                  <div
                    className={`${styles.statIcon} ${color}`}
                  >
                    <Icon aria-hidden="true" />
                  </div>

                  <div>
                    <span>{label}</span>
                    <strong>
                      {loading ? '—' : value}
                    </strong>
                  </div>
                </article>
              )
            )}
          </section>
        )}

        {message && (
          <p
            className={styles.successMessage}
            role="status"
          >
            {message}
          </p>
        )}

        {error && (
          <div
            className={styles.errorMessage}
            role="alert"
          >
            <p>{error}</p>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() =>
                setRetry((value) => value + 1)
              }
              disabled={busyId !== null}
            >
              Actualizar lista
            </button>
          </div>
        )}

        {usersView &&
          selectedTeacher &&
          isCourseAdmin && (
            <TeacherAssignments
              key={getId(selectedTeacher)}
              teacher={selectedTeacher}
              onClose={() =>
                setSelectedTeacher(null)
              }
            />
          )}

        {!usersView ? null : selectedUser ? (
          <section className={styles.usersCard}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={closeProgress}
            >
              <FiArrowLeft aria-hidden="true" />
              Regresar a usuarios
            </button>

            <div className={styles.detailHeading}>
              <span className={styles.pageSubtitle}>
                SEGUIMIENTO ACADÉMICO
              </span>

              <h2
                ref={detailHeadingRef}
                tabIndex={-1}
              >
                {selectedUser.name}
              </h2>

              <p>{selectedUser.email}</p>
            </div>

            {progressLoading && (
              <p role="status">
                Consultando avance e intentos…
              </p>
            )}

            {progressError && (
              <div
                className={styles.errorMessage}
                role="alert"
              >
                <p>{progressError}</p>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() =>
                    loadProgress(selectedUser)
                  }
                >
                  Reintentar
                </button>
              </div>
            )}

            {progress && !progressLoading && (
              <>
                {!progress.courses?.length && (
                  <p className={styles.emptyState}>
                    Este participante todavía no tiene
                    cursos iniciados.
                  </p>
                )}

                {(progress.courses || []).map(
                  (course) => (
                    <article
                      key={course.id}
                      className={styles.courseDetail}
                    >
                      <header
                        className={styles.tableHeader}
                      >
                        <div>
                          <h3>{course.name}</h3>
                          <p>
                            {course.completedModules} de{' '}
                            {course.totalModules} módulos
                            aprobados
                          </p>
                        </div>

                        <strong
                          className={styles.resultCount}
                        >
                          {course.progress} % de avance
                        </strong>
                      </header>

                      {(course.modules || [])
                        .filter(
                          (module) => module.supported
                        )
                        .map((module) => (
                          <section
                            key={module.id}
                            className={styles.moduleDetail}
                          >
                            <h4>
                              Módulo {module.order}:{' '}
                              {module.title}
                            </h4>

                            <p>
                              Avance: {module.progress} % ·
                              Videos:{' '}
                              {module.completedVideos}/
                              {module.totalVideos} ·
                              Lecturas:{' '}
                              {module.readings?.viewed}/
                              {module.readings?.total}
                            </p>

                            <div
                              className={
                                styles.tableContainer
                              }
                            >
                              <table>
                                <caption>
                                  Evaluaciones del módulo{' '}
                                  {module.order}
                                </caption>

                                <thead>
                                  <tr>
                                    <th scope="col">
                                      Evaluación
                                    </th>
                                    <th scope="col">
                                      Intentos
                                    </th>
                                    <th scope="col">
                                      Mejor nota
                                    </th>
                                    <th scope="col">
                                      Estado
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {[
                                    ...(
                                      module.evaluations ||
                                      []
                                    ).map((evaluation) => ({
                                      ...evaluation,
                                      label:
                                        `Tema ${evaluation.topic}`,
                                      key: evaluation.topic,
                                    })),
                                    {
                                      ...(
                                        module.integrative ||
                                        {}
                                      ),
                                      label: 'Integradora',
                                      key: 'integrative',
                                    },
                                  ].map((evaluation) => (
                                    <tr
                                      key={evaluation.key}
                                    >
                                      <th scope="row">
                                        {evaluation.label}
                                      </th>
                                      <td>
                                        {evaluation.attempts ??
                                          '—'}
                                      </td>
                                      <td>
                                        {formatScore(
                                          evaluation.bestScore
                                        )}
                                      </td>
                                      <td>
                                        {evaluation.passed
                                          ? 'Aprobada'
                                          : evaluation.bestScore !=
                                              null
                                            ? 'Por aprobar'
                                            : 'Pendiente'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </section>
                        ))}
                    </article>
                  )
                )}

                <section
                  className={styles.courseDetail}
                >
                  <h3>Historial de intentos</h3>

                  <div
                    className={styles.tableContainer}
                  >
                    <table>
                      <caption>
                        Nota obtenida en cada intento
                      </caption>

                      <thead>
                        <tr>
                          <th scope="col">
                            Evaluación
                          </th>
                          <th scope="col">Fecha</th>
                          <th scope="col">Nota</th>
                          <th scope="col">
                            Resultado
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {(progress.attempts || []).map(
                          (attempt) => (
                            <tr key={attempt.id}>
                              <th scope="row">
                                {attempt.title}
                              </th>
                              <td>
                                {formatDate(
                                  attempt.attemptedAt
                                )}
                              </td>
                              <td>
                                {formatScore(
                                  attempt.score
                                )}
                              </td>
                              <td>
                                {attempt.passed
                                  ? 'Aprobada'
                                  : 'No aprobada'}
                              </td>
                            </tr>
                          )
                        )}

                        {!progress.attempts?.length && (
                          <tr>
                            <td
                              colSpan={4}
                              className={styles.emptyState}
                            >
                              Todavía no hay intentos
                              registrados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </section>
        ) : (
          <section className={styles.usersCard}>
            <div className={styles.tableHeader}>
              <div>
                <h2>
                  {isSuperAdmin
                    ? 'Cuentas de la plataforma'
                    : 'Participantes y docentes'}
                </h2>

                <p>
                  Consulta el seguimiento de participantes
                  y las acciones disponibles para cada
                  cuenta.
                </p>
              </div>

              <span className={styles.resultCount}>
                {filteredUsers.length} resultados
              </span>
            </div>

            <div className={styles.filters}>
              <label
                className={styles.searchContainer}
              >
                <FiSearch aria-hidden="true" />

                <input
                  type="search"
                  aria-label="Buscar por nombre o correo"
                  placeholder="Buscar por nombre o correo…"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </label>

              <select
                className={styles.roleFilter}
                aria-label="Filtrar por rol"
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
              >
                <option value="ALL">
                  Todos los roles
                </option>
                <option value="USER">
                  Participantes
                </option>
                <option value="DOCENTE">
                  Docentes
                </option>

                {isSuperAdmin && (
                  <>
                    <option value="ADMIN">
                      Administradores
                    </option>
                    <option value="SUPERADMIN">
                      Superadministradores
                    </option>
                  </>
                )}
              </select>

              <select
                className={styles.roleFilter}
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">
                  Todos los estados
                </option>
                <option value="ACTIVE">
                  Activos
                </option>
                <option value="INACTIVE">
                  Inactivos
                </option>
              </select>
            </div>

            {loading ? (
              <p role="status">
                Cargando usuarios…
              </p>
            ) : (
              <div className={styles.tableContainer}>
                <table>
                  <caption>
                    Cuentas registradas y acciones
                    disponibles
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">Usuario</th>
                      <th scope="col">
                        Correo electrónico
                      </th>
                      <th scope="col">Rol</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((target) => (
                      <tr key={getId(target)}>
                        <td>
                          <div
                            className={
                              styles.userInformation
                            }
                          >
                            <div
                              className={
                                styles.userAvatar
                              }
                            >
                              {target.name
                                ?.charAt(0)
                                .toUpperCase() || 'U'}
                            </div>

                            <span>
                              {target.name ||
                                'Sin nombre'}
                            </span>
                          </div>
                        </td>

                        <td className={styles.email}>
                          {target.email}
                        </td>

                        <td>
                          <span
                            className={
                              target.role === 'USER'
                                ? styles.userRole
                                : styles.adminRole
                            }
                          >
                            {ROLE_NAMES[target.role] ||
                              target.role}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              target.status
                                ? styles.activeStatus
                                : styles.inactiveStatus
                            }
                          >
                            <span
                              className={styles.statusDot}
                              aria-hidden="true"
                            />

                            {target.status
                              ? 'Activo'
                              : 'Inactivo'}
                          </span>
                        </td>

                        <td>
                          <div
                            className={styles.rowActions}
                          >
                            {target.role === 'USER' && (
                              <button
                                type="button"
                                className={
                                  styles.primaryButton
                                }
                                disabled={busyId !== null}
                                onClick={() =>
                                  loadProgress(target)
                                }
                              >
                                Ver seguimiento
                              </button>
                            )}

                            {isCourseAdmin &&
                              target.role ===
                                'DOCENTE' && (
                                <button
                                  type="button"
                                  className={
                                    styles.primaryButton
                                  }
                                  disabled={
                                    busyId !== null
                                  }
                                 onClick={() => {
  setSelectedTeacher(target);

  window.requestAnimationFrame(() => {
    document
      .getElementById('teacher-assignments-title')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  });
}}
                                >
                                  Asignar cursos
                                </button>
                              )}

                            {canManage(target) && (
                              <button
                                type="button"
                                className={
                                  styles.secondaryButton
                                }
                                disabled={busyId !== null}
                                onClick={() =>
                                  changeStatus(target)
                                }
                              >
                                {busyId === getId(target)
                                  ? 'Guardando…'
                                  : target.status
                                    ? 'Desactivar'
                                    : 'Activar'}
                              </button>
                            )}

                            {isSuperAdmin &&
                              canManage(target) && (
                                <select
                                  className={
                                    styles.roleFilter
                                  }
                                  aria-label={
                                    `Cambiar rol de ${target.name}`
                                  }
                                  value={target.role}
                                  disabled={
                                    busyId !== null
                                  }
                                  onChange={(event) =>
                                    changeRole(
                                      target,
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="USER">
                                    Participante
                                  </option>

                                  <option
                                    value="DOCENTE"
                                    disabled={
                                      !target.status &&
                                      target.role !==
                                        'DOCENTE'
                                    }
                                  >
                                    Docente
                                  </option>

                                  <option
                                    value="ADMIN"
                                    disabled={
                                      !target.status &&
                                      target.role !==
                                        'ADMIN'
                                    }
                                  >
                                    Administrador
                                  </option>
                                </select>
                              )}

                            {!canManage(target) &&
                              target.role !==
                                'USER' && (
                                <span>
                                  {String(
                                    getId(target)
                                  ) === accountKey
                                    ? 'Tu cuenta'
                                    : 'Cuenta protegida'}
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!filteredUsers.length && (
                      <tr>
                        <td
                          colSpan={5}
                          className={styles.emptyState}
                        >
                          No se encontraron cuentas con
                          los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {!usersView && (
          <div className={styles.bottomActions}>
            <Link
              to="/admin/users"
              className={styles.primaryButton}
            >
              Ir a gestión de usuarios
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Perfil administrativo sin medallas ni avance.
export const AdminAccount = () => {
  const { user, updateUser } =
    useContext(AuthContext);

  const [name, setName] =
    useState(user?.name || '');
  const [email, setEmail] =
    useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const savingRef = useRef(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user?.name, user?.email]);

  const save = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;

    setMessage('');
    setError('');

    if (!name.trim() || !email.trim()) {
      setError(
        'Completa tu nombre y correo electrónico.'
      );
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      await updateUser({
        name: name.trim(),
        email: email.trim(),
      });

      setMessage(
        'Perfil actualizado correctamente.'
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo actualizar el perfil.'
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminContainer}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.pageSubtitle}>
              MI CUENTA
            </span>

            <h1>Perfil administrativo</h1>
            <p>{ROLE_NAMES[user?.role]}</p>
          </div>
        </header>

        <section className={styles.usersCard}>
          <h2>Información personal</h2>

          {message && (
            <p
              className={styles.successMessage}
              role="status"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              className={styles.errorMessage}
              role="alert"
            >
              {error}
            </p>
          )}

          <form
            className={styles.profileForm}
            onSubmit={save}
            aria-busy={saving}
          >
            <label>
              Nombre completo

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
                disabled={saving}
                required
              />
            </label>

            <label>
              Correo electrónico

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                disabled={saving}
                required
              />
            </label>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? 'Guardando…'
                : 'Guardar cambios'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;