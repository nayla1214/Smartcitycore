import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { FiBookOpen } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

import defaultCourseImage from '../assets/ciudad1.jpg';
import styles from './Dashboard.module.css';

const getStoredCourses = (accountKey) => {
  if (!accountKey) return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(
        `smartcity:started-courses:${accountKey}`
      ) || '[]'
    );

    return Array.isArray(saved)
      ? saved
          .map(Number)
          .filter(
            (id) =>
              Number.isSafeInteger(id) && id > 0
          )
      : [];
  } catch {
    return [];
  }
};

const storeStartedCourses = (accountKey, ids) => {
  if (!accountKey) return;

  try {
    localStorage.setItem(
      `smartcity:started-courses:${accountKey}`,
      JSON.stringify([...new Set(ids)])
    );
  } catch {
    // El curso funciona aunque no se pueda guardar
    // información en este navegador.
  }
};

const withTimeout = (
  request,
  milliseconds = 15000
) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          'La consulta está tardando demasiado. Pulsa Reintentar.'
        )
      );
    }, milliseconds);

    Promise.resolve(request).then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const accountKey = String(
    user?.id ?? user?._id ?? user?.email ?? ''
  );

  const isAdmin = [
    'ADMIN',
    'SUPERADMIN',
  ].includes(user?.role);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCourses, setRetryCourses] = useState(0);

  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const gradingDialog = useRef(null);
  const courseTrigger = useRef(null);

  const session = useRef({
    accountKey,
    active: false,
  });

  const [startedCourses, setStartedCourses] =
    useState(() => ({
      accountKey,
      ids: getStoredCourses(accountKey),
      loading: Boolean(accountKey) && !isAdmin,
      error: '',
    }));

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const [
    retryStartedCourses,
    setRetryStartedCourses,
  ] = useState(0);

  const startedIds =
    startedCourses.accountKey === accountKey
      ? startedCourses.ids
      : [];

  const checkingStarted =
    !isAdmin &&
    (
      startedCourses.accountKey !== accountKey ||
      startedCourses.loading
    );

  const startedError =
    startedCourses.accountKey === accountKey
      ? startedCourses.error
      : '';

  // Consultar los cursos iniciados por esta cuenta.
  useEffect(() => {
    let active = true;

    const currentSession = {
      accountKey,
      active: true,
    };

    session.current = currentSession;

    setSelectedCourse(null);
    setStarting(false);
    setStartError('');

    const cachedIds = getStoredCourses(accountKey);

    setStartedCourses({
      accountKey,
      ids: cachedIds,
      loading: Boolean(accountKey) && !isAdmin,
      error: '',
    });

    if (!isAdmin && accountKey) {
      withTimeout(
        api.get('/users/me/courses/started')
      )
        .then((data) => {
          if (!active) return;

          if (!Array.isArray(data?.courseIds)) {
            throw new Error(
              'El servidor no devolvió los cursos iniciados.'
            );
          }

          const serverIds = data.courseIds
            .map(Number)
            .filter(
              (id) =>
                Number.isSafeInteger(id) && id > 0
            );

          const ids = [
            ...new Set([
              ...cachedIds,
              ...serverIds,
            ]),
          ];

          storeStartedCourses(accountKey, ids);

          setStartedCourses({
            accountKey,
            ids,
            loading: false,
            error: '',
          });
        })
        .catch((requestError) => {
          if (!active) return;

          setStartedCourses({
            accountKey,
            ids: cachedIds,
            loading: false,
            error:
              requestError.message ||
              'No se pudo consultar si ya comenzaste el curso.',
          });
        });
    }

    return () => {
      active = false;
      currentSession.active = false;
    };
  }, [
    accountKey,
    isAdmin,
    retryStartedCourses,
  ]);

  // El catálogo se obtiene siempre de la base de datos.
  // También se actualiza al volver a esta ventana.
  useEffect(() => {
    let active = true;
    let requestNumber = 0;

    setLoading(true);

    const fetchCourses = async () => {
      const currentRequest = ++requestNumber;

      try {
        setError('');

        const data = await withTimeout(
          api.get('/courses')
        );

        if (
          !active ||
          currentRequest !== requestNumber
        ) {
          return;
        }

        if (!Array.isArray(data)) {
          throw new Error(
            'El servidor no devolvió una lista válida de cursos.'
          );
        }

        setCourses(data);
      } catch (requestError) {
        if (
          active &&
          currentRequest === requestNumber
        ) {
          setError(
            requestError.message ||
              'No fue posible cargar los cursos disponibles.'
          );
        }
      } finally {
        if (
          active &&
          currentRequest === requestNumber
        ) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    window.addEventListener('focus', fetchCourses);

    return () => {
      active = false;
      window.removeEventListener(
        'focus',
        fetchCourses
      );
    };
  }, [retryCourses]);

  // Apertura y cierre del diálogo inicial.
  useEffect(() => {
    if (
      !selectedCourse ||
      !gradingDialog.current
    ) {
      return undefined;
    }

    const dialog = gradingDialog.current;
    const previousOverflow =
      document.body.style.overflow;

    if (!dialog.open) {
      dialog.showModal();
    }

    document.body.style.overflow = 'hidden';

    return () => {
      if (dialog.open) {
        dialog.close();
      }

      document.body.style.overflow =
        previousOverflow;

      courseTrigger.current?.focus();
    };
  }, [selectedCourse]);

  const getRoleName = (role) => {
    if (role === 'SUPERADMIN') {
      return 'Superadministrador';
    }

    if (role === 'ADMIN') {
      return 'Administrador';
    }

    return 'Usuario';
  };

  const getCourseImage = (course) =>
    course.image_url ||
    course.imageUrl ||
    course.image ||
    (
      Number(course.id) === 1
        ? defaultCourseImage
        : ''
    );

  const beginCourse = (course, event) => {
    const courseId = Number(course.id);

    // Un curso iniciado abre directamente.
    if (startedIds.includes(courseId)) {
      navigate(`/course/${courseId}`);
      return;
    }

    if (checkingStarted || startedError) return;

    courseTrigger.current = event.currentTarget;

    setStartError('');
    setSelectedCourse(course);
  };

  const closeGrading = () => {
    if (starting) return;

    setSelectedCourse(null);
    setStartError('');
  };

  const acceptGrading = async () => {
    if (!selectedCourse || starting) return;

    const courseId = Number(selectedCourse.id);
    const currentAccount = accountKey;

    const currentSession = session.current;

    setStarting(true);
    setStartError('');

    const sessionIsCurrent = () =>
      currentSession.active &&
      session.current === currentSession &&
      currentSession.accountKey === currentAccount;

    try {
      await api.post(
        `/users/me/courses/${courseId}/start`,
        {}
      );

      if (!sessionIsCurrent()) return;

      const ids = [
        ...new Set([
          ...getStoredCourses(currentAccount),
          ...startedIds,
          courseId,
        ]),
      ];

      storeStartedCourses(currentAccount, ids);

      setStartedCourses({
        accountKey: currentAccount,
        ids,
        loading: false,
        error: '',
      });

      setSelectedCourse(null);
      navigate(`/course/${courseId}`);
    } catch (requestError) {
      if (sessionIsCurrent()) {
        setStartError(
          requestError.message ||
            'No se pudo iniciar el curso. Intenta nuevamente.'
        );
      }
    } finally {
      if (sessionIsCurrent()) {
        setStarting(false);
      }
    }
  };

  const originalCourseSelected =
    Number(selectedCourse?.id) === 1;

  if (loading) {
    return (
      <main
        className={styles.loadingPage}
        aria-busy="true"
      >
        <div
          className={styles.spinner}
          aria-hidden="true"
        />

        <p role="status">
          Cargando cursos disponibles...
        </p>
      </main>
    );
  }

  return (
    <main className={styles.dashboardPage}>
      <div className={styles.dashboardContainer}>
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1>
              Bienvenido,{' '}
              <span>
                {user?.name || 'Usuario'}
              </span>
            </h1>

            <div className={styles.userRole}>
              <span
                className={styles.roleDot}
                aria-hidden="true"
              />

              {getRoleName(user?.role)}
            </div>
          </div>

          <div
            className={styles.welcomeIllustration}
            aria-hidden="true"
          >
            <div className={styles.iconCircle}>
              <svg viewBox="0 0 24 24">
                <path d="M12 3 1.8 8.2 12 13.4l8-4.1v6h2V8.2L12 3Zm-6 9.1v4.2c0 1.7 2.7 3.7 6 3.7s6-2 6-3.7v-4.2l-6 3.1-6-3.1Z" />
              </svg>
            </div>
          </div>
        </section>

        <section className={styles.coursesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionLabel}>
                FORMACIÓN
              </span>

              <h2>Cursos disponibles</h2>
            </div>

            <span className={styles.courseCount}>
              {courses.length}{' '}
              {courses.length === 1
                ? 'curso'
                : 'cursos'}
            </span>
          </div>

          {error && (
            <div
              className={styles.errorMessage}
              role="alert"
            >
              {error}{' '}

              <button
                type="button"
                onClick={() =>
                  setRetryCourses(
                    (value) => value + 1
                  )
                }
              >
                Reintentar
              </button>
            </div>
          )}

          {!isAdmin && startedError && (
            <div
              className={styles.errorMessage}
              role="alert"
            >
              {startedError}{' '}

              <button
                type="button"
                onClick={() =>
                  setRetryStartedCourses(
                    (value) => value + 1
                  )
                }
              >
                Reintentar
              </button>
            </div>
          )}

          {courses.length > 0 ? (
            <div className={styles.courseGrid}>
              {courses.map((course) => {
                const courseId = Number(course.id);

                const hasStarted =
                  startedIds.includes(courseId);

                const image = getCourseImage(course);

                const modules =
                  course.Modules ||
                  course.modules ||
                  [];

                const hasModules = modules.length > 0;

                return (
                  <article
                    key={course.id}
                    className={styles.courseCard}
                  >
                    <div
                      className={
                        styles.courseImageContainer
                      }
                    >
                      {image ? (
  <img
    src={image}
    alt=""
    className={styles.courseImage}
    onError={(event) => {
      if (event.currentTarget.dataset.fallbackApplied) {
        return;
      }

      event.currentTarget.dataset.fallbackApplied = 'true';
      event.currentTarget.src = defaultCourseImage;
    }}
  />
) : (
                        <div
                          className={styles.courseImage}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '200px',
                            background: '#eaf2ff',
                            color: '#2459a4',
                          }}
                          aria-hidden="true"
                        >
                          <FiBookOpen size={64} />
                        </div>
                      )}
                    </div>

                    <div
                      className={styles.courseContent}
                    >
                      <h3>
                        {course.name ||
                          course.title ||
                          'Curso'}
                      </h3>

                      <p>
                        {course.description ||
                          'Consulta el contenido disponible de este curso.'}
                      </p>

                      {isAdmin ? (
                        <Link
                          to={
                            user?.role === 'ADMIN'
                              ? '/admin/courses'
                              : '/admin'
                          }
                          className={
                            styles.courseButton
                          }
                        >
                          Ir a administración
                        </Link>
                      ) : !hasModules ? (
                        <button
                          type="button"
                          className={
                            styles.courseButton
                          }
                          disabled
                        >
                          Contenido en preparación
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={
                            styles.courseButton
                          }
                          aria-haspopup={
                            hasStarted
                              ? undefined
                              : 'dialog'
                          }
                          aria-busy={
                            !hasStarted &&
                            checkingStarted
                          }
                          disabled={
                            !hasStarted &&
                            (
                              checkingStarted ||
                              Boolean(startedError)
                            )
                          }
                          onClick={(event) =>
                            beginCourse(course, event)
                          }
                        >
                          {hasStarted
                            ? 'Continuar'
                            : 'Comenzar curso'}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : !error ? (
            <div className={styles.emptyCourses}>
              <div className={styles.emptyIcon}>
                <FiBookOpen aria-hidden="true" />
              </div>

              <h3>No hay cursos disponibles</h3>

              <p>
                En este momento no existen cursos
                publicados.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <dialog
        ref={gradingDialog}
        className={styles.gradingDialog}
        aria-labelledby="grading-title"
        onCancel={(event) => {
          event.preventDefault();
          closeGrading();
        }}
      >
        <header className={styles.gradingHeader}>
          <div>
            <span className={styles.sectionLabel}>
              ANTES DE COMENZAR
            </span>

            <h2 id="grading-title">
              {originalCourseSelected
                ? 'Así se calcula tu nota'
                : 'Comenzar curso'}
            </h2>
          </div>

          <button
            type="button"
            className={styles.gradingClose}
            disabled={starting}
            onClick={closeGrading}
            aria-label="Cerrar información del curso"
          >
            ×
          </button>
        </header>

        <div className={styles.gradingBody}>
          {startError && (
            <div
              className={styles.errorMessage}
              role="alert"
            >
              {startError}
            </div>
          )}

          {originalCourseSelected ? (
            <>
              <p className={styles.gradingLead}>
                El curso tiene 3 módulos, 10
                evaluaciones de temas y 3 evaluaciones
                integradoras. Tu nota final se calcula
                sobre <strong>10 puntos</strong>.
              </p>

              <div className={styles.gradingSummary}>
                <span>
                  <strong>6 puntos</strong>
                  Evaluaciones de temas
                </span>

                <span>
                  <strong>4 puntos</strong>
                  Evaluaciones integradoras
                </span>
              </div>

              <h3>Distribución de la nota final</h3>

              <div className={styles.gradingTableWrap}>
                <table className={styles.gradingTable}>
                  <caption
                    className={styles.visuallyHidden}
                  >
                    Aporte de cada componente a la
                    nota final sobre 10 puntos
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">Componente</th>
                      <th scope="col">Cantidad</th>
                      <th scope="col">
                        Valor de cada evaluación
                      </th>
                      <th scope="col">Aporte total</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <th scope="row">
                        Evaluaciones de los temas
                      </th>
                      <td>10</td>
                      <td>0,60 puntos</td>
                      <td>6 puntos</td>
                    </tr>

                    <tr>
                      <th scope="row">
                        Integradora del módulo 1
                      </th>
                      <td>1</td>
                      <td>1,60 puntos</td>
                      <td>1,60 puntos</td>
                    </tr>

                    <tr>
                      <th scope="row">
                        Integradora del módulo 2
                      </th>
                      <td>1</td>
                      <td>1,20 puntos</td>
                      <td>1,20 puntos</td>
                    </tr>

                    <tr>
                      <th scope="row">
                        Integradora del módulo 3
                      </th>
                      <td>1</td>
                      <td>1,20 puntos</td>
                      <td>1,20 puntos</td>
                    </tr>
                  </tbody>

                  <tfoot>
                    <tr>
                      <th scope="row">Total</th>
                      <td>13</td>
                      <td />
                      <td>10 puntos</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className={styles.gradingModules}>
                <div>
                  <span>Módulo 1 · 4 temas</span>
                  <strong>4 puntos</strong>
                  <small>
                    2,40 de temas + 1,60 de integradora
                  </small>
                </div>

                <div>
                  <span>Módulo 2 · 3 temas</span>
                  <strong>3 puntos</strong>
                  <small>
                    1,80 de temas + 1,20 de integradora
                  </small>
                </div>

                <div>
                  <span>Módulo 3 · 3 temas</span>
                  <strong>3 puntos</strong>
                  <small>
                    1,80 de temas + 1,20 de integradora
                  </small>
                </div>
              </div>

              <section className={styles.gradingExample}>
                <h3>
                  ¿Cómo se convierte tu calificación?
                </h3>

                <p>
                  Cada evaluación se califica sobre 10.
                  Su aporte se calcula así:{' '}
                  <strong>
                    calificación ÷ 10 × valor de la
                    evaluación
                  </strong>.
                </p>

                <ul>
                  <li>
                    Un 8/10 en un tema aporta{' '}
                    <strong>0,48 puntos</strong>.
                  </li>

                  <li>
                    Un 8/10 en la integradora del
                    módulo 1 aporta{' '}
                    <strong>1,28 puntos</strong>.
                  </li>

                  <li>
                    Un 8/10 en las integradoras del
                    módulo 2 o 3 aporta{' '}
                    <strong>
                      0,96 puntos cada una
                    </strong>.
                  </li>
                </ul>

                <p>
                  Si obtienes 8 en todas las
                  evaluaciones, tu nota final será{' '}
                  <strong>8/10</strong>.
                </p>
              </section>

              <section className={styles.gradingRules}>
                <h3>¿Qué necesitas para aprobar?</h3>

                <p>
                  Debes aprobar las 10 evaluaciones
                  de temas y las 3 integradoras, con
                  un mínimo de{' '}
                  <strong>
                    7/10 (70 %) en cada una
                  </strong>
                  , para completar el curso.
                  No necesitas obtener 10/10.
                </p>

                <p>
                  En las evaluaciones de 5 preguntas,
                  cada respuesta correcta vale 2 puntos:
                  necesitas 4 respuestas correctas,
                  que equivalen a 8/10.
                  Las integradoras permiten obtener
                  puntos parciales.
                </p>
              </section>
            </>
          ) : (
            <>
              <h3>{selectedCourse?.name}</h3>

              <p className={styles.gradingLead}>
                {selectedCourse?.description ||
                  'Consulta los módulos y actividades disponibles de este curso.'}
              </p>

              <p>
                Al continuar se registrará el inicio
                de este curso en tu cuenta.
              </p>
            </>
          )}
        </div>

        <footer className={styles.gradingFooter}>
          <button
            type="button"
            className={styles.gradingAccept}
            disabled={starting}
            onClick={acceptGrading}
          >
            {starting
              ? 'Iniciando...'
              : originalCourseSelected
                ? 'Estoy de acuerdo'
                : 'Comenzar curso'}

            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </dialog>
    </main>
  );
};

export default Dashboard;