import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
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
const TopicIcon = ({ topicNumber }) => {
  const paths = {
    '1.1':
      'M3 21V10l5-3v14H3Zm7 0V3l7 4v14h-7Zm9 0v-8l3 2v6h-3ZM5 12v2h1v-2H5Zm0 4v2h1v-2H5Zm7-9v2h2V7h-2Zm0 4v2h2v-2h-2Zm0 4v2h2v-2h-2Z',

    '1.2':
      'M12 2 2 7v2h20V7L12 2ZM4 11v7H2v3h20v-3h-2v-7h-3v7h-3v-7h-4v7H7v-7H4Z',

    '1.3':
      'M12 3a9 9 0 0 1 8.5 6H23l-4 4-4-4h3.3A7 7 0 0 0 5.4 7L3.8 5.8A9 9 0 0 1 12 3Zm-7 8 4 4H5.7a7 7 0 0 0 12.9 2l1.6 1.2A9 9 0 0 1 3.5 15H1l4-4Z',

    '1.4':
      'M3 3h18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-7v2h4v2H6v-2h4v-2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1 4v9h16V7H4Zm2 7v-3h2v3H6Zm4 0V9h2v5h-2Zm4 0v-4h2v4h-2Z',

    '2.1':
      'M20 3C10 2 4 5 4 12a7 7 0 0 0 1.5 4.3L3 20l1.6 1.2 2.5-3.5A7 7 0 0 0 18 14c1.5-3 2-6.5 2-11ZM8 16l-1.5-1.3L15 7l1.3 1.5L8 16Z',

    '2.2':
      'M7 2h10a4 4 0 0 1 4 4v12a2 2 0 0 1-2 2v2h-3v-2H8v2H5v-2a2 2 0 0 1-2-2V6a4 4 0 0 1 4-4Zm0 2v2h10V4H7ZM5 8v6h14V8H5Zm2 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',

    '2.3':
      'm7 2-5 8h3l-3 5h4v6h2v-6h4l-3-5h3L7 2Zm7 11h8v2h-8v-2Zm-1 4h10v2h-2v3h-2v-3h-3v3h-2v-3h-1v-2Z',

    '3.1':
      'M9 1h2v3h2V1h2v3h3a2 2 0 0 1 2 2v3h3v2h-3v2h3v2h-3v3a2 2 0 0 1-2 2h-3v3h-2v-3h-2v3H9v-3H6a2 2 0 0 1-2-2v-3H1v-2h3v-2H1V9h3V6a2 2 0 0 1 2-2h3V1ZM8 8v8h8V8H8Zm2 2h4v4h-4v-4Z',

    '3.2':
      'M12 3 1 8.5 12 14l9-4.5V16h2V8.5L12 3ZM5 12v5c0 2 3 4 7 4s7-2 7-4v-5l-7 3.5L5 12Z',

    '3.3':
      'm12 2 10 5v10l-10 5-10-5V7l10-5Zm0 2.3L5.2 7.7 12 11l6.8-3.3L12 4.3ZM4 9.3v6.5l7 3.5v-6.5L4 9.3Zm16 0-7 3.5v6.5l7-3.5V9.3Z',
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={
          paths[topicNumber] ||
          paths['1.1']
        }
      />
    </svg>
  );
};
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
  const [lockedMessage, setLockedMessage] = useState('');
  const [selectedModuleIndex, setSelectedModuleIndex] =
  useState(null);
  const [topic13Passed, setTopic13Passed] = useState(false);

  const [integrativeStatus, setIntegrativeStatus] = useState({
    loading: true, available: false, passed: false, error: '',
  });
  const [integrativeRetry, setIntegrativeRetry] = useState(0);

  useEffect(() => {
    let active = true;
    if (Number(courseId) !== 1) return;
    setIntegrativeStatus({ loading: true, available: false, passed: false, error: '' });
    const load = async () => {
      try {
        const results = await Promise.all(
          [1, 2, 3, 4, 11].map((id) => api.get(`/evaluations/${id}/progress`))
        );
        if (active) setIntegrativeStatus({
          loading: false,
          available: results.slice(0, 4).every((result) => result.passed === true),
          passed: results[4].passed === true,
          error: '',
        });
      } catch (err) {
        if (active) setIntegrativeStatus({
          loading: false, available: false, passed: false,
          error: 'No se pudo consultar el estado de la evaluación.',
        });
      }
    };
    load();
    return () => { active = false; };
  }, [courseId, integrativeRetry]);

  const [integrativeStatus2, setIntegrativeStatus2] = useState({ loading: true, available: false, passed: false, error: '' });
  const [integrativeRetry2, setIntegrativeRetry2] = useState(0);
  useEffect(() => {
    let active = true;
    if (Number(courseId) !== 1) return undefined;
    setIntegrativeStatus2({ loading: true, available: false, passed: false, error: '' });
    const load = async () => {
      try {
        const results = await Promise.all([5, 6, 12].map(id => api.get(`/evaluations/${id}/progress`)));
        let available = false;
        if (results[0].passed === true && results[1].passed === true) {
          const practical = await api.get('/evaluations/practical/2.3');
          available = practical?.passed === true;
        }
        if (active) setIntegrativeStatus2({ loading: false, available, passed: results[2].passed === true, error: '' });
      } catch (err) {
        if (active) setIntegrativeStatus2({ loading: false, available: false, passed: false, error: 'No se pudo consultar el estado de la evaluación.' });
      }
    };
    load();
    return () => { active = false; };
  }, [courseId, integrativeRetry2]);

  const [integrativeStatus3, setIntegrativeStatus3] = useState({ loading: true, available: false, passed: false, error: '' });
  const [integrativeRetry3, setIntegrativeRetry3] = useState(0);
  useEffect(() => {
    let active = true;
    if (Number(courseId) !== 1) return undefined;
    setIntegrativeStatus3({ loading: true, available: false, passed: false, error: '' });
    const load = async () => {
      try {
        const results = await Promise.all(['3.1', '3.2', '3.3'].map(async topic => {
          const evaluation = await api.get(`/evaluations/topic/${topic}`);
          return api.get(`/evaluations/${evaluation.id}/progress`);
        }));
        const integrative = await api.get('/evaluations/13/progress');
        if (active) setIntegrativeStatus3({ loading: false, available: results.every(result => result.passed === true), passed: integrative.passed === true, error: '' });
      } catch (err) {
        if (active) setIntegrativeStatus3({ loading: false, available: false, passed: false, error: 'No se pudo consultar el estado de la evaluación.' });
      }
    };
    load();
    return () => { active = false; };
  }, [courseId, integrativeRetry3]);

  const isAdmin = user?.role === 'ADMIN';

  const fetchData = async () => {
    try {
      setError('');
      setTopic13Passed(false);

    const courseData = await api.get(
  `/courses/${courseId}`
);
const modulesWithTopics = await Promise.all(
  (courseData.Modules || courseData.modules || []).map(
    async (module) => {
      const topics = await api.get(
        `/modules/${module.id}/topics`
      );

      if (!Array.isArray(topics)) {
        throw new Error(
          'No se pudieron consultar los temas del curso.'
        );
      }

      return {
        ...module,
        Topics: topics,
      };
    }
  )
);

courseData.Modules = modulesWithTopics;
courseData.modules = modulesWithTopics;
      let progressData = {
        modules: [],
        isCompleted: false,
        finalScore: null,
      };

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

          setError(
            'No se pudo consultar tu avance. Actualiza la página.'
          );
        }

        // La evaluación del tema 1.3 está registrada con ID 3.
        // Se consulta directamente para habilitar el tema 1.4.
        if (Number(courseId) === 1) {
          try {
            const evaluationProgress = await api.get(
              '/evaluations/3/progress'
            );

            setTopic13Passed(evaluationProgress?.passed === true);
          } catch (evaluationError) {
            console.error(
              'Error al consultar la evaluación 1.3:',
              evaluationError
            );

            setError(
              'No se pudo consultar todo tu avance. Actualiza la página para volver a intentarlo.'
            );
          }
        }
      }

      setCourse(courseData);
      setProgress(progressData);
    } catch (loadError) {
      console.error('Error cargando el curso:', loadError);

      setError(
        'No fue posible cargar la información del curso.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setSelectedModuleIndex(null);
    setLockedMessage('');
    setShowFinalEval(false);
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
          <p>No fue posible encontrar el curso solicitado.</p>

          <Link
            to="/dashboard"
            className={styles.backButton}
          >
            Regresar al panel
          </Link>
        </div>
      </main>
    );
  }

 const moduleList = [
  ...(course.Modules || course.modules || []),
].sort(
  (first, second) =>
    Number(first.order_number) -
    Number(second.order_number)
);
  const selectedModule = moduleList[selectedModuleIndex];

  // El título registrado por el administrador tiene prioridad.
