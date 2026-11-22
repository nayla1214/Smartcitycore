import RequiredReadings, { useRequiredReadings } from '../components/RequiredReadings';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import sharedStyles from './TopicDetail.module.css';
import module3Styles from './Topic3Design.module.css';
const styles = { ...sharedStyles, ...module3Styles };
import Topic31Activities from '../components/Topic31Activities';
const Module3Art = ({ topic }) => (<svg viewBox="0 0 280 210" role="img" aria-label={topic === '3.1' ? 'Inteligencia artificial para los servicios urbanos' : topic === '3.2' ? 'Educación y aprendizaje digital' : 'Gemelo digital de una ciudad'}><ellipse cx="140" cy="108" rx="122" ry="90" fill="#eee8fa"/><circle cx="229" cy="39" r="18" fill="#fff0cc"/>{topic === '3.2' ? <><rect x="55" y="42" width="173" height="115" rx="12" fill="white" stroke="#ad92db" strokeWidth="2"/><path d="M107 181h72m-37-23v23" stroke="#9976cb" strokeWidth="5" strokeLinecap="round"/><path d="M141 83c-20-12-44-12-58-4v48c18-6 37-5 58 6 21-11 40-12 58-6V79c-14-8-38-8-58 4Z" fill="#e2d6f4" stroke="#a58aca" strokeWidth="2"/><path d="M141 83v49m-44-39 28 5m-28 10 28 5m31-15 28-5m-28 20 28-5" stroke="#a58aca" strokeWidth="2"/></> : topic === '3.1' ? <><rect x="85" y="49" width="111" height="111" rx="18" fill="white" stroke="#a78bce" strokeWidth="2"/><rect x="111" y="74" width="60" height="60" rx="10" fill="#d9c8f1"/>{[104,125,146,167].map(x=><g key={x} stroke="#a98acb" strokeWidth="3"><path d={`M${x} 36v13m0 111v13`}/></g>)}{[70,91,112,133].map(y=><path key={y} d={`M72 ${y}h13m111 0h13`} stroke="#a98acb" strokeWidth="3"/>)}<circle cx="130" cy="98" r="5" fill="#7854c5"/><circle cx="153" cy="98" r="5" fill="#7854c5"/><path d="M128 116h27" stroke="#7854c5" strokeWidth="3" strokeLinecap="round"/><path d="M25 183h231" stroke="#c4b0e5" strokeWidth="2"/></> : <><path d="m39 139 57-32 57 32-57 33Z" fill="#d9c9f0" stroke="#aa8ace"/><path d="M67 120V63l31-16v76m0-76 27 16v61" fill="white" stroke="#a58aca" strokeWidth="2"/><path d="m153 139 57-32 47 28-54 34Z" fill="#e2d8f4" stroke="#aa8ace" strokeDasharray="5 4"/><path d="M180 123V66l30-17v77m0-77 27 17v60" fill="#f9f6ff" stroke="#a58aca" strokeWidth="2" strokeDasharray="5 4"/><path d="M128 88h37m-9-9 9 9-9 9" fill="none" stroke="#9976cb" strokeWidth="3" strokeLinecap="round"/><path d="M29 185h229" stroke="#c4b0e5" strokeWidth="2"/></>}</svg>);

const topic31Articles = [
  {
    id: 'unesco-competencies',
    type:
      'UNESCO · COMPETENCIAS DIGITALES · INGLÉS',
    title:
      'Artificial Intelligence and Digital Transformation Competencies for Civil Servants',
    description:
      'Presenta un marco de competencias para apoyar la transformación digital y el uso de inteligencia artificial en el sector público.',
    url:
      'https://unesdoc.unesco.org/ark:/48223/pf0000383325',
    linkLabel: 'Consultar publicación',
  },
  {
    id: 'oecd-ai-smart-cities',
    type:
      'OCDE · INTELIGENCIA ARTIFICIAL Y CIUDADES · 2025 · INGLÉS',
    title:
      'Artificial Intelligence for Advancing Smart Cities',
    description:
      'Examina aplicaciones de inteligencia artificial en movilidad, vivienda, uso del suelo, inclusión social, medioambiente, eficiencia del gobierno local y seguridad urbana. También analiza los datos, los recursos y las condiciones que permiten desarrollar estas iniciativas.',
    url:
      'https://www.oecd.org/content/dam/oecd/en/about/programmes/cfe/the-oecd-programme-on-smart-cities-and-inclusive-growth/Issues-Note-AI-for-advancing-smart-cities.pdf',
    linkLabel: 'Abrir documento PDF',
  },
  {
    id: 'icmtt-smart-technologies',
    type:
      'LECTURA COMPLEMENTARIA · ICMTT 2023 · PUBLICADO EN 2024 · INGLÉS',
    title:
      'Management, Tourism and Smart Technologies — ICMTT 2023, Volume 1',
    description:
      'Reúne investigaciones sobre gestión, turismo y tecnologías inteligentes. Incluye capítulos sobre inteligencia artificial, educación, sistemas de información y aplicaciones tecnológicas.',
    url:
      'https://link.springer.com/book/10.1007/978-3-031-44131-8',
    linkLabel: 'Consultar publicación',
  },
];

