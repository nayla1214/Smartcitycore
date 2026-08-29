import {
  useContext,
  useEffect,
  useState,
} from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { getCourseById } from '../data/courseData';
import EvaluationForm from '../components/EvaluationForm';
import styles from './Course.module.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({
    modules: [],
    isCompleted: false,
    finalScore: null,
  });
  const [loading, setLoading] = useState(true);
  const [showFinalEval, setShowFinalEval] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const fetchData = async () => {
    try {
      setError('');

      let courseData = getCourseById(courseId);

      if (!courseData) {
        try {
          courseData = await api.get(`/courses/${courseId}`);
        } catch (apiError) {
          console.error('Error al cargar el curso:', apiError);
        }
      }

      let progressData = {
        modules: [],
        isCompleted: false,
        finalScore: null,
      };

      /*
       * El progreso se solicita únicamente para usuarios.
       * El administrador no realiza los cursos.
       */
      if (!isAdmin) {
        try {
          progressData = await api.get(
            `/courses/${courseId}/progress`
          );
        } catch (progressError) {
          console.error(
            'Error al cargar el progreso:',
            progressError
          );
        }
      }

      setCourse(courseData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error cargando el curso:', error);
      setError('No fue posible cargar la información del curso.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [courseId, isAdmin]);

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Cargando información del curso...</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className={styles.messagePage}>
        <div className={styles.messageCard}>
          <span>!</span>
          <h2>Curso no encontrado</h2>
          <p>
            No fue posible encontrar el curso solicitado.
          </p>

          <Link to="/dashboard" className={styles.backButton}>
            Regresar al panel
          </Link>
        </div>
      </main>
    );
  }

  const moduleList = course.modules || course.Modules || [];

  const isModuleAvailable = (mod, index) => {
    if (isAdmin) return true;
    if (progress.isCompleted) return true;
    if (index === 0) return true;

    const previousModule = moduleList[index - 1];

    const previousProgress = progress.modules?.find(
      (item) => item.moduleId === previousModule.id
    );

    return previousProgress?.passed === true;
  };

  const isModulePassed = (mod) => {
    if (progress.isCompleted) return true;

    return (
      progress.modules?.find(
        (item) => item.moduleId === mod.id
      )?.passed === true
    );
  };

  const passedModules = moduleList.filter((mod) =>
    isModulePassed(mod)
  ).length;

  const progressPercentage =
    moduleList.length > 0
      ? Math.round(
          (passedModules / moduleList.length) * 100
        )
      : 0;

  const allModulesPassed =
    moduleList.length > 0 &&
    moduleList.every((mod) => isModulePassed(mod));

  const finalEvalInfo =
    course.finalEvaluation || course.FinalEvaluation;

  const finalScore =
    progress.finalScore !== null &&
    progress.finalScore !== undefined
      ? Number(progress.finalScore).toFixed(1)
      : '100.0';

  return (
    <main className={styles.coursePage}>
      <div className={styles.courseContainer}>
        <Link
          to="/dashboard"
          className={styles.returnLink}
        >
          <span aria-hidden="true">←</span>
          Regresar al panel
        </Link>

        <section className={styles.courseHero}>
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>
              {isAdmin
                ? 'GESTIÓN DEL CURSO'
                : 'CURSO DE CAPACITACIÓN'}
            </span>

            <h1>{course.name}</h1>
            <p>{course.description}</p>

            <div className={styles.courseInformation}>
              <span>
                <strong>{moduleList.length}</strong>
                {moduleList.length === 1
                  ? ' módulo'
                  : ' módulos'}
              </span>

              {finalEvalInfo && (
                <span>
                  <strong>1</strong> evaluación final
                </span>
              )}

              <span>
                {isAdmin
                  ? 'Modo administrador'
                  : progress.isCompleted
                    ? 'Curso completado'
                    : 'Curso en desarrollo'}
              </span>
            </div>
          </div>

          <div className={styles.heroIcon}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4h16v16H4V4Zm3 3v2h10V7H7Zm0 4v2h10v-2H7Zm0 4v2h6v-2H7Z" />
            </svg>
          </div>

          <div className={styles.heroCircleOne}></div>
          <div className={styles.heroCircleTwo}></div>
        </section>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {!isAdmin && (
          <section className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <div>
                <span>PROGRESO GENERAL</span>
                <h2>Avance del curso</h2>
              </div>

              <strong>{progressPercentage}%</strong>
            </div>

            <div className={styles.generalProgressBar}>
              <span
                style={{
                  width: `${progressPercentage}%`,
                }}
              ></span>
            </div>

            <p>
              Has aprobado {passedModules} de{' '}
              {moduleList.length}{' '}
              {moduleList.length === 1
                ? 'módulo'
                : 'módulos'}
              .
            </p>
          </section>
        )}

        {!isAdmin && progress.isCompleted && (
          <section className={styles.completedMessage}>
            <div className={styles.completedIcon}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m9 16.2-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
              </svg>
            </div>

            <div>
              <h3>¡Curso completado!</h3>
              <p>
                Aprobaste la evaluación final con una
                calificación de <strong>{finalScore}%</strong>.
              </p>
            </div>

            <Link
              to="/dashboard"
              className={styles.certificateButton}
            >
              Ver mis certificados
            </Link>
          </section>
        )}

        <section className={styles.modulesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionLabel}>
                CONTENIDO
              </span>

              <h2>
                {isAdmin
                  ? 'Gestión de módulos'
                  : 'Módulos del curso'}
              </h2>

              <p>
                {isAdmin
                  ? 'Selecciona un módulo para administrar sus temas y contenidos.'
                  : 'Completa los módulos en el orden establecido para avanzar en el curso.'}
              </p>
            </div>

            <span className={styles.moduleCount}>
              {moduleList.length}{' '}
              {moduleList.length === 1
                ? 'módulo'
                : 'módulos'}
            </span>
          </div>

          <div className={styles.modulesList}>
            {moduleList.map((mod, index) => {
              const available = isModuleAvailable(
                mod,
                index
              );
              const passed = isModulePassed(mod);

              let moduleStatus = 'Disponible';

              if (!isAdmin) {
                if (passed) {
                  moduleStatus = 'Aprobado';
                } else if (!available) {
                  moduleStatus = 'Bloqueado';
                } else {
                  moduleStatus = 'En progreso';
                }
              }

              return (
                <article
                  key={mod.id}
                  className={`${styles.moduleItem} ${
                    !available ? styles.locked : ''
                  }`}
                >
                  <div className={styles.moduleOrder}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className={styles.moduleBody}>
                    <div className={styles.moduleHeader}>
                      <div>
                        <span
                          className={styles.moduleNumber}
                        >
                          Módulo {index + 1}
                        </span>

                        <h3>{mod.title}</h3>

                        {mod.description && (
                          <p>{mod.description}</p>
                        )}
                      </div>

                      <span
                        className={
                          isAdmin
                            ? styles.badgeAdmin
                            : passed
                              ? styles.badgeSuccess
                              : available
                                ? styles.badgeWarning
                                : styles.badgeLocked
                        }
                      >
                        <span
                          className={styles.statusDot}
                        ></span>
                        {moduleStatus}
                      </span>
                    </div>

                    <div className={styles.moduleFooter}>
                      {available ? (
                        <Link
                          to={`/module/${mod.id}`}
                          className={styles.moduleButton}
                        >
                          {isAdmin
                            ? 'Gestionar módulo'
                            : passed
                              ? 'Repasar módulo'
                              : 'Ir al módulo'}

                          <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <p className={styles.lockedMessage}>
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9h14v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4V7Z" />
                          </svg>

                          Completa y aprueba el módulo
                          anterior para desbloquearlo.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {finalEvalInfo && (
              <article
                className={`${styles.moduleItem} ${
                  !isAdmin &&
                  !allModulesPassed &&
                  !progress.isCompleted
                    ? styles.locked
                    : ''
                }`}
              >
                <div
                  className={`${styles.moduleOrder} ${styles.finalOrder}`}
                >
                  F
                </div>

                <div className={styles.moduleBody}>
                  <div className={styles.moduleHeader}>
                    <div>
                      <span
                        className={styles.moduleNumber}
                      >
                        Evaluación final
                      </span>

                      <h3>
                        Evaluación final del curso
                      </h3>

                      <p>
                        Comprueba los conocimientos adquiridos
                        durante todos los módulos.
                      </p>
                    </div>

                    <span
                      className={
                        isAdmin
                          ? styles.badgeAdmin
                          : progress.isCompleted
                            ? styles.badgeSuccess
                            : allModulesPassed
                              ? styles.badgeWarning
                              : styles.badgeLocked
                      }
                    >
                      <span
                        className={styles.statusDot}
                      ></span>

                      {isAdmin
                        ? 'Configurada'
                        : progress.isCompleted
                          ? 'Aprobada'
                          : allModulesPassed
                            ? 'Disponible'
                            : 'Bloqueada'}
                    </span>
                  </div>

                  {isAdmin && (
                    <p className={styles.adminInformation}>
                      La evaluación se encuentra configurada
                      para este curso.
                    </p>
                  )}

                  {!isAdmin &&
                    allModulesPassed &&
                    !progress.isCompleted &&
                    !showFinalEval && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowFinalEval(true)
                        }
                        className={styles.moduleButton}
                      >
                        Tomar evaluación final
                        <span aria-hidden="true">→</span>
                      </button>
                    )}

                  {!isAdmin &&
                    showFinalEval &&
                    !progress.isCompleted && (
                      <div
                        className={
                          styles.evaluationContainer
                        }
                      >
                        <EvaluationForm
                          evaluationId={
                            finalEvalInfo.id
                          }
                          courseId={course.id}
                          onSuccess={() => {
                            fetchData();
                            setShowFinalEval(false);
                          }}
                        />
                      </div>
                    )}

                  {!isAdmin &&
                    !allModulesPassed &&
                    !progress.isCompleted && (
                      <p className={styles.lockedMessage}>
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9h14v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4V7Z" />
                        </svg>

                        Completa y aprueba todos los módulos
                        para habilitar esta evaluación.
                      </p>
                    )}
                </div>
              </article>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default CourseDetail;