const getModuleTitle = (mod, index) =>
  mod?.title ||
  (
    Number(courseId) === 1
      ? COURSE_STRUCTURE[index]?.title
      : null
  ) ||
  'Módulo sin título';

// Los temas actuales se conservan únicamente
// para el curso original de Ciudades Inteligentes.
const selectedTopics =
  selectedModule?.Topics ||
  selectedModule?.topics ||
  (
    Number(courseId) === 1
      ? COURSE_STRUCTURE[selectedModuleIndex]?.topics
      : []
  ) ||
  [];

  const getTopicTitle = (topic) =>
    typeof topic === 'string'
      ? topic
      : topic.title || topic.name || 'Tema sin título';

  const getModuleProgress = (mod) =>
    progress.modules?.find(
      (item) => Number(item.moduleId) === Number(mod?.id)
    );

  const isModuleAvailable = (mod, index) => {
    if (isAdmin || progress.isCompleted || index === 0) {
      return true;
    }

    const previousModule = moduleList[index - 1];

    return getModuleProgress(previousModule)?.passed === true;
  };

  const isModulePassed = (mod) => {
    if (progress.isCompleted) return true;

    return getModuleProgress(mod)?.passed === true;
  };

  const allModulesPassed =
    moduleList.length > 0 &&
    moduleList.every((mod) => isModulePassed(mod));

  const getLockedMessage = (moduleIndex) => {
    const previousModule = moduleList[moduleIndex - 1];
    const previousProgress = getModuleProgress(previousModule);

    const pendingTopic = previousProgress?.topics?.find(
      (topic) => !topic.passed
    );

    if (!pendingTopic) {
      return `Completa el módulo ${moduleIndex} para desbloquear el módulo ${moduleIndex + 1}.`;
    }

    if (
      pendingTopic.percentage !== null &&
      pendingTopic.percentage !== undefined
    ) {
      return `Te falta aprobar el tema ${pendingTopic.topicNumber}. Obtuviste ${Number(pendingTopic.percentage).toFixed(0)} % y necesitas al menos 70 %.`;
    }

    return `Te falta aprobar el tema ${pendingTopic.topicNumber} para desbloquear el módulo ${moduleIndex + 1}.`;
  };

  const topic11Passed =
    getModuleProgress(moduleList[0])
      ?.topics?.find((topic) => topic.topicNumber === '1.1')
      ?.passed === true;

  const topic12Passed =
    getModuleProgress(moduleList[0])
      ?.topics?.find((topic) => topic.topicNumber === '1.2')
      ?.passed === true;

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
    <div className={styles.heroTopRow}>
      <span className={styles.heroLabel}>
        {isAdmin
          ? 'GESTIÓN DEL CURSO'
          : 'FORMACIÓN SMARTCITYCORE'}
      </span>

      <div className={styles.courseStatus}>
        <span
          className={styles.heroStatusDot}
          aria-hidden="true"
        />

        <span>
          {isAdmin
            ? 'Modo administrador'
            : progress.isCompleted
              ? 'Curso completado'
              : 'Curso en desarrollo'}
        </span>
      </div>
    </div>

    <h1>{course.name}</h1>

    <p>{course.description}</p>

    {finalEvalInfo && (
      <div className={styles.courseInformation}>
        <div className={styles.informationItem}>
          <strong>1</strong>
          <span>Evaluación final</span>
        </div>
      </div>
    )}
  </div>

  <div className={styles.heroIcon}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6.1C10.2 4.7 7.7 4 4.5 4H3v14h1.5c3.1 0 5.5.7 7.5 2.1V6.1Zm0 0C13.8 4.7 16.3 4 19.5 4H21v14h-1.5c-3.1 0-5.5.7-7.5 2.1V6.1Z" />
    </svg>

    <span className={styles.iconSpark} />
  </div>

  <div className={styles.heroCircleOne} />
  <div className={styles.heroCircleTwo} />
</section>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        {!isAdmin && progress.isCompleted && (
          <section className={styles.completedMessage}>
            <div className={styles.completedIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 16.2-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
              </svg>
            </div>

            <div>
              <h3>¡Curso completado!</h3>

              <p>
                Aprobaste la evaluación final con una calificación de{' '}
                <strong>{finalScore}%</strong>.
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
              {moduleList.length === 1 ? 'módulo' : 'módulos'}
            </span>
          </div>

          {lockedMessage && (
            <p className={styles.lockedMessage} role="status">
              🔒 {lockedMessage}
            </p>
          )}

          <div
  className={`${styles.courseContentLayout} ${
    selectedModuleIndex === null
      ? styles.modulesOnly
      : ''
  }`}
>
            <aside className={styles.modulesSidebar}>
              {moduleList.map((mod, index) => {
                const available = isModuleAvailable(mod, index);
                const passed = isModulePassed(mod);

                return (
                 <button
  key={mod.id}
  type="button"
  onClick={() => {
    if (!available) {
      setLockedMessage(
        getLockedMessage(index)
      );
      return;
    }

    setLockedMessage('');

    setSelectedModuleIndex((previous) =>
      previous === index ? null : index
    );
  }}
  className={`${styles.sidebarModule} ${
    selectedModuleIndex === index
      ? styles.activeModule
      : ''
  } ${
    !available ? styles.sidebarLocked : ''
  }`}
>
  <span
    className={styles.moduleVisual}
    aria-hidden="true"
  >
    {index === 0 ? (
      <svg viewBox="0 0 24 24">
        <path d="M3 21V10l5-3v14H3Zm7 0V3l7 4v14h-7Zm9 0v-8l3 2v6h-3ZM5 12v2h1v-2H5Zm0 4v2h1v-2H5Zm7-9v2h2V7h-2Zm0 4v2h2v-2h-2Zm0 4v2h2v-2h-2Z" />
      </svg>
    ) : index === 1 ? (
      <svg viewBox="0 0 24 24">
        <path d="M20 3C10 2 4 5 4 12a7 7 0 0 0 1.5 4.3L3 20l1.6 1.2 2.5-3.5A7 7 0 0 0 18 14c1.5-3 2-6.5 2-11ZM8 16l-1.5-1.3L15 7l1.3 1.5L8 16Z" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24">
        <path d="M9 1h2v3h2V1h2v3h3a2 2 0 0 1 2 2v3h3v2h-3v2h3v2h-3v3a2 2 0 0 1-2 2h-3v3h-2v-3h-2v3H9v-3H6a2 2 0 0 1-2-2v-3H1v-2h3v-2H1V9h3V6a2 2 0 0 1 2-2h3V1ZM8 8v8h8V8H8Zm2 2h4v4h-4v-4Z" />
      </svg>
    )}
  </span>

  <span className={styles.moduleText}>
    <span className={styles.sidebarNumber}>
      MÓDULO {index + 1}
    </span>

    <strong>
      {getModuleTitle(mod, index)}
    </strong>

    <span className={styles.sidebarStatus}>
      {!isAdmin && !available
        ? '🔒 Bloqueado'
        : !isAdmin && passed
          ? '✓ Aprobado'
          : isAdmin
            ? 'Disponible'
            : 'En progreso'}
    </span>
  </span>

  <span
    className={styles.moduleToggle}
    aria-hidden="true"
  >
    {!available
      ? '🔒'
      : selectedModuleIndex === index
        ? '−'
        : '+'}
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
                  {selectedTopics.length === 0 && (
  <p role="status">
    Los temas de este módulo están en preparación.
  </p>
)}
                  {selectedTopics.map((topic, topicIndex) => {
                    
                    const isFirstTopic =
                      selectedModuleIndex === 0 &&
                      topicIndex === 0;

                    const isSecondTopic =
                      selectedModuleIndex === 0 &&
                      topicIndex === 1;

                    const isThirdTopic =
                      selectedModuleIndex === 0 &&
                      topicIndex === 2;

                    const isFourthTopic =
                      selectedModuleIndex === 0 &&
                      topicIndex === 3;

                                    const isTopic21 =
                      selectedModuleIndex === 1 &&
                      topicIndex === 0;

                    const isTopic22 =
                      selectedModuleIndex === 1 &&
                      topicIndex === 1;

                    const isTopic23 =
                      selectedModuleIndex === 1 &&
                      topicIndex === 2;

                    const module2Topics =
                      getModuleProgress(selectedModule)?.topics || [];

                    const topic21Passed = module2Topics.some(
                      (item) =>
                        item.topicNumber === '2.1' &&
                        item.passed === true
                    );

                    const topic22Passed = module2Topics.some(
                      (item) =>
                        item.topicNumber === '2.2' &&
                        item.passed === true
                    );

                    const module2Available = isModuleAvailable(
                      selectedModule,
                      selectedModuleIndex
                    );

                    const module3Available = selectedModuleIndex === 2 && isModuleAvailable(selectedModule, selectedModuleIndex);
                    const module3Topics = getModuleProgress(selectedModule)?.topics || [];
                    const topic31Passed = module3Topics.some(item => item.topicNumber === '3.1' && item.passed === true);
                    const topic32Passed = module3Topics.some(item => item.topicNumber === '3.2' && item.passed === true);
                   const originalTopicAvailable =
                      isFirstTopic ||
                      (isSecondTopic &&
                        (isAdmin || topic11Passed)) ||
                      (isThirdTopic &&
                        (isAdmin || topic12Passed)) ||
                      (isFourthTopic &&
                        (isAdmin || topic13Passed)) ||
                      (isTopic21 && module2Available) ||
                      (isTopic22 &&
                        module2Available &&
                        (isAdmin || topic21Passed)) ||
                      (isTopic23 &&
                        module2Available &&
                        (isAdmin || topic22Passed)) ||
                      (selectedModuleIndex === 2 && module3Available &&
                        (topicIndex === 0 || isAdmin ||
                          (topicIndex === 1 && topic31Passed) ||
                          (topicIndex === 2 && topic32Passed)));

                    const topicNumber =
  (
    typeof topic === 'object' &&
    topic !== null &&
    topic.topicNumber
  ) ||
  `${selectedModule.order_number || selectedModuleIndex + 1}.${topicIndex + 1}`;

// El curso original conserva sus requisitos.
// Los cursos nuevos permiten abrir su contenido inicial.
const canOpenTopic =
  Number(courseId) === 1
    ? originalTopicAvailable
    : true;

                    const topicContent = (
                      <>
                        
                         <span
  className={`${styles.topicNumber} ${styles.firstTopicIcon}`}
>
  <TopicIcon topicNumber={topicNumber} />
</span>

                        <div>
                          <small>TEMA {topicNumber}</small>
                          <h4>{getTopicTitle(topic)}</h4>
                        </div>

                        {canOpenTopic && (
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

                    if (canOpenTopic) {
                      return (
                        <Link
                          key={
                            topic.id ||
                            `${selectedModule.id}-${topicIndex}`
                          }
                          to={`/module/${selectedModule.id}/topic/${topicNumber}`}
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
                  {Number(courseId) === 1 && selectedModuleIndex === 0 && (
                    <article className={`${styles.integrativeCard} ${!integrativeStatus.available ? styles.integrativeLocked : ''}`}>
                      <div className={styles.integrativeIcon} aria-hidden="true">☷</div>
                      <div className={styles.integrativeCopy}>
                        <small>EVALUACIÓN INTEGRADORA · MÓDULO 1</small>
                        <h4>Comprueba lo aprendido en el módulo</h4>
                        <p>5 actividades · 10 puntos · Aprobación desde 70 %</p>
                        {integrativeStatus.loading ? <p role="status">Consultando requisitos…</p>
                          : integrativeStatus.error ? <p role="alert">{integrativeStatus.error}</p>
                          : integrativeStatus.passed ? <span>✓ Evaluación aprobada</span>
                          : integrativeStatus.available ? <span>Disponible para realizar</span>
                          : <span>🔒 Aprueba los temas 1.1, 1.2, 1.3 y 1.4 para ingresar.</span>}
                      </div>
                      {integrativeStatus.error ? (
                        <button type="button" className={styles.integrativeButton} onClick={() => setIntegrativeRetry((value) => value + 1)}>Reintentar</button>
                      ) : integrativeStatus.available && !integrativeStatus.loading ? (
                        <Link className={styles.integrativeButton} to="/module/1/integrative-evaluation">
                          {integrativeStatus.passed ? 'Ver resultado' : 'Comenzar'} <span aria-hidden="true">→</span>
                        </Link>
                      ) : <button type="button" className={styles.integrativeButton} disabled>{integrativeStatus.loading ? 'Consultando…' : 'Bloqueada'}</button>}
                    </article>
                  )}
                  {Number(courseId) === 1 && selectedModuleIndex === 1 && (
                    <article className={`${styles.integrativeCard} ${!integrativeStatus2.available ? styles.integrativeLocked : ''}`}>
                      <div className={styles.integrativeIcon} aria-hidden="true">☷</div>
                      <div className={styles.integrativeCopy}>
                        <small>EVALUACIÓN INTEGRADORA · MÓDULO 2</small>
                        <h4>Comprueba lo aprendido en el módulo</h4>
                        <p>5 actividades · 10 puntos · Aprobación desde 70 %</p>
                        {integrativeStatus2.loading ? <p role="status">Consultando requisitos…</p>
                          : integrativeStatus2.error ? <p role="alert">{integrativeStatus2.error}</p>
                          : integrativeStatus2.passed ? <span>✓ Evaluación aprobada</span>
                          : integrativeStatus2.available ? <span>Disponible para realizar</span>
                          : <span>🔒 Aprueba los temas 2.1, 2.2 y la actividad práctica del 2.3 para ingresar.</span>}
                      </div>
                      {integrativeStatus2.error ? (
                        <button type="button" className={styles.integrativeButton} onClick={() => setIntegrativeRetry2((value) => value + 1)}>Reintentar</button>
                      ) : integrativeStatus2.available && !integrativeStatus2.loading ? (
                        <Link className={styles.integrativeButton} to="/module/2/integrative-evaluation">
                          {integrativeStatus2.passed ? 'Ver resultado' : 'Comenzar'} <span aria-hidden="true">→</span>
                        </Link>
                      ) : <button type="button" className={styles.integrativeButton} disabled>{integrativeStatus2.loading ? 'Consultando…' : 'Bloqueada'}</button>}
                    </article>
                  )}
                  {Number(courseId) === 1 && selectedModuleIndex === 2 && (
                    <article className={`${styles.integrativeCard} ${!integrativeStatus3.available ? styles.integrativeLocked : ''}`}>
                      <div className={styles.integrativeIcon} aria-hidden="true">☷</div>
                      <div className={styles.integrativeCopy}>
                        <small>EVALUACIÓN INTEGRADORA · MÓDULO 3</small>
                        <h4>Comprueba lo aprendido en el módulo</h4>
                        <p>5 actividades · 10 puntos · Aprobación desde 70 %</p>
                        {integrativeStatus3.loading ? <p role="status">Consultando requisitos…</p>
                          : integrativeStatus3.error ? <p role="alert">{integrativeStatus3.error}</p>
                          : integrativeStatus3.passed ? <span>✓ Evaluación aprobada</span>
                          : integrativeStatus3.available ? <span>Disponible para realizar</span>
                          : <span>🔒 Aprueba los temas 3.1, 3.2 y 3.3 para ingresar.</span>}
                      </div>
                      {integrativeStatus3.error ? (
                        <button type="button" className={styles.integrativeButton} onClick={() => setIntegrativeRetry3((value) => value + 1)}>Reintentar</button>
                      ) : integrativeStatus3.available && !integrativeStatus3.loading ? (
                        <Link className={styles.integrativeButton} to="/module/3/integrative-evaluation">
                          {integrativeStatus3.passed ? 'Ver resultado' : 'Comenzar'} <span aria-hidden="true">→</span>
                        </Link>
                      ) : <button type="button" className={styles.integrativeButton} disabled>{integrativeStatus3.loading ? 'Consultando…' : 'Bloqueada'}</button>}
                    </article>
                  )}
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
                      <span className={styles.moduleNumber}>
                        Evaluación final
                      </span>

                      <h3>Evaluación final del curso</h3>

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
                      <span className={styles.statusDot}></span>

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
                        onClick={() => setShowFinalEval(true)}
                        className={styles.moduleButton}
                      >
                        Tomar evaluación final
                        <span aria-hidden="true">→</span>
                      </button>
                    )}

                  {!isAdmin &&
                    showFinalEval &&
                    !progress.isCompleted && (
                      <div className={styles.evaluationContainer}>
                        <EvaluationForm
                          evaluationId={finalEvalInfo.id}
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