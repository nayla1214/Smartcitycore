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

const COURSE_STRUCTURE = [
  {
    title: 'Fundamentos de las Ciudades Inteligentes',
    topics: [
    'Concepto de Ciudad Inteligente',
    'Gobernanza Inteligente y Ciudadanía Digital',
    'Evolución de las Ciudades Tradicionales a Ciudades Inteligentes',
    'Plataforma web de urbanismo inteligente',
    ],
  },
  {
    title: 'Infraestructura Sostenible y Movilidad',
    topics: [
    'Infraestructura Verde (Smart Environment)',
    'Transporte Sostenible (Smart Transport)',
    'Espacios Urbanos (Smart Living)',
    ],
  },
  {
    title: 'Inteligencia Artificial y Aprendizaje',
    topics: [
    'Inteligencia Artificial aplicada a los Servicios Urbanos',
    'Educación Inteligente (Smart Education)',
    'Gemelos Digitales y Simulación Urbana',
    ],
  },
];

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
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);

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
    setSelectedModuleIndex(0);
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

  const selectedModule = moduleList[selectedModuleIndex];

  const getModuleTitle = (mod, index) =>
    COURSE_STRUCTURE[index]?.title || mod.title;

  const selectedTopics =
    COURSE_STRUCTURE[selectedModuleIndex]?.topics ||
    selectedModule?.topics ||
    selectedModule?.Topics ||
    [];

  const getTopicTitle = (topic) =>
    typeof topic === 'string'
      ? topic
      : topic.title || topic.name || 'Tema sin título';

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
                : 'FORMACIÓN SMARTCITYCORE'}
            </span>

            <h1>{course.name}</h1>
            <p>{course.description}</p>

            <div className={styles.courseInformation}>
              <div className={styles.informationItem}>
                <strong>{moduleList.length}</strong>
                <span>
                  {moduleList.length === 1
                    ? 'Módulo'
                    : 'Módulos'}
                </span>
              </div>

              {finalEvalInfo && (
                <div className={styles.informationItem}>
                  <strong>1</strong>
                  <span>Evaluación final</span>
                </div>
              )}

              <div className={styles.courseStatus}>
                <span className={styles.heroStatusDot}></span>
                <span>
                  {isAdmin
                    ? 'Modo administrador'
                    : progress.isCompleted
                      ? 'Curso completado'
                      : 'Curso en desarrollo'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.heroIcon}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 6.1C10.2 4.7 7.7 4 4.5 4H3v14h1.5c3.1 0 5.5.7 7.5 2.1V6.1Zm0 0C13.8 4.7 16.3 4 19.5 4H21v14h-1.5c-3.1 0-5.5.7-7.5 2.1V6.1Z" />
            </svg>
            <span className={styles.iconSpark}></span>
          </div>

          <div className={styles.heroCircleOne}></div>
          <div className={styles.heroCircleTwo}></div>
        </section>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
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

          <div className={styles.courseContentLayout}>
            <aside className={styles.modulesSidebar}>
              {moduleList.map((mod, index) => {
                const available = isModuleAvailable(mod, index);
                const passed = isModulePassed(mod);

                return (
                  <button
                    key={mod.id}
                    type="button"
                    disabled={!available}
                    onClick={() => setSelectedModuleIndex(index)}
                    className={`${styles.sidebarModule} ${
                      selectedModuleIndex === index
                        ? styles.activeModule
                        : ''
                    } ${!available ? styles.sidebarLocked : ''}`}
                  >
                    <span className={styles.sidebarNumber}>
                      MÓDULO {index + 1}
                    </span>

                    <strong>{getModuleTitle(mod, index)}</strong>

                    <span className={styles.sidebarStatus}>
                      {!isAdmin && !available
                        ? '🔒 Bloqueado'
                        : !isAdmin && passed
                          ? '✓ Aprobado'
                          : isAdmin
                            ? 'Disponible'
                            : 'En progreso'}
                    </span>
                  </button>
                );
              })}
            </aside>

            {selectedModule && (
              <div className={styles.topicsPanel}>
                <div className={styles.topicsHeader}>
                  <div>
                    <span className={styles.moduleNumber}>
                      Módulo {selectedModuleIndex + 1}
                    </span>
                    <h3>
                      {getModuleTitle(
                        selectedModule,
                        selectedModuleIndex
                      )}
                    </h3>
                    {selectedModule.description && (
                      <p>{selectedModule.description}</p>
                    )}
                  </div>

                  <span className={styles.topicCount}>
                    {selectedTopics.length}{' '}
                    {selectedTopics.length === 1 ? 'tema' : 'temas'}
                  </span>
                </div>

                <div className={styles.topicsList}>
                  {selectedTopics.map((topic, topicIndex) => {
                    const isFirstTopic =
                      selectedModuleIndex === 0 && topicIndex === 0;

                    const topicContent = (
                      <>
                        <span
                          className={`${styles.topicNumber} ${
                            isFirstTopic ? styles.firstTopicIcon : ''
                          }`}
                        >
                          {isFirstTopic ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M3 21V10l5-3v14H3Zm7 0V3l7 4v14h-7Zm9 0v-8l3 2v6h-3ZM5 12v2h1v-2H5Zm0 4v2h1v-2H5Zm7-9v2h2V7h-2Zm0 4v2h2v-2h-2Zm0 4v2h2v-2h-2Z" />
                            </svg>
                          ) : (
                            <>
                              {selectedModuleIndex + 1}.{topicIndex + 1}
                            </>
                          )}
                        </span>

                        <div>
                          <small>
                            TEMA {selectedModuleIndex + 1}.{topicIndex + 1}
                          </small>
                          <h4>{getTopicTitle(topic)}</h4>
                        </div>

                        {isFirstTopic && (
                          <span
                            className={styles.topicArrow}
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M9 7.5v9l7-4.5-7-4.5Z" />
                            </svg>
                          </span>
                        )}
                      </>
                    );

                    if (isFirstTopic) {
                      return (
                        <Link
                          key={
                            topic.id ||
                            `${selectedModule.id}-${topicIndex}`
                          }
                          to={`/module/${selectedModule.id}/topic/1.1`}
                          className={`${styles.topicItem} ${styles.topicLink}`}
                        >
                          {topicContent}
                        </Link>
                      );
                    }

                    return (
                      <div
                        key={
                          topic.id ||
                          `${selectedModule.id}-${topicIndex}`
                        }
                        className={styles.topicItem}
                      >
                        {topicContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className={styles.modulesList}>

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