const Topic31Intro = ({ moduleData }) => {
  const courseId = moduleData.courseId || 1;

  const [section, setSectionState] = useState('index');
  const readingGate = useRequiredReadings('3.1', moduleData?.id ?? '3');
  const setSection = (next) => setSectionState((current) => {
    const destination = typeof next === 'function' ? next(current) : next;
    return ['forum', 'evaluation'].includes(destination) && !readingGate.complete ? 'article' : destination;
  });
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [video, setVideo] = useState(null);
  const [videoCompleted, setVideoCompleted] =
    useState(false);

  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [checkingProgress, setCheckingProgress] =
    useState(false);

      const [forumCompleted, setForumCompleted] =
    useState(false);

  const [evaluationPassed, setEvaluationPassed] =
    useState(false);
  useEffect(() => {
    let active = true;

    setLoading(true);
    setHasAccess(false);
    setVideo(null);
    setVideoCompleted(false);
    setError('');
    setSection('index');

    const loadTopic = async () => {
      try {
        const courseProgress = await api.get(
          `/courses/${courseId}/progress`
        );

        if (!active) return;

        const previousModule =
          courseProgress?.modules?.find(
            (item) =>
              Number(item.order_number) === 2
          );

        if (previousModule?.passed !== true) {
          setError(
            'Aprueba los temas 2.1, 2.2 y la actividad práctica del 2.3 para comenzar el módulo 3.'
          );
          return;
        }

        setHasAccess(true);

        const videos = await api.get(
          `/videos/module/${moduleData.id}`
        );

        if (!active) return;

        const topicVideo = Array.isArray(videos)
          ? videos.find((item) =>
              String(item.url || '').includes(
                'NSfKRyRV1Hw'
              )
            )
          : null;

        if (!topicVideo) {
          throw new Error(
            'El video del tema 3.1 no está registrado en este módulo.'
          );
        }

        const progress = await api.get(
          `/videos/${topicVideo.id}/progress`
        );

        if (!active) return;

        setVideo(topicVideo);
        setVideoCompleted(
          progress?.is_completed === true
        );
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'No se pudo cargar el tema 3.1.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTopic();

    return () => {
      active = false;
    };
  }, [courseId, moduleData.id, retry]);
  useEffect(() => {
    let active = true;

    if (!hasAccess || !videoCompleted) {
      setForumCompleted(false);
      setEvaluationPassed(false);

      return () => {
        active = false;
      };
    }

    const loadActivitiesProgress = async () => {
      try {
        const post = await api.get(
          '/foro/3.1/mine'
        );

        if (active) {
          setForumCompleted(Boolean(post));
        }
      } catch (err) {
        console.error(
          'No se pudo consultar el foro 3.1:',
          err
        );
      }

      try {
        const evaluation = await api.get(
          '/evaluations/topic/3.1'
        );

        const progress = await api.get(
          `/evaluations/${evaluation.id}/progress`
        );

        if (active) {
          setEvaluationPassed(
            progress?.passed === true
          );
        }
      } catch (err) {
        console.error(
          'No se pudo consultar la evaluación 3.1:',
          err
        );
      }
    };

    loadActivitiesProgress();

    return () => {
      active = false;
    };
  }, [
    hasAccess,
    videoCompleted,
    moduleData.id,
  ]);
  const verifyVideoCompletion = async () => {
    if (!video?.id || checkingProgress) return;

    setCheckingProgress(true);
    setError('');

    try {
      const progress = await api.get(
        `/videos/${video.id}/progress`
      );

      if (progress?.is_completed === true) {
        setVideoCompleted(true);
      } else {
        setError(
          'Tu avance todavía no figura como completado. Mira el video completo y vuelve a comprobarlo.'
        );
      }
    } catch (err) {
      setError(
        err.message ||
          'No se pudo comprobar el avance del video.'
      );
    } finally {
      setCheckingProgress(false);
    }
  };

  const navigation = (
    <>
      <button
        type="button"
        className={styles.returnButton}
        onClick={() => setSection('index')}
      >
        ← Contenido del tema
      </button>

      <Link
        to={`/course/${courseId}`}
        className={styles.backLink}
      >
        Volver al curso ↗
      </Link>
    </>
  );

  if (loading) {
    return (
      <main className={styles.message}>
        Consultando el tema 3.1 y tu avance...
      </main>
    );
  }

  if (!hasAccess || !video) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.lessonCard}>
            <Link
              to={`/course/${courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <h2 className={styles.moduleHeading}><span>Tema 3.1: Inteligencia artificial
              </span>aplicada a servicios urbanos</h2>

            <p
              className={styles.pendingNote}
              role="alert"
            >
              {error || 'No se pudo cargar el tema.'}
            </p>

            {!hasAccess && (
              <Link
                to="/module/2/topic/2.3"
                className={styles.nextButton}
              >
                Volver al tema 2.3 
              </Link>
            )}

            <button
              type="button"
              className={styles.returnButton}
              onClick={() =>
                setRetry((value) => value + 1)
              }
            >
              Volver a comprobar
            </button>
          </section>
        </div>
      </main>
    );
  }

  const sections = [
    {
      id: 'about',
      label: 'Introducción',
      description:
        'Conoce el objetivo y los aprendizajes del tema.',
      enabled: true,
    },
    {
      id: 'video',
      label: 'Video',
      description: videoCompleted
        ? 'Completaste la clase del tema 3.1.'
        : 'Observa la clase y completa el video.',
      enabled: true,
    },
    {
      id: 'article',
      label: 'Información',
      description:
        'Explora las publicaciones y las lecturas de apoyo.',
      enabled: videoCompleted,
    },
      {
      id: 'forum',
      label: 'Foro',
      description: forumCompleted
        ? 'Tu respuesta está publicada.'
        : '¿Debe la IA decidir por la ciudad?',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Aprobaste la evaluación del tema 3.1.'
        : forumCompleted
          ? 'Responde las cinco preguntas del tema.'
          : 'Publica tu respuesta en el foro para continuar.',
      enabled:
        videoCompleted && forumCompleted,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {section === 'index' ? (
          <>
            <Link
              to={`/course/${courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <section className={styles.topicIndex}>
              <div className={styles.indexIntro}>
                <div
                  className={styles.indexIntroText}
                >
                  <span
                    className={styles.sectionLabel}
                  >
                    MÓDULO 3 · TEMA 3.1
                  </span>

                  <h1 className={styles.moduleHeading}>
                    Inteligencia artificial aplicada
                    a <span>servicios urbanos</span>
                  </h1>

                  <p>
                    Conoce cómo la inteligencia artificial
                    puede apoyar la gestión municipal y
                    mejorar los servicios urbanos a partir
                    de necesidades concretas y datos
                    confiables.
                  </p>
                </div>

                <div
                  className={styles.cityGraphic}
                  aria-hidden="true"
                >
                  <div
                    className={styles.cityCircle}
                  ></div>

                  <div
                    className={styles.cityBuildingOne}
                  ></div>

                  <div
                    className={styles.cityBuildingTwo}
                  ></div>

                  <div
                    className={styles.cityBuildingThree}
                  ></div>

                  <div
                    className={styles.cityGround}
                  ></div>
                </div>
              </div>

              <div className={styles.indexGrid}>
                {sections.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.indexCard}
                    disabled={!item.enabled}
                    onClick={() =>
                      setSection(item.id)
                    }
                  >
                    <span
                      className={styles.indexNumber}
                    >
                      {String(index + 1).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <span
                      className={styles.indexCardText}
                    >
                      <strong>{item.label}</strong>

                      <small>
                        {item.description}
                      </small>
                    </span>

                    <span
                      className={styles.indexStatus}
                    >
                      {item.id === 'video' &&
                      videoCompleted
                        ? '✓ Completado'
                        : item.enabled
                          ? 'Abrir →'
                          : '🔒 Pendiente'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : section === 'about' ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                <Link to={`/course/${courseId}`} className={styles.backLink}>Volver al curso ↗</Link>
              </div>

              <span
                className={styles.sectionLabel}
              >
                INTRODUCCIÓN · TEMA 3.1
              </span>

              <div className={styles.greenWelcome}><div><h2 className={styles.moduleHeading}><span>Inteligencia artificial al servicio
                </span>de la ciudad</h2>

              <p className={styles.introLead}>
                Los municipios reciben información sobre
                calles, movilidad, infraestructura y
                servicios públicos. La inteligencia
                artificial puede ayudar a analizar esa
                información, identificar patrones y
                apoyar decisiones para atender problemas
                concretos de la ciudad.
              </p></div><div className={styles.greenArt}><Module3Art topic="3.1" /></div></div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  OBJETIVO
                </span>

                <p>
                  Comprender cómo la inteligencia artificial
                  puede apoyar los servicios urbanos e
                  identificar las condiciones necesarias
                  para utilizarla de forma útil y
                  responsable.
                </p>
              </div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  ¿QUÉ APRENDERÁS?
                </span>

                <ul
                  className={styles.learningPoints}
                >
                  <li>
                    A reconocer aplicaciones de
                    inteligencia artificial en la gestión
                    de los servicios urbanos.
                  </li>

                  <li>
                    A identificar una necesidad concreta
                    antes de elegir una herramienta
                    tecnológica.
                  </li>

                  <li>
                    A comprender la importancia de los
                    datos confiables y de la infraestructura
                    necesaria para aplicar estas soluciones.
                  </li>

                  <li>
                    A relacionar el uso de inteligencia
                    artificial con la mejora de los
                    servicios y la calidad de vida.
                  </li>
                </ul>
              </div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  ASÍ AVANZARÁS EN EL TEMA
                </span>

                <ul
                  className={styles.learningPoints}
                >
                  <li>
                    <strong>Video:</strong> observa la
                    clase completa. Adelantarlo no contará
                    como progreso de esa parte.
                  </li>

                  <li>
                    <strong>Información:</strong> consulta
                    las publicaciones y lecturas de apoyo.
                    Son recursos opcionales.
                  </li>

                 <li>
  <strong>Foro:</strong> publica tu respuesta
  sobre la recomendación de inteligencia artificial.
  Podrás leer las respuestas de tus compañeros
  y comentarlas si deseas.
</li>

<li>
  <strong>Evaluación:</strong> responde cinco
  preguntas de 2 puntos cada una. Para aprobar,
  necesitas al menos cuatro respuestas correctas:
  8/10 puntos (80 %).
</li>
                </ul>
              </div>

              <div className={styles.lessonActionGroup}><button
                type="button"
                className={styles.nextButton}
                onClick={() =>
                  setSection('video')
                }
              >
                Empezar 
              </button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('index')}>← Anterior</button></div>
            </section>
          </div>
        ) : section === 'video' ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.videoTopBar}>
                {navigation}
              </div>

              <div className={styles.videoHeading}>
                <span
                  className={styles.videoHeadingIcon}
                  aria-hidden="true"
                >
                  ▶
                </span>

                <div>
                  

                  <h2 className={styles.moduleHeading}><span>Inteligencia artificial aplicada
                    </span>a servicios urbanos</h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>
                  ◷ Duración: 6 minutos y 58 segundos
                </span>

                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              <span>ⓘ No adelantes el video: las partes que saltes no contarán en tu progreso.</span></div>

              {error && (
                <p
                  className={styles.pendingNote}
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className={styles.playerFrame}>
                <VideoPlayer
                  ytVideoId="NSfKRyRV1Hw"
                  dbVideoId={video.id}
                  videoDuration={
                    video.duration || 418
                  }
                  onProgress={(_, progress) => {
                    if (
                      progress?.is_completed === true
                    ) {
                      setVideoCompleted(true);
                      setError('');
                    }
                  }}
                  onComplete={
                    verifyVideoCompletion
                  }
                />
              </div>

              {videoCompleted ? (
                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={styles.nextButton}
                  onClick={() =>
                    setSection('article')
                  }
                >
                  Siguiente 
                </button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('about')}>← Anterior</button></div>
              ) : (
                <>
                  <p
                    className={styles.pendingNote}
                  >
                    Mira el video completo. Adelantarlo
                    no registrará esa parte como vista.
                  </p>

                  <button
                    type="button"
                    className={styles.returnButton}
                    onClick={
                      verifyVideoCompletion
                    }
                    disabled={checkingProgress}
                  >
                    {checkingProgress
                      ? 'Consultando tu avance...'
                      : 'Comprobar mi avance'}
                  </button>
                </>
              )}
            {!videoCompleted && <div className={styles.lessonActionGroup}><button type="button" className={styles.previousLessonButton} onClick={() => setSection('about')}>← Anterior</button></div>}</section>
          </div>
        ) : section === 'article' &&
          videoCompleted ? (
          <RequiredReadings gate={readingGate}><div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                {navigation}
              </div>

              <header
                className={styles.articleHeader}
              >
                

                <h2 className={styles.plainHeading}>Explora y profundiza</h2>

                <p className={styles.introLead}>
                  Profundiza en las competencias necesarias
                  para utilizar inteligencia artificial en
                  el sector público, sus aplicaciones en
                  las ciudades y su relación con las
                  tecnologías inteligentes.
                </p>
              </header>

              <div className={styles.articleGrid}>
                {topic31Articles.map(
                  (article, index) => (
                    <article
                      key={article.id}
                      className={styles.articleCard}
                    >
                      <div
                        className={styles.articleIcon}
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(
                          2,
                          '0'
                        )}
                      </div>

                      <span
                        className={styles.articleType}
                      >
                        {article.type}
                      </span>

                      <h3>{article.title}</h3>

                      <p>{article.description}</p>

                      <p>
                       
                        {article.guidance}
                      </p>

                      {article.note && (
                        <p>
                          <small>
                            {article.note}
                          </small>
                        </p>
                      )}

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.articleLink}
                      >
                        {article.linkLabel} ↗
                      </a>
                    </article>
                  )
                )}
              </div>

              <aside
                className={styles.cepalBanner}
              >
                <div>
         

                  <h3>
                    Inteligencia artificial y
                    transformación digital
                  </h3>

                  <p>
                    Consulta la publicación institucional
                    sobre competencias para servidores
                    públicos y sus versiones disponibles.
                  </p>
                </div>

                <a
                  href="https://www.unesco.org/en/articles/artificial-intelligence-and-digital-transformation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Consultar publicación ↗
                </a>
              </aside>

              <aside
                className={styles.cepalBanner}
              >
                <div>
          

                  <h3>
                    Aplicaciones de IA para
                    ciudades inteligentes
                  </h3>

                  <p>
                    Explora los casos y las condiciones
                    necesarias para aplicar inteligencia
                    artificial en la gestión urbana.
                  </p>
                </div>

                <a
                  href="https://www.oecd.org/content/dam/oecd/en/about/programmes/cfe/the-oecd-programme-on-smart-cities-and-inclusive-growth/Issues-Note-AI-for-advancing-smart-cities.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Consultar informe ↗
                </a>
              </aside>

              <div
                className={styles.articleNextStep}
              >
                <div>
                </div>

             <div className={styles.lessonActionGroup}><button
  type="button"
  className={styles.nextButton}
  onClick={() => setSection('forum')}
>
  Siguiente 
</button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('video')}>← Anterior</button></div>
              </div>
            </section>
          </div></RequiredReadings>
                ) : (
          section === 'forum' ||
          section === 'evaluation'
        ) && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                {navigation}
              </div>

              <Topic31Activities
                section={section}
                moduleId={moduleData.id}
                onSectionChange={setSection}
                onStatusChange={(status) => {
                  setForumCompleted(
                    status.forumCompleted
                  );

                  setEvaluationPassed(
                    status.evaluationPassed
                  );
                }}
              />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export const Topic32Content = ({ moduleData }) => {
  const courseId = moduleData.courseId || 1;

  const [section, setSectionState] = useState('index');
  const readingGate = useRequiredReadings('3.2', moduleData?.id ?? '3');
  const setSection = (next) => setSectionState((current) => {
    const destination = typeof next === 'function' ? next(current) : next;
    return ['forum', 'evaluation'].includes(destination) && !readingGate.complete ? 'article' : destination;
  });
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [video, setVideo] = useState(null);

  const [videoCompleted, setVideoCompleted] =
    useState(false);

  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const [checkingProgress, setCheckingProgress] =
    useState(false);

  const [forumCompleted, setForumCompleted] =
    useState(false);

  const [evaluationPassed, setEvaluationPassed] =
    useState(false);


  useEffect(() => {
    let active = true;

    setLoading(true);
    setHasAccess(false);
    setVideo(null);
    setVideoCompleted(false);
    setError('');
    setSection('index');

    const loadTopic = async () => {
      try {
        // Localiza la evaluación 3.1 sin asumir su ID.
        const previousEvaluation = await api.get(
          '/evaluations/topic/3.1'
        );

        if (!active) return;

        const previousProgress = await api.get(
          `/evaluations/${previousEvaluation.id}/progress`
        );

        if (!active) return;

        if (previousProgress?.passed !== true) {
          setError(
            'Aprueba la evaluación del tema 3.1 para comenzar el tema 3.2.'
          );
          return;
        }

        setHasAccess(true);

        const videos = await api.get(
          `/videos/module/${moduleData.id}`
        );

        if (!active) return;

        const topicVideo = Array.isArray(videos)
          ? videos.find((item) =>
              String(item.url || '').includes(
                '8ZI89AMbYM4'
              )
            )
          : null;

        if (!topicVideo) {
          throw new Error(
            'El video del tema 3.2 no está registrado en este módulo.'
          );
        }

        const progress = await api.get(
          `/videos/${topicVideo.id}/progress`
        );

        if (!active) return;

        setVideo(topicVideo);
        setVideoCompleted(
          progress?.is_completed === true
        );
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'No se pudo cargar el tema 3.2.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTopic();

    return () => {
      active = false;
    };
  }, [moduleData.id, retry]);
  useEffect(() => {
    let active = true;

    if (!hasAccess || !videoCompleted) {
      setForumCompleted(false);
      setEvaluationPassed(false);

      return () => {
        active = false;
      };
    }

    const load = async () => {
      try {
        const post = await api.get(
          '/foro/3.2/mine'
        );

        if (active) {
          setForumCompleted(Boolean(post));
        }
      } catch (err) {
        console.error(
          'Error consultando foro 3.2:',
          err
        );
      }

      try {
        const evaluation = await api.get(
          '/evaluations/topic/3.2'
        );

        const progress = await api.get(
          `/evaluations/${evaluation.id}/progress`
        );

        if (active) {
          setEvaluationPassed(
            progress?.passed === true
          );
        }
      } catch (err) {
        console.error(
          'Error consultando evaluación 3.2:',
          err
        );
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [
    hasAccess,
    videoCompleted,
    moduleData.id,
  ]);
  const verifyVideoCompletion = async () => {
    if (!video?.id || checkingProgress) return;

    setCheckingProgress(true);
    setError('');

    try {
      const progress = await api.get(
        `/videos/${video.id}/progress`
      );

      if (progress?.is_completed === true) {
        setVideoCompleted(true);
      } else {
        setError(
          'Tu avance todavía no figura como completado. Mira el video completo y vuelve a comprobarlo.'
        );
      }
    } catch (err) {
      setError(
        err.message ||
          'No se pudo comprobar el avance del video.'
      );
    } finally {
      setCheckingProgress(false);
    }
  };

  const navigation = (
    <>
      <button
        type="button"
        className={styles.returnButton}
        onClick={() => setSection('index')}
      >
        ← Contenido del tema
      </button>

      <Link
        to={`/course/${courseId}`}
        className={styles.backLink}
      >
        Volver al curso ↗
      </Link>
    </>
  );

  if (loading) {
    return (
      <main className={styles.message}>
        Consultando el tema 3.2 y tu avance...
      </main>
    );
  }

  if (!hasAccess || !video) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.lessonCard}>
            <Link
              to={`/course/${courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <h2 className={styles.moduleHeading}><span>Tema 3.2: </span>Educación inteligente</h2>

            <p
              className={styles.pendingNote}
              role="alert"
            >
              {error || 'No se pudo cargar el tema.'}
            </p>

            {!hasAccess && (
              <Link
                to={`/module/${moduleData.id}/topic/3.1`}
                className={styles.nextButton}
              >
                Volver al tema 3.1 
              </Link>
            )}

            <button
              type="button"
              className={styles.returnButton}
              onClick={() =>
                setRetry((value) => value + 1)
              }
            >
              Volver a comprobar
            </button>
          </section>
        </div>
      </main>
    );
  }

  const sections = [
    {
      id: 'about',
      label: 'Introducción',
      description:
        'Conoce el objetivo y los aprendizajes del tema.',
      enabled: true,
    },
    {
      id: 'video',
      label: 'Video',
      description: videoCompleted
        ? 'Completaste la clase del tema 3.2.'
        : 'Observa la clase y completa el video.',
      enabled: true,
    },
      {
      id: 'article',
      label: 'Información',
      description:
        'Explora las publicaciones y las lecturas de apoyo.',
      enabled: videoCompleted,
    },
        {
      id: 'forum',
      label: 'Foro',
      description: forumCompleted
        ? 'Tu respuesta está publicada.'
        : '¿Qué hace útil a un curso virtual?',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Aprobaste la evaluación del tema 3.2.'
        : forumCompleted
          ? 'Responde las cinco preguntas del tema.'
          : 'Publica tu respuesta en el foro para continuar.',
      enabled:
        videoCompleted && forumCompleted,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {section === 'index' ? (
          <>
            <Link
              to={`/course/${courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <section className={styles.topicIndex}>
              <div className={styles.indexIntro}>
                <div
                  className={styles.indexIntroText}
                >
                  <span
                    className={styles.sectionLabel}
                  >
                    MÓDULO 3 · TEMA 3.2
                  </span>

                  <h1 className={styles.moduleHeading}>
                    Educación <span>inteligente</span>
                  </h1>

                  <p>
                    Conoce cómo las plataformas digitales,
                    los recursos educativos y el seguimiento
                    del aprendizaje pueden apoyar la formación
                    de las personas y el desarrollo de
                    capacidades en las ciudades.
                  </p>
                </div>

                <div
                  className={styles.cityGraphic}
                  aria-hidden="true"
                >
                  <div
                    className={styles.cityCircle}
                  ></div>

                  <div
                    className={styles.cityBuildingOne}
                  ></div>

                  <div
                    className={styles.cityBuildingTwo}
                  ></div>

                  <div
                    className={styles.cityBuildingThree}
                  ></div>

                  <div
                    className={styles.cityGround}
                  ></div>
                </div>
              </div>

              <div className={styles.indexGrid}>
                {sections.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.indexCard}
                    disabled={!item.enabled}
                    onClick={() =>
                      setSection(item.id)
                    }
                  >
                    <span
                      className={styles.indexNumber}
                    >
                      {String(index + 1).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <span
                      className={styles.indexCardText}
                    >
                      <strong>{item.label}</strong>

                      <small>
                        {item.description}
                      </small>
                    </span>

                    <span
                      className={styles.indexStatus}
                    >
                      {item.id === 'video' &&
                      videoCompleted
                        ? '✓ Completado'
                        : item.enabled
                          ? 'Abrir →'
                          : '🔒 Pendiente'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : section === 'about' ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                <Link to={`/course/${courseId}`} className={styles.backLink}>Volver al curso ↗</Link>
              </div>

              <span
                className={styles.sectionLabel}
              >
                INTRODUCCIÓN · TEMA 3.2
              </span>

              <div className={styles.greenWelcome}><div><h2 className={styles.moduleHeading}><span>Aprender en una </span>ciudad inteligente</h2>

              <p className={styles.introLead}>
                La educación inteligente utiliza plataformas
                digitales y recursos educativos para apoyar
                la enseñanza y el aprendizaje. Su aplicación
                debe considerar las necesidades de las
                personas, el acceso a la tecnología y el
                acompañamiento durante la formación.
              </p></div><div className={styles.greenArt}><Module3Art topic="3.2" /></div></div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  OBJETIVO
                </span>

                <p>
                  Comprender el concepto de educación
                  inteligente y reconocer cómo las plataformas
                  de aprendizaje pueden organizar contenidos,
                  facilitar actividades y permitir el
                  seguimiento del progreso.
                </p>
              </div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  ¿QUÉ APRENDERÁS?
                </span>

                <ul
                  className={styles.learningPoints}
                >
                  <li>
                    A reconocer las características de
                    la educación inteligente.
                  </li>

                  <li>
                    A identificar la función de un sistema
                    de gestión del aprendizaje o LMS.
                  </li>

                  <li>
                    A comprender la importancia de organizar
                    recursos, actividades y evaluaciones
                    según las necesidades de los participantes.
                  </li>

                  <li>
                    A relacionar la formación y el desarrollo
                    de habilidades con las ciudades
                    inteligentes.
                  </li>
                </ul>
              </div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  ASÍ AVANZARÁS EN EL TEMA
                </span>

                <ul
                  className={styles.learningPoints}
                >
                  <li>
                    <strong>Video:</strong> observa la
                    clase completa. Adelantarlo no contará
                    como progreso de esa parte.
                  </li>

                 <li>
  <strong>Información:</strong> consulta las
  publicaciones y lecturas de apoyo sobre
  educación inteligente y plataformas de aprendizaje.
  Son recursos opcionales.
</li>

               <li>
  <strong>Foro:</strong> publica dos mejoras
  para que un curso virtual sea más fácil
  de seguir. Comentar a un compañero es opcional.
</li>

<li>
  <strong>Evaluación:</strong> responde cinco
  preguntas de 2 puntos cada una. Con cuatro
  respuestas correctas obtienes 8/10 puntos
  (80 %) y apruebas.
</li>
                </ul>
              </div>

              <div className={styles.lessonActionGroup}><button
                type="button"
                className={styles.nextButton}
                onClick={() =>
                  setSection('video')
                }
              >
                Empezar 
              </button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('index')}>← Anterior</button></div>
            </section>
          </div>
        ) : section === 'video' ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.videoTopBar}>
                {navigation}
              </div>

              <div className={styles.videoHeading}>
                <span
                  className={styles.videoHeadingIcon}
                  aria-hidden="true"
                >
                  ▶
                </span>

                <div>
                  

                  <h2 className={styles.moduleHeading}><span>Educación </span>inteligente</h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>
                  ◷ Duración: 4 minutos y 45 segundos
                </span>

                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              <span>ⓘ No adelantes el video: las partes que saltes no contarán en tu progreso.</span></div>

              {error && (
                <p
                  className={styles.pendingNote}
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className={styles.playerFrame}>
                <VideoPlayer
                  ytVideoId="8ZI89AMbYM4"
                  dbVideoId={video.id}
                  videoDuration={
                    video.duration || 285
                  }
                  onProgress={(_, progress) => {
                    if (
                      progress?.is_completed === true
                    ) {
                      setVideoCompleted(true);
                      setError('');
                    }
                  }}
                  onComplete={
                    verifyVideoCompletion
                  }
                />
              </div>

              {videoCompleted ? (
                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={styles.nextButton}
                  onClick={() =>
                    setSection('article')
                  }
                >
                  Siguiente 
                </button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('about')}>← Anterior</button></div>
              ) : (
                <>
                  <p
                    className={styles.pendingNote}
                  >
                    Mira el video completo. Adelantarlo
                    no registrará esa parte como vista.
                  </p>

                  <button
                    type="button"
                    className={styles.returnButton}
                    onClick={
                      verifyVideoCompletion
                    }
                    disabled={checkingProgress}
                  >
                    {checkingProgress
                      ? 'Consultando tu avance...'
                      : 'Comprobar mi avance'}
                  </button>
                </>
              )}
            {!videoCompleted && <div className={styles.lessonActionGroup}><button type="button" className={styles.previousLessonButton} onClick={() => setSection('about')}>← Anterior</button></div>}</section>
          </div>
              ) : section === 'article' &&
          videoCompleted ? (
          <RequiredReadings gate={readingGate}><div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                {navigation}
              </div>

              <header
                className={styles.articleHeader}
              >
                

                <h2 className={styles.plainHeading}>Explora y profundiza</h2>

                <p className={styles.introLead}>
                  Conoce principios para diseñar plataformas
                  educativas inclusivas, estrategias para
                  facilitar el aprendizaje digital y modelos
                  para organizar actividades y recursos
                  dentro de un LMS.
                </p>
              </header>

              <div className={styles.articleGrid}>
                <article
                  className={styles.articleCard}
                >
                  <div
                    className={styles.articleIcon}
                    aria-hidden="true"
                  >
                    01
                  </div>

                  <span
                    className={styles.articleType}
                  >
                    UNESCO · UNICEF · PLATAFORMAS
                    PÚBLICAS DE APRENDIZAJE · INGLÉS
                  </span>

                  <h3>
                    Charter for Public Digital
                    Learning Platforms
                  </h3>

                  <p>
                    Propone principios para orientar el
                    desarrollo y la gestión de plataformas
                    públicas de aprendizaje digital,
                    considerando la educación como un
                    derecho y un bien público.
                  </p>

             

                  <a
                    href="https://www.unicef.org/digitaleducation/CharterforPublicDigitalLearningPlatforms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.articleLink}
                  >
                    Consultar carta y publicación ↗
                  </a>
                </article>

                <article
                  className={styles.articleCard}
                >
                  <div
                    className={styles.articleIcon}
                    aria-hidden="true"
                  >
                    02
                  </div>

                  <span
                    className={styles.articleType}
                  >
                    APRENDIZAJE FLEXIBLE · INGLÉS
                  </span>

                  <h3>
                    Handbook on Facilitating Flexible
                    Learning During Educational Disruption
                  </h3>

                  <p>
                    Manual sobre estrategias para mantener
                    el aprendizaje durante interrupciones
                    educativas, a partir de la experiencia
                    de China durante la pandemia de COVID-19.
                  </p>

            


                  <a
                    href="https://iite.unesco.org/publications/handbook-on-facilitating-flexible-learning-during-educational-disruption/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.articleLink}
                  >
                    Consultar manual ↗
                  </a>
                </article>

                <article
                  className={styles.articleCard}
                >
                  <div
                    className={styles.articleIcon}
                    aria-hidden="true"
                  >
                    03
                  </div>

                  <span
                    className={styles.articleType}
                  >
                    ARTÍCULO ACADÉMICO · LMS E IMS-LD
                    · INGLÉS
                  </span>

                  <h3>
                    Generate a Meta-Model Content for
                    Disciplinary Information Space of
                    Learning Management System Compatible
                    with IMS-LD
                  </h3>

                  <p>
                    Propone un metamodelo para organizar
                    el espacio de información de un sistema
                    de gestión del aprendizaje y relacionarlo
                    con la especificación IMS Learning
                    Design.
                  </p>
       

                  <a
                    href="https://doi.org/10.1145/3286606.3286816"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.articleLink}
                  >
                    Consultar artículo ↗
                  </a>
                </article>
              </div>

              <aside
                className={styles.cepalBanner}
              >
                <div>


                  <h3>
                    Plataformas digitales para
                    una educación inclusiva
                  </h3>

                  <p>
                    Explora la carta y sus versiones
                    disponibles en el portal de UNESCO.
                  </p>
                </div>

                <a
                  href="https://www.unesco.org/en/digital-education/learning-platforms-gateway/charter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Explorar recurso ↗
                </a>
              </aside>

              <div
                className={styles.articleNextStep}
              >
                <div>
     
                </div>

              <div className={styles.lessonActionGroup}><button
  type="button"
  className={styles.nextButton}
  onClick={() => setSection('forum')}
>
  Siguiente 
</button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('video')}>← Anterior</button></div>
              </div>
            </section>
          </div></RequiredReadings>
           ) : (
          section === 'forum' ||
          section === 'evaluation'
        ) && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                {navigation}
              </div>

              <Topic31Activities
                key="3.2"
                topicNumber="3.2"
                section={section}
                moduleId={moduleData.id}
                onSectionChange={setSection}
                onStatusChange={(status) => {
                  setForumCompleted(
                    status.forumCompleted
                  );

                  setEvaluationPassed(
                    status.evaluationPassed
                  );
                }}
              />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};
export const Topic33Content = ({ moduleData }) => {
  const courseId = moduleData.courseId || 1;

  const [section, setSectionState] = useState('index');
  const readingGate = useRequiredReadings('3.3', moduleData?.id ?? '3');
  const setSection = (next) => setSectionState((current) => {
    const destination = typeof next === 'function' ? next(current) : next;
    return ['forum', 'evaluation'].includes(destination) && !readingGate.complete ? 'article' : destination;
  });
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [video, setVideo] = useState(null);
  const [videoCompleted, setVideoCompleted] =
    useState(false);

  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [checkingProgress, setCheckingProgress] =
    useState(false);

  const articles = [
    {
      id: 'jrc-digital-age',
      type:
        'COMISIÓN EUROPEA · JRC · INGLÉS',
      title: 'Cities fit for the digital age',
      description:
        'Analiza cómo las tecnologías digitales pueden apoyar los servicios urbanos y mejorar la calidad de vida. Destaca la necesidad de partir de problemas reales, compartir datos y utilizar soluciones interoperables.',
      guidance:
        'Identifica qué necesidades debería definir un municipio antes de adoptar un gemelo digital y por qué son importantes la participación y las capacidades del personal.',
      url:
        'https://publications.jrc.ec.europa.eu/repository/handle/JRC128724',
    },
    {
      id: 'itu-y4600',
      type:
        'UIT-T · RECOMENDACIÓN Y.4600 · INGLÉS',
      title:
        'Requirements and capabilities of a digital twin system for smart cities',
      description:
        'Describe requisitos y capacidades de los sistemas de gemelos digitales para ciudades inteligentes. Explica su utilidad para analizar escenarios y ensayar estrategias antes de aplicarlas en la ciudad real.',
      guidance:
        'Relaciona la representación digital de una ciudad con los datos que la alimentan y las simulaciones que permitirían comparar distintas decisiones.',
      url:
        'https://www.itu.int/rec/T-REC-Y.4600-202208-I/en',
    },
    {
      id: 'mobility-2026',
      type:
        'ARTÍCULO CIENTÍFICO · SMART CITIES · 2026 · INGLÉS',
      title:
        'Generative AI-Driven Digital Twin Architecture for Urban Mobility Simulation and Decision Support',
      description:
        'Presenta un prototipo que combina inteligencia artificial generativa y simulación de movilidad urbana. Utiliza una interfaz conversacional para traducir solicitudes en configuraciones de simulación validadas.',
      guidance:
        'Revisa cómo se preparan los escenarios y se comprueban sus parámetros. Piensa qué información necesitarías para comparar dos alternativas de movilidad en tu municipio.',
      url:
        'https://www.mdpi.com/2624-6511/9/7/109',
    },
    {
      id: 'spatial-planning-2026',
      type:
        'ARTÍCULO CIENTÍFICO · ISPRS ANNALS · 2026 · INGLÉS',
      title:
        'AI-Empowered Urban Digital Twins: Integrating Geospatial and Legal Data for Spatial Planning and Governance',
      description:
        'Propone un marco para integrar información geoespacial y normativa en gemelos digitales urbanos apoyados por inteligencia artificial. Incluye modelado, análisis, simulación, visualización y apoyo a decisiones.',
      guidance:
        'Identifica cómo se relacionan los mapas, los modelos 3D y la información municipal. Reflexiona sobre la necesidad de supervisión humana al interpretar los resultados.',
      url:
        'https://isprs-annals.copernicus.org/articles/XII-4-W2-2026/105/2026/index.html',
    },
  ];
const [forumCompleted, setForumCompleted] =
  useState(false);

const [evaluationPassed, setEvaluationPassed] =
  useState(false);
  useEffect(() => {
    let active = true;

    setLoading(true);
    setHasAccess(false);
    setVideo(null);
    setVideoCompleted(false);
    setSection('index');
    setError('');

    const loadTopic = async () => {
      try {
        const previousEvaluation = await api.get(
          '/evaluations/topic/3.2'
        );

        if (!active) return;

        const previousProgress = await api.get(
          `/evaluations/${previousEvaluation.id}/progress`
        );

        if (!active) return;

        if (previousProgress?.passed !== true) {
          setError(
            'Aprueba la evaluación del tema 3.2 para comenzar el tema 3.3.'
          );
          return;
        }

        setHasAccess(true);

        const videos = await api.get(
          `/videos/module/${moduleData.id}`
        );

        if (!active) return;

        const topicVideo = Array.isArray(videos)
          ? videos.find((item) =>
              String(item.url || '').includes(
                'NVp5uPxsY1Y'
              )
            )
          : null;

        if (!topicVideo) {
          throw new Error(
            'El video del tema 3.3 no está registrado en este módulo.'
          );
        }

        const progress = await api.get(
          `/videos/${topicVideo.id}/progress`
        );

        if (!active) return;

        setVideo(topicVideo);
        setVideoCompleted(
          progress?.is_completed === true
        );
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'No se pudo cargar el tema 3.3.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTopic();

    return () => {
      active = false;
    };
  }, [moduleData.id, retry]);

  useEffect(() => {
    let active = true;

    if (!hasAccess || !videoCompleted) {
      setForumCompleted(false);
      setEvaluationPassed(false);
      return () => { active = false; };
    }

    const loadActivitiesProgress = async () => {
      const results = await Promise.allSettled([
        api.get('/foro/3.3/mine'),
        (async () => {
          const evaluation = await api.get('/evaluations/topic/3.3');
          return api.get(`/evaluations/${evaluation.id}/progress`);
        })(),
      ]);

      if (!active) return;
      const [forumResult, evaluationResult] = results;

      if (forumResult.status === 'fulfilled') {
        setForumCompleted(Boolean(forumResult.value));
      } else {
        console.error('Error consultando foro 3.3:', forumResult.reason);
      }

      if (evaluationResult.status === 'fulfilled') {
        setEvaluationPassed(evaluationResult.value?.passed === true);
      } else {
        console.error('Error consultando evaluación 3.3:', evaluationResult.reason);
      }
    };

    loadActivitiesProgress();
    return () => { active = false; };
  }, [hasAccess, videoCompleted, moduleData.id]);

  const verifyVideoCompletion = async () => {
    if (!video?.id || checkingProgress) return;

    setCheckingProgress(true);
    setError('');

    try {
      const progress = await api.get(
        `/videos/${video.id}/progress`
      );

      if (progress?.is_completed === true) {
        setVideoCompleted(true);
      } else {
        setError(
          'Tu avance todavía no figura como completado. Mira el video completo y vuelve a comprobarlo.'
        );
      }
    } catch (err) {
      setError(
        err.message ||
          'No se pudo comprobar el avance del video.'
      );
    } finally {
      setCheckingProgress(false);
    }
  };

  const navigation = (
    <>
      <button
        type="button"
        className={styles.returnButton}
        onClick={() => setSection('index')}
      >
        ← Contenido del tema
      </button>

      <Link
        to={`/course/${courseId}`}
        className={styles.backLink}
      >
        Volver al curso ↗
      </Link>
    </>
  );

  if (loading) {
    return (
      <main className={styles.message}>
        Consultando el tema 3.3 y tu avance...
      </main>
    );
  }

  if (!hasAccess || !video) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.lessonCard}>
            <Link
              to={`/course/${courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <h2 className={styles.moduleHeading}><span>Tema 3.3: Gemelos digitales
              </span>y simulación urbana</h2>

            <p
              role="alert"
              className={styles.pendingNote}
            >
              {error || 'No se pudo cargar el tema.'}
            </p>

            {!hasAccess && (
              <Link
                to={`/module/${moduleData.id}/topic/3.2`}
                className={styles.nextButton}
              >
                Volver al tema 3.2 
              </Link>
            )}

            <button
              type="button"
              className={styles.returnButton}
              onClick={() =>
                setRetry((value) => value + 1)
              }
            >
              Volver a comprobar
            </button>
          </section>
        </div>
      </main>
    );
  }

  const sections = [
    {
      id: 'about',
      label: 'Introducción',
      description:
        'Conoce el objetivo y los aprendizajes del tema.',
      enabled: true,
    },
    {
      id: 'video',
      label: 'Video',
      description: videoCompleted
        ? 'Completaste la clase del tema 3.3.'
        : 'Observa la clase y completa el video.',
      enabled: true,
    },
    {
      id: 'article',
      label: 'Información',
      description:
        'Explora cuatro lecturas, incluidas dos publicaciones de 2026.',
      enabled: videoCompleted,
    },
    {
      id: 'forum',
      label: 'Foro',
      description: forumCompleted
        ? 'Tu respuesta está publicada.'
        : 'Probar antes de cambiar.',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Aprobaste la evaluación del tema 3.3.'
        : forumCompleted
          ? 'Responde las cinco preguntas del tema.'
          : 'Publica tu respuesta en el foro para continuar.',
      enabled: videoCompleted && forumCompleted,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {section === 'index' ? (
          <>
            <Link
              to={`/course/${courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <section className={styles.topicIndex}>
              <div className={styles.indexIntro}>
                <div
                  className={styles.indexIntroText}
                >
                  <span
                    className={styles.sectionLabel}
                  >
                    MÓDULO 3 · TEMA 3.3
                  </span>

                  <h1 className={styles.moduleHeading}>
                    Gemelos digitales y{' '}
                    <span>simulación urbana</span>
                  </h1>

                  <p>
                    Conoce cómo representar digitalmente
                    una ciudad y comparar escenarios
                    antes de realizar cambios en el
                    territorio.
                  </p>
                </div>

                <div
                  className={styles.cityGraphic}
                  aria-hidden="true"
                >
                  <div
                    className={styles.cityCircle}
                  ></div>
                  <div
                    className={styles.cityBuildingOne}
                  ></div>
                  <div
                    className={styles.cityBuildingTwo}
                  ></div>
                  <div
                    className={styles.cityBuildingThree}
                  ></div>
                  <div
                    className={styles.cityGround}
                  ></div>
                </div>
              </div>

              <div className={styles.indexGrid}>
                {sections.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.indexCard}
                    disabled={!item.enabled}
                    onClick={() =>
                      setSection(item.id)
                    }
                  >
                    <span
                      className={styles.indexNumber}
                    >
                      {String(index + 1).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <span
                      className={styles.indexCardText}
                    >
                      <strong>{item.label}</strong>
                      <small>
                        {item.description}
                      </small>
                    </span>

                    <span
                      className={styles.indexStatus}
                    >
                      {item.id === 'video' &&
                      videoCompleted
                        ? '✓ Completado'
                        : item.enabled
                          ? 'Abrir →'
                          : '🔒 Pendiente'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : section === 'about' ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                <Link to={`/course/${courseId}`} className={styles.backLink}>Volver al curso ↗</Link>
              </div>

              <span
                className={styles.sectionLabel}
              >
                INTRODUCCIÓN · TEMA 3.3
              </span>

              <div className={styles.greenWelcome}><div><h2 className={styles.moduleHeading}><span>Probar escenarios antes </span>de actuar</h2>

              <p className={styles.introLead}>
                Los gemelos digitales urbanos son
                representaciones digitales que integran
                información sobre la ciudad. Pueden
                utilizar mapas, registros municipales
                y datos de sensores para analizar
                situaciones y apoyar la comparación
                de alternativas.
              </p></div><div className={styles.greenArt}><Module3Art topic="3.3" /></div></div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  OBJETIVO
                </span>

                <p>
                  Comprender cómo los gemelos digitales
                  y las simulaciones pueden ayudar
                  a anticipar problemas y apoyar las
                  decisiones de planificación urbana.
                </p>
              </div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  ¿QUÉ APRENDERÁS?
                </span>

                <ul
                  className={styles.learningPoints}
                >
                  <li>
                    A reconocer qué es un gemelo
                    digital urbano.
                  </li>
                  <li>
                    A identificar los datos necesarios
                    para representar un entorno urbano.
                  </li>
                  <li>
                    A comprender cómo se integran los
                    datos y se presentan mediante mapas,
                    gráficos o modelos 3D.
                  </li>
                  <li>
                    A relacionar la simulación con
                    escenarios como cambios de rutas,
                    cierres de calles o inundaciones.
                  </li>
                  <li>
                    A reconocer la importancia de revisar
                    los datos y los resultados antes
                    de tomar una decisión.
                  </li>
                </ul>
              </div>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  ASÍ AVANZARÁS EN EL TEMA
                </span>

                <ul
                  className={styles.learningPoints}
                >
                  <li>
                    <strong>Video:</strong> observa
                    la clase completa. Adelantarlo
                    no contará como progreso de esa parte.
                  </li>
                  <li>
                    <strong>Información:</strong>{' '}
                    consulta las cuatro lecturas de
                    apoyo. Su lectura es opcional.
                  </li>
                  <li>
                    <strong>Foro:</strong> publica tu respuesta
                    sobre los escenarios que compararías antes
                    de modificar una ruta de transporte.
                    Puedes leer las respuestas de tus compañeros
                    y comentarlas si deseas.
                  </li>
                  <li>
                    <strong>Evaluación:</strong> responde cinco
                    preguntas de 2 puntos cada una. El mínimo
                    para aprobar es 70 %. Con cuatro respuestas
                    correctas obtienes 8/10 puntos (80 %).
                  </li>
                </ul>
              </div>

              <div className={styles.lessonActionGroup}><button
                type="button"
                className={styles.nextButton}
                onClick={() =>
                  setSection('video')
                }
              >
                Empezar 
              </button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('index')}>← Anterior</button></div>
            </section>
          </div>
        ) : section === 'video' ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.videoTopBar}>
                {navigation}
              </div>

              <div className={styles.videoHeading}>
                <span
                  className={styles.videoHeadingIcon}
                  aria-hidden="true"
                >
                  ▶
                </span>

                <div>
                  

                  <h2 className={styles.moduleHeading}><span>Gemelos digitales y
                    </span>simulación urbana</h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>
                  ◷ Duración: 5 minutos y 4 segundos
                </span>

                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              <span>ⓘ No adelantes el video: las partes que saltes no contarán en tu progreso.</span></div>

              {error && (
                <p
                  role="alert"
                  className={styles.pendingNote}
                >
                  {error}
                </p>
              )}

              <div className={styles.playerFrame}>
                <VideoPlayer
                  ytVideoId="NVp5uPxsY1Y"
                  dbVideoId={video.id}
                  videoDuration={
                    video.duration || 304
                  }
                  onProgress={(_, progress) => {
                    if (
                      progress?.is_completed === true
                    ) {
                      setVideoCompleted(true);
                      setError('');
                    }
                  }}
                  onComplete={
                    verifyVideoCompletion
                  }
                />
              </div>

              {videoCompleted ? (
                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={styles.nextButton}
                  onClick={() =>
                    setSection('article')
                  }
                >
                  Siguiente 
                </button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('about')}>← Anterior</button></div>
              ) : (
                <>
                  <p
                    className={styles.pendingNote}
                  >
                    Mira el video completo. Adelantarlo
                    no registrará esa parte como vista.
                  </p>

                  <button
                    type="button"
                    className={styles.returnButton}
                    onClick={
                      verifyVideoCompletion
                    }
                    disabled={checkingProgress}
                  >
                    {checkingProgress
                      ? 'Consultando tu avance...'
                      : 'Comprobar mi avance'}
                  </button>
                </>
              )}
            {!videoCompleted && <div className={styles.lessonActionGroup}><button type="button" className={styles.previousLessonButton} onClick={() => setSection('about')}>← Anterior</button></div>}</section>
          </div>
        ) : section === 'article' &&
          videoCompleted ? (
          <RequiredReadings gate={readingGate}><div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                {navigation}
              </div>

              <header
                className={styles.articleHeader}
              >
                

                <h2 className={styles.plainHeading}>Explora y profundiza</h2>

                <p className={styles.introLead}>
                  Explora los fundamentos de los
                  gemelos digitales y aplicaciones
                  recientes para analizar escenarios
                  y apoyar la planificación urbana.
                </p>
              </header>

              <div className={styles.articleGrid}>
                {articles.map((item, index) => (
                  <article
                    key={item.id}
                    className={styles.articleCard}
                  >
                    <div
                      className={styles.articleIcon}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(
                        2,
                        '0'
                      )}
                    </div>

                    <span
                      className={styles.articleType}
                    >
                      {item.type}
                    </span>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>


                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.articleLink}
                    >
                      Consultar publicación ↗
                    </a>
                  </article>
                ))}
              </div>

              <aside
                className={styles.cepalBanner}
              >
                <div>

                  <h3>
                    Gemelos digitales para
                    ciudades inteligentes
                  </h3>

                  <p>
                    Consulta la recomendación Y.4600
                    y su documento disponible
                    en el portal de la UIT.
                  </p>
                </div>

                <a
                  href="https://www.itu.int/rec/T-REC-Y.4600-202208-I/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Consultar recomendación ↗
                </a>
              </aside>

              <div
                className={styles.articleNextStep}
              >
                <div>
     
                </div>

                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={styles.nextButton}
                  onClick={() =>
                    setSection('forum')
                  }
                >
                  Siguiente 
                </button><button type="button" className={styles.previousLessonButton} onClick={() => setSection('video')}>← Anterior</button></div>
              </div>
            </section>
          </div></RequiredReadings>
        ) : (
          section === 'forum' ||
          section === 'evaluation'
        ) && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <Topic31Activities
                key="3.3"
                topicNumber="3.3"
                section={section}
                moduleId={moduleData.id}
                onSectionChange={setSection}
                onStatusChange={(status) => {
                  setForumCompleted(status.forumCompleted);
                  setEvaluationPassed(status.evaluationPassed);
                }}
              />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};
export default Topic31Intro;