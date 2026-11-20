import PracticalEvaluationForm from '../components/PracticalEvaluationForm';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import EvaluationForm from '../components/EvaluationForm';
import styles from './TopicDetail.module.css';

const EVALUATION_ID = 5;

const topic21Articles = [
  {
    id: 'nature-based-solutions',
    type: 'ONU-HÁBITAT · PLANIFICACIÓN URBANA',
    title:
      'Integrating Nature-based Solutions into Urban & Territorial Planning',
    description:
      'Guía sobre la integración de soluciones basadas en la naturaleza en la planificación urbana y territorial para construir ciudades biodiversas y resilientes.',
    url: 'https://unhabitat.org/knowledge/publications/integrating-nature-based-solutions-into-urban-territorial-planning-building-biodiverse-resilient',
    linkLabel: 'Consultar publicación',
  },
  {
    id: 'resilient-infrastructure',
    type: 'ONU-HÁBITAT · WORLD CITIES REPORT 2024',
    title:
      'Resilient Infrastructure as an Accelerator of Transformative Climate Action in Cities',
    description:
      'Capítulo 6 del World Cities Report 2024 sobre infraestructura resiliente, participación comunitaria e infraestructura verde y azul para apoyar la acción climática urbana.',
    url: 'https://unhabitat.org/knowledge/publications/world-cities-report-2024-cities-and-climate-action',
    linkLabel: 'Consultar informe y capítulo 6',
  },
  {
    id: 'financing-resilient-urban-future',
    type: 'BANCO MUNDIAL · FINANCIAMIENTO URBANO',
    title: 'Financing a Resilient Urban Future',
    description:
      'Documento sobre instrumentos de financiamiento para infraestructura urbana resiliente al clima, con experiencias en los sistemas de agua, transporte y energía.',
    url: 'https://documents1.worldbank.org/curated/en/370831544454490426/pdf/132822-WP-PUBLIC-8-12-2018-3-26-37-FRUFFinalDec.pdf',
    linkLabel: 'Leer documento',
  },
  {
    id: 'smart-policy-control',
    type: 'LECTURA TECNOLÓGICA · SEGURIDAD E IA',
    title:
      'Smart Policy Control for Securing Federated Learning Management System',
    description:
      'Artículo sobre contratos inteligentes y blockchain para verificar el entrenamiento, la integridad y el acceso a modelos de aprendizaje federado. Lectura complementaria sobre seguridad tecnológica.',
    url: 'https://arxiv.org/abs/2305.09134',
    linkLabel: 'Consultar artículo',
  },
  {
    id: 'cities-in-motion-2025',
    type: 'INFORME IESE · 2025',
    title: 'IESE Cities in Motion Index 2025',
    description:
      'Informe para explorar y comparar indicadores de las ciudades en dimensiones como medioambiente, movilidad, planificación urbana, gobernanza y tecnología.',
    url: 'https://www.iese.edu/media/research/pdfs/ST-0665-E',
    linkLabel: 'Consultar informe 2025',
  },
];

const forumGuide21 = [
  {
    number: '01',
    title: 'Propón elementos',
    description:
      'Indica qué elementos de infraestructura verde incluirías y qué problema atendería cada uno.',
  },
  {
    number: '02',
    title: 'Incluye a los vecinos',
    description:
      'Explica cómo participarían en la planificación del espacio verde.',
  },
  {
    number: '03',
    title: 'Comprueba los resultados',
    description:
      'Describe qué observarías después para saber si disminuyó el calor o la acumulación de agua.',
  },
  {
    number: '04',
    title: 'Conoce otras propuestas',
    description:
      'Lee las respuestas de tus compañeros. Si deseas, comenta con una sugerencia para cuidar la biodiversidad del lugar.',
  },
];

const Topic21Content = ({ moduleData }) => {
  const [section, setSection] = useState('index');

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [video, setVideo] = useState(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [checkingProgress, setCheckingProgress] = useState(false);

  const [myPost, setMyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loadingForum, setLoadingForum] = useState(false);
  const [forumLoaded, setForumLoaded] = useState(false);
  const [forumError, setForumError] = useState('');
  const [forumRetry, setForumRetry] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentError, setCommentError] = useState('');

  const [evaluationPassed, setEvaluationPassed] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState(null);
  const [loadingEvaluation, setLoadingEvaluation] = useState(true);
  const [evaluationError, setEvaluationError] = useState('');
  const [evaluationRetry, setEvaluationRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setHasAccess(false);
    setVideo(null);
    setVideoCompleted(false);
    setSection('index');
    setError('');
    setMyPost(null);
    setPosts([]);
    setAnswer('');
    setForumLoaded(false);
    setForumError('');
    setCommentDrafts({});
    setCommentError('');

    const loadTopic = async () => {
      try {
        const courseProgress = await api.get(
          `/courses/${moduleData.courseId}/progress`
        );

        if (!active) return;

        const previousModule = courseProgress.modules?.find(
          (item) => Number(item.order_number) === 1
        );

        if (previousModule?.passed !== true) {
          setError(
            'Aprueba las cuatro evaluaciones del módulo 1 para comenzar el tema 2.1.'
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
              String(item.url || '').includes('Fiy6pRrVWnA')
            )
          : null;

        if (!topicVideo) {
          throw new Error(
            'El video del tema 2.1 no está registrado en este módulo.'
          );
        }

        const videoProgress = await api.get(
          `/videos/${topicVideo.id}/progress`
        );

        if (!active) return;

        setVideo(topicVideo);
        setVideoCompleted(
          videoProgress?.is_completed === true
        );
      } catch (err) {
        if (active) {
          setError(
            err.message || 'No se pudo cargar el tema 2.1.'
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
  }, [moduleData.id, moduleData.courseId, retry]);

  useEffect(() => {
    if (!hasAccess || !videoCompleted) return undefined;

    let active = true;

    setLoadingForum(true);
    setForumLoaded(false);
    setForumError('');

    const loadForum = async () => {
      try {
        const savedPost = await api.get('/foro/2.1/mine');

        if (!active) return;

        setMyPost(savedPost);
        setForumLoaded(true);

        try {
          const forumPosts = await api.get('/foro/2.1/posts');

          if (!active) return;

          setPosts(
            Array.isArray(forumPosts) ? forumPosts : []
          );
        } catch (err) {
          if (active) {
            setForumError(
              'No se pudieron cargar las respuestas de tus compañeros. Puedes presionar Actualizar foro.'
            );
          }
        }
      } catch (err) {
        if (active) {
          setForumError(
            err.message || 'No se pudo cargar tu participación.'
          );
        }
      } finally {
        if (active) {
          setLoadingForum(false);
        }
      }
    };

    loadForum();

    return () => {
      active = false;
    };
  }, [
    hasAccess,
    videoCompleted,
    moduleData.id,
    forumRetry,
  ]);

  useEffect(() => {
    let active = true;

    setEvaluationPassed(false);
    setEvaluationScore(null);
    setEvaluationError('');
    setLoadingEvaluation(true);

    if (!hasAccess) {
      return () => {
        active = false;
      };
    }

    const loadEvaluation = async () => {
      try {
        const progress = await api.get(
          `/evaluations/${EVALUATION_ID}/progress`
        );

        if (!active) return;

        setEvaluationPassed(progress?.passed === true);
        setEvaluationScore(progress?.percentage ?? null);
      } catch (err) {
        if (active) {
          setEvaluationError(
            err.message ||
              'No se pudo consultar el resultado de la evaluación.'
          );
        }
      } finally {
        if (active) {
          setLoadingEvaluation(false);
        }
      }
    };

    loadEvaluation();

    return () => {
      active = false;
    };
  }, [hasAccess, moduleData.id, evaluationRetry]);

  const verifyVideoCompletion = async () => {
    if (!video?.id || checkingProgress) return;

    setCheckingProgress(true);

    try {
      const progress = await api.get(
        `/videos/${video.id}/progress`
      );

      if (progress?.is_completed === true) {
        setVideoCompleted(true);
        setError('');
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

  const handlePublish21 = async (event) => {
    event.preventDefault();
    setForumError('');

    const content = answer.trim();

    if (content.length < 30 || content.length > 3000) {
      setForumError(
        'Escribe una respuesta de entre 30 y 3000 caracteres.'
      );
      return;
    }

    setPublishing(true);

    try {
      const published = await api.post(
        '/foro/2.1/posts',
        { content }
      );

      setMyPost(published);
      setForumLoaded(true);
      setAnswer('');

      try {
        const forumPosts = await api.get('/foro/2.1/posts');

        setPosts(
          Array.isArray(forumPosts) ? forumPosts : []
        );
      } catch (err) {
        setForumError(
          'Tu respuesta se publicó y ya puedes realizar la evaluación. No se pudo actualizar la lista de compañeros; presiona Actualizar foro para intentarlo nuevamente.'
        );
      }
    } catch (err) {
      setForumError(
        err.message || 'No se pudo publicar tu respuesta.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleComment21 = async (event, postId) => {
    event.preventDefault();
    setCommentError('');

    const content = (commentDrafts[postId] || '').trim();

    if (content.length < 10 || content.length > 1000) {
      setCommentError(
        'Escribe una sugerencia de entre 10 y 1000 caracteres.'
      );
      return;
    }

    setCommentingPostId(postId);

    try {
      const publishedComment = await api.post(
        `/foro/2.1/posts/${postId}/comments`,
        { content }
      );

      setPosts((previous) =>
        previous.map((post) =>
          Number(post.id) === Number(postId)
            ? {
                ...post,
                ForoComments: [
                  ...(post.ForoComments || []),
                  publishedComment,
                ],
              }
            : post
        )
      );

      setCommentDrafts((previous) => ({
        ...previous,
        [postId]: '',
      }));

      try {
        const forumPosts = await api.get('/foro/2.1/posts');

        setPosts(
          Array.isArray(forumPosts) ? forumPosts : []
        );
      } catch (err) {
        setCommentError(
          'Tu comentario se publicó, pero no se pudo actualizar la lista. Presiona Actualizar foro.'
        );
      }
    } catch (err) {
      setCommentError(
        err.message || 'No se pudo publicar tu comentario.'
      );
    } finally {
      setCommentingPostId(null);
    }
  };

  const handleEvaluationSuccess21 = (result) => {
    if (result?.passed !== true) return;

    setEvaluationPassed(true);
    setEvaluationScore(result.percentage);
    setEvaluationError('');
  };

  const otherPosts = posts.filter(
    (post) =>
      myPost &&
      Number(post.userId) !== Number(myPost.userId)
  );

  // Publicar la respuesta propia completa el foro.
  // Los comentarios a compañeros son opcionales.
  const forumCompleted = Boolean(myPost);

  const canOpenEvaluation =
    videoCompleted && forumCompleted;

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
        to={`/course/${moduleData.courseId}`}
        className={styles.backLink}
      >
        Volver al curso ↗
      </Link>
    </>
  );

  if (loading) {
    return (
      <main className={styles.message}>
        Consultando el tema 2.1 y tu avance...
      </main>
    );
  }

  if (!hasAccess || !video) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.lessonCard}>
            <Link
              to={`/course/${moduleData.courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <h2>Tema 2.1: Infraestructura verde</h2>

            <p className={styles.pendingNote} role="alert">
              {error || 'No se pudo cargar el tema.'}
            </p>

            <button
              type="button"
              className={styles.nextButton}
              onClick={() => setRetry((value) => value + 1)}
            >
              Volver a comprobar →
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
        ? 'Completaste la clase del tema 2.1.'
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
        : 'Propón un espacio verde con una función.',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Aprobaste la evaluación del tema 2.1.'
        : canOpenEvaluation
          ? 'Responde cinco preguntas sobre lo aprendido.'
          : 'Publica tu respuesta en el foro para continuar.',
      enabled: canOpenEvaluation,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {section === 'index' ? (
          <>
            <Link
              to={`/course/${moduleData.courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <section className={styles.topicIndex}>
              <div className={styles.indexIntro}>
                <div className={styles.indexIntroText}>
                  <span className={styles.sectionLabel}>
                    MÓDULO 2 · TEMA 2.1
                  </span>

                  <h1>
                    Infraestructura <span>verde</span>
                  </h1>

                  <p>
                    Conoce cómo integrar la naturaleza en la
                    planificación urbana para mejorar el ambiente
                    y la calidad de vida de las personas.
                  </p>
                </div>

                <div
                  className={styles.cityGraphic}
                  aria-hidden="true"
                >
                  <div className={styles.cityCircle}></div>
                  <div className={styles.cityBuildingOne}></div>
                  <div className={styles.cityBuildingTwo}></div>
                  <div className={styles.cityBuildingThree}></div>
                  <div className={styles.cityGround}></div>
                </div>
              </div>

              <div className={styles.indexGrid}>
                {sections.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.enabled}
                    className={styles.indexCard}
                    onClick={() => setSection(item.id)}
                  >
                    <span className={styles.indexNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className={styles.indexCardText}>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>

                    <span className={styles.indexStatus}>
                      {item.id === 'video' && videoCompleted
                        ? '✓ Completado'
                        : item.id === 'forum' && forumCompleted
                          ? '✓ Publicada'
                          : item.id === 'evaluation' &&
                              evaluationPassed
                            ? '✓ Aprobada'
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
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <h2>Introducción</h2>

              <p className={styles.introLead}>
                Los parques, los árboles y otros espacios naturales
                pueden formar parte de una red planificada que
                aporta beneficios ambientales y sociales a la
                ciudad. La infraestructura verde integra estos
                elementos en la gestión del territorio y en la
                atención de las necesidades de la población.
              </p>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  OBJETIVO
                </span>

                <p>
                  Comprender qué es la infraestructura verde y
                  reconocer cómo su planificación, implementación
                  y mantenimiento contribuyen a la sostenibilidad
                  y a la calidad de vida en las ciudades.
                </p>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ¿QUÉ APRENDERÁS?
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    A reconocer el concepto de infraestructura
                    verde y su relación con la ciudad.
                  </li>

                  <li>
                    A identificar sus beneficios para el ambiente
                    y la calidad de vida de las personas.
                  </li>

                  <li>
                    A comprender la importancia de analizar,
                    planificar, implementar y monitorear
                    estos espacios.
                  </li>

                  <li>
                    A relacionar la infraestructura verde con
                    las necesidades de tu municipio.
                  </li>
                </ul>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ASÍ AVANZARÁS EN EL TEMA
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    <strong>Video:</strong> observa la clase
                    completa. Adelantarlo no contará como
                    progreso de esa parte.
                  </li>

                  <li>
                    <strong>Información:</strong> consulta las
                    lecturas y el informe Cities in Motion 2025.
                    Son recursos opcionales.
                  </li>

                  <li>
                    <strong>Foro:</strong> publica tu propuesta
                    para un espacio verde. Después podrás leer
                    las respuestas de tus compañeros y, si deseas,
                    comentar con una sugerencia para cuidar
                    la biodiversidad.
                  </li>

                  <li>
                    <strong>Evaluación:</strong> responde cinco
                    preguntas. Cada respuesta correcta vale
                    2 puntos, equivalentes al 20 % de la nota.
                    Necesitas al menos 70 % para aprobar:
                    cuatro respuestas correctas, que suman
                    8 de 10 puntos y un 80 %.
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className={styles.nextButton}
                onClick={() => setSection('video')}
              >
                Ir al video →
              </button>
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
                  <span className={styles.videoEyebrow}>
                    APRENDE CON EL VIDEO
                  </span>

                  <h2>Infraestructura verde</h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>
                  ◷ Duración: 6 minutos y 32 segundos
                </span>

                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              </div>

              {error && (
                <p className={styles.pendingNote} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.playerFrame}>
                <VideoPlayer
                  ytVideoId="Fiy6pRrVWnA"
                  dbVideoId={video.id}
                  videoDuration={video.duration || 392}
                  onProgress={(_, progress) => {
                    if (progress?.is_completed === true) {
                      setVideoCompleted(true);
                      setError('');
                    }
                  }}
                  onComplete={verifyVideoCompletion}
                />
              </div>

              {videoCompleted ? (
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() => setSection('article')}
                >
                  Ir a Información →
                </button>
              ) : (
                <>
                  <p className={styles.pendingNote}>
                    Mira el video completo. Adelantarlo no
                    registrará esa parte como vista.
                  </p>

                  <button
                    type="button"
                    className={styles.returnButton}
                    onClick={verifyVideoCompletion}
                    disabled={checkingProgress}
                  >
                    {checkingProgress
                      ? 'Consultando tu avance...'
                      : 'Comprobar mi avance'}
                  </button>
                </>
              )}
            </section>
          </div>
        ) : section === 'article' && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <div className={styles.articleHeader}>
                <span className={styles.sectionLabel}>
                  LECTURAS COMPLEMENTARIAS
                </span>

                <h2>Explora y profundiza</h2>

                <p>
                  Consulta estas publicaciones sobre soluciones
                  basadas en la naturaleza, infraestructura
                  resiliente y financiamiento urbano, junto con
                  una lectura tecnológica complementaria y el
                  informe Cities in Motion 2025. Son recursos
                  opcionales que puedes revisar ahora o cuando
                  lo necesites.
                </p>
              </div>

              <div className={styles.articleGrid}>
                {topic21Articles.map((article) => (
                  <article
                    key={article.id}
                    className={styles.articleCard}
                  >
                    <span
                      className={styles.articleIcon}
                      aria-hidden="true"
                    >
                      ▤
                    </span>

                    <span className={styles.articleType}>
                      {article.type}
                    </span>

                    <h3>{article.title}</h3>
                    <p>{article.description}</p>

                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.articleLink}
                    >
                      {article.linkLabel} ↗
                    </a>
                  </article>
                ))}
              </div>

              <aside className={styles.cepalBanner}>
                <div>
                  <span className={styles.cepalEyebrow}>
                    FUENTE INSTITUCIONAL · IESE
                  </span>

                  <h3>Explora Cities in Motion 2025</h3>

                  <p>
                    Consulta el informe para conocer los
                    indicadores y comparar diferentes
                    dimensiones del desarrollo de las ciudades.
                  </p>
                </div>

                <a
                  href="https://www.iese.edu/media/research/pdfs/ST-0665-E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Ver informe 2025 ↗
                </a>
              </aside>

              <aside className={styles.cepalBanner}>
                <div>
                  <span className={styles.cepalEyebrow}>
                    FUENTE INSTITUCIONAL · ONU-HÁBITAT
                  </span>

                  <h3>
                    Conoce las publicaciones de ONU-Hábitat
                  </h3>

                  <p>
                    Explora sus recursos sobre planificación
                    urbana, sostenibilidad, resiliencia
                    y calidad de vida en las ciudades.
                  </p>
                </div>

                <a
                  href="https://unhabitat.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Visitar ONU-Hábitat ↗
                </a>
              </aside>

              <div className={styles.articleNextStep}>
                <div>
                  <strong>¿Listo para participar en el foro?</strong>

                  <p>
                    Las lecturas son opcionales. Comparte tu
                    propuesta para un espacio verde con una función.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() => setSection('forum')}
                >
                  Ir al foro →
                </button>
              </div>
            </section>
          </div>
        ) : section === 'forum' && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.forumTopBar}>
                {navigation}
              </div>

              <div className={styles.forumHero}>
                <div
                  className={styles.forumHeroIcon}
                  aria-hidden="true"
                >
                  ✦
                </div>

                <div>
                  <span className={styles.forumEyebrow}>
                    ACTIVIDAD PARTICIPATIVA · TEMA 2.1
                  </span>

                  <h2>Un espacio verde con una función</h2>

                  <p>
                    Propón soluciones para el calor y la
                    acumulación de agua, considerando a los
                    vecinos y la biodiversidad.
                  </p>
                </div>
              </div>

              <div className={styles.forumPrompt}>
                <p>
                  Un municipio dispone de un terreno público sin
                  utilizar y quiere convertirlo en un espacio
                  verde. En los alrededores hay zonas que se
                  calientan mucho durante el día y otras donde
                  se acumula agua cuando llueve.
                </p>

                <h3>
                  ¿Qué elementos de infraestructura verde
                  incluirías en ese terreno y qué problema
                  atendería cada uno?
                </h3>

                <p>
                  Explica cómo podrían participar los vecinos
                  en su planificación y qué observarías después
                  para saber si la intervención funcionó.
                </p>

                <p>
                  Puedes leer las propuestas de tus compañeros
                  y, si deseas, comentar con una sugerencia para
                  cuidar la biodiversidad del lugar.
                </p>
              </div>

              <div className={styles.forumGuide}>
                {forumGuide21.map((item) => (
                  <div
                    key={item.number}
                    className={styles.forumGuideCard}
                  >
                    <span className={styles.forumGuideNumber}>
                      {item.number}
                    </span>

                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={styles.returnButton}
                disabled={loadingForum || publishing}
                onClick={() =>
                  setForumRetry((value) => value + 1)
                }
              >
                {loadingForum
                  ? 'Actualizando foro...'
                  : 'Actualizar foro'}
              </button>

              {forumError && (
                <p className={styles.forumError} role="alert">
                  {forumError}
                </p>
              )}

              {loadingForum && (
                <p className={styles.pendingNote}>
                  Cargando las respuestas del foro...
                </p>
              )}

              {myPost ? (
                <>
                  <div className={styles.myForumPost}>
                    <div className={styles.forumPostHeading}>
                      <span aria-hidden="true">✓</span>

                      <strong>Tu respuesta está publicada</strong>
                    </div>

                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {myPost.content}
                    </p>
                  </div>

                  <div className={styles.articleNextStep}>
                    <div>
                      <strong>
                        ✓ Publicaste tu respuesta al foro
                      </strong>

                      <p>
                        {evaluationPassed
                          ? 'También aprobaste la evaluación. Puedes consultar tu resultado.'
                          : 'Tu respuesta quedó guardada. Ya puedes realizar la evaluación. Comentar a tus compañeros es opcional.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.nextButton}
                      disabled={!canOpenEvaluation}
                      onClick={() => setSection('evaluation')}
                    >
                      {evaluationPassed
                        ? 'Ver resultado →'
                        : 'Ir a la evaluación →'}
                    </button>
                  </div>

                  <div className={styles.otherPosts}>
                    <div className={styles.otherPostsHeading}>
                      <h3>Propuestas de tus compañeros</h3>
                    </div>

                    <p>
                      Lee sus respuestas. Si deseas, puedes
                      comentar con una sugerencia para cuidar
                      la biodiversidad del lugar.
                    </p>

                    <div className={styles.forumPostsGrid}>
                      {otherPosts.map((post) => {
                        const ownComment = (
                          post.ForoComments || []
                        ).some(
                          (comment) =>
                            Number(comment.userId) ===
                            Number(myPost.userId)
                        );

                        return (
                          <article
                            key={post.id}
                            className={styles.forumPost}
                          >
                            <div className={styles.forumPostAuthor}>
                              <span aria-hidden="true">
                                {(post.User?.name || 'P')
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>

                              <strong>
                                {post.User?.name || 'Participante'}
                              </strong>
                            </div>

                            <p style={{ whiteSpace: 'pre-wrap' }}>
                              {post.content}
                            </p>

                            {(post.ForoComments || []).map(
                              (comment) => (
                                <div
                                  key={comment.id}
                                  className={styles.myForumPost}
                                >
                                  <strong>
                                    {comment.User?.name ||
                                      (Number(comment.userId) ===
                                      Number(myPost.userId)
                                        ? 'Tú'
                                        : 'Participante')}:
                                  </strong>{' '}
                                  {comment.content}
                                </div>
                              )
                            )}

                            {ownComment ? (
                              <p>
                                ✓ Ya comentaste esta propuesta.
                              </p>
                            ) : (
                              <form
                                onSubmit={(event) =>
                                  handleComment21(event, post.id)
                                }
                                className={styles.forumForm}
                              >
                                <label
                                  htmlFor={`comment21-${post.id}`}
                                >
                                  Tu sugerencia — opcional
                                </label>

                                <textarea
                                  id={`comment21-${post.id}`}
                                  value={
                                    commentDrafts[post.id] || ''
                                  }
                                  onChange={(event) =>
                                    setCommentDrafts(
                                      (previous) => ({
                                        ...previous,
                                        [post.id]:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  placeholder="Sugiere un cambio para cuidar la biodiversidad del lugar."
                                  minLength={10}
                                  maxLength={1000}
                                  rows={3}
                                  required
                                />

                                <small>
                                  Para publicar un comentario,
                                  escribe entre 10 y 1000 caracteres.
                                </small>

                                <button
                                  type="submit"
                                  className={styles.nextButton}
                                  disabled={
                                    commentingPostId !== null
                                  }
                                >
                                  {commentingPostId === post.id
                                    ? 'Publicando...'
                                    : 'Comentar →'}
                                </button>
                              </form>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    {!loadingForum && otherPosts.length === 0 && (
                      <p className={styles.pendingNote}>
                        Todavía no hay propuestas de compañeros.
                        Tu respuesta quedó guardada y ya puedes
                        realizar la evaluación. Cuando otros
                        participantes publiquen, podrás leer
                        sus propuestas y comentarlas si deseas.
                      </p>
                    )}

                    {commentError && (
                      <p
                        className={styles.forumError}
                        role="alert"
                      >
                        {commentError}
                      </p>
                    )}
                  </div>
                </>
              ) : !loadingForum && forumLoaded ? (
                <form
                  onSubmit={handlePublish21}
                  className={styles.forumForm}
                >
                  <div className={styles.forumFormHeading}>
                    <div>
                      <span className={styles.forumEyebrow}>
                        AHORA TE TOCA PARTICIPAR
                      </span>

                      <h3>Comparte tu propuesta</h3>
                    </div>

                    <span className={styles.forumCharacterCount}>
                      {answer.trim().length}/3000
                    </span>
                  </div>

                  <label htmlFor="forumAnswer21">
                    Tu respuesta
                  </label>

                  <textarea
                    id="forumAnswer21"
                    value={answer}
                    onChange={(event) =>
                      setAnswer(event.target.value)
                    }
                    placeholder="Propón los elementos, explica qué problema atendería cada uno, cómo participarían los vecinos y cómo comprobarías los resultados."
                    minLength={30}
                    maxLength={3000}
                    rows={7}
                    required
                  />

                  <small>
                    Escribe entre 30 y 3000 caracteres.
                    Publicar tu respuesta habilita la evaluación.
                  </small>

                  <button
                    type="submit"
                    className={styles.nextButton}
                    disabled={publishing}
                  >
                    {publishing
                      ? 'Publicando...'
                      : 'Publicar respuesta →'}
                  </button>
                </form>
              ) : null}
            </section>
          </div>
        ) : section === 'evaluation' && canOpenEvaluation ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <span className={styles.sectionLabel}>
                EVALUACIÓN · TEMA 2.1
              </span>

              <h2>Comprueba lo que aprendiste</h2>

              <p>
                Responde las cinco preguntas sobre
                infraestructura verde.
              </p>

              <div className={styles.videoMeta}>
                <span>5 preguntas</span>
                <span>2 puntos por respuesta correcta · 20 %</span>
                <span>Nota máxima: 10 puntos</span>
                <span>Mínimo para aprobar: 70 %</span>
              </div>

              <p className={styles.pendingNote}>
                Con cuatro respuestas correctas obtienes
                8 de 10 puntos, equivalentes al 80 %, y apruebas.
                Si no alcanzas el mínimo, puedes revisar tus
                respuestas y volver a intentarlo.
              </p>

              {loadingEvaluation ? (
                <p className={styles.pendingNote}>
                  Consultando tu resultado...
                </p>
              ) : evaluationError ? (
                <div>
                  <p className={styles.forumError} role="alert">
                    {evaluationError}
                  </p>

                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={() => {
                      setLoadingEvaluation(true);
                      setEvaluationError('');
                      setEvaluationRetry((value) => value + 1);
                    }}
                  >
                    Volver a intentar →
                  </button>
                </div>
              ) : evaluationPassed ? (
                <div
                  className={styles.articleNextStep}
                  role="status"
                >
                  <div>
                    <strong>✓ Aprobaste el tema 2.1</strong>

                    <p>
                      Calificación:{' '}
                      {evaluationScore !== null
                        ? `${Number(evaluationScore).toFixed(0)}%`
                        : 'Aprobada'}
                      . Tu resultado quedó guardado.
                    </p>
                  </div>

                                   <Link
                    to={`/module/${moduleData.id}/topic/2.2`}
                    className={styles.nextButton}
                  >
                    Tema 2.2 →
                  </Link>
                </div>
              ) : (
                <EvaluationForm
                  evaluationId={EVALUATION_ID}
                  onSuccess={handleEvaluationSuccess21}
                />
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};
const Topic22Content = ({ moduleData }) => {
  const evaluationId22 = 6;

  const [section, setSection] = useState('index');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [video, setVideo] = useState(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [checkingProgress, setCheckingProgress] = useState(false);

  const [myPost, setMyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loadingForum, setLoadingForum] = useState(false);
  const [forumLoaded, setForumLoaded] = useState(false);
  const [forumError, setForumError] = useState('');
  const [forumRetry, setForumRetry] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentError, setCommentError] = useState('');

  const [evaluationPassed, setEvaluationPassed] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState(null);
  const [loadingEvaluation, setLoadingEvaluation] = useState(true);
  const [evaluationError, setEvaluationError] = useState('');
  const [evaluationRetry, setEvaluationRetry] = useState(0);

  const topic22Articles = [
    {
      id: 'sustainable-transportation',
      type: 'IESE · TRANSPORTE SOSTENIBLE',
      title:
        'Setting the Wheels in Motion for Sustainable Transportation',
      description:
        'Artículo sobre movilidad urbana sostenible y cuatro vías de transformación: tecnología, políticas públicas, comportamiento de los usuarios y diseño de infraestructura.',
      url: 'https://www.iese.edu/insight/articles/setting-wheels-motion-sustainable-transportation/',
      linkLabel: 'Consultar artículo',
    },
    {
      id: 'urban-mobility-benchmarking',
      type: 'CEPAL · MOVILIDAD URBANA',
      title:
        'Uso del análisis comparativo para mejorar la movilidad urbana: una nueva herramienta para construir ciudades inteligentes en países emergentes',
      description:
        'Estudio sobre cómo comparar ciudades con características similares para diagnosticar la movilidad y orientar mejoras en el transporte público, el uso de la bicicleta y la información en tiempo real.',
      url: 'https://www.cepal.org/es/publicaciones/81231-uso-analisis-comparativo-mejorar-la-movilidad-urbana-nueva-herramienta-construir',
      linkLabel: 'Consultar publicación',
    },
    {
      id: 'smart-education-sustainability',
      type: 'LECTURA COMPLEMENTARIA · EDUCACIÓN E IA',
      title:
        'Smart Education and Sustainable Learning Environments in Smart Cities: Significant Role of AI Applications for Sustainable Education',
      description:
        'Capítulo sobre aplicaciones de inteligencia artificial en educación, personalización del aprendizaje y gestión de recursos para apoyar entornos educativos sostenibles.',
      url: 'https://doi.org/10.4018/979-8-3693-7723-9.ch024',
      linkLabel: 'Consultar capítulo',
    },
    {
      id: 'scele-student-perception',
      type: 'LECTURA COMPLEMENTARIA · PLATAFORMAS EDUCATIVAS',
      title:
        'Student Perception of Student Centered e-Learning Environment (SCeLE) as Media to Support Teaching and Learning Activities at the University of Indonesia',
      description:
        'Investigación sobre la percepción y aceptación de una plataforma de aprendizaje, considerando su utilidad, facilidad de uso y condiciones de apoyo a las actividades educativas.',
      url: 'https://doi.org/10.1088/1755-1315/248/1/012001',
      linkLabel: 'Consultar artículo',
    },
  ];

  const forumGuide22 = [
    {
      number: '01',
      title: 'Elige una medida',
      description:
        'Selecciona el cambio que tendría mayor impacto en la movilidad de tu ciudad.',
    },
    {
      number: '02',
      title: 'Explica tu prioridad',
      description:
        'Describe por qué elegirías esa medida y cómo ayudaría a las personas a desplazarse.',
    },
    {
      number: '03',
      title: 'Define un indicador',
      description:
        'Indica cómo comprobarías sus resultados: tiempo de viaje, frecuencia del servicio o satisfacción de los usuarios.',
    },
    {
      number: '04',
      title: 'Conoce otras propuestas',
      description:
        'Lee las respuestas de tus compañeros. Si deseas, comenta qué otra medida podría complementar su propuesta.',
    },
  ];

  useEffect(() => {
    let active = true;

    setLoading(true);
    setHasAccess(false);
    setVideo(null);
    setVideoCompleted(false);
    setSection('index');
    setError('');
    setMyPost(null);
    setPosts([]);
    setAnswer('');
    setForumLoaded(false);
    setForumError('');
    setCommentDrafts({});
    setCommentError('');

    const loadTopic = async () => {
      try {
        const previousProgress = await api.get(
          '/evaluations/5/progress'
        );

        if (!active) return;

        if (previousProgress?.passed !== true) {
          setError(
            'Aprueba la evaluación del tema 2.1 para comenzar el tema 2.2.'
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
              String(item.url || '').includes('BNz5AHsH1nA')
            )
          : null;

        if (!topicVideo) {
          throw new Error(
            'El video del tema 2.2 no está registrado en este módulo.'
          );
        }

        const progress = await api.get(
          `/videos/${topicVideo.id}/progress`
        );

        if (!active) return;

        setVideo(topicVideo);
        setVideoCompleted(progress?.is_completed === true);
      } catch (err) {
        if (active) {
          setError(
            err.message || 'No se pudo cargar el tema 2.2.'
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
    if (!hasAccess || !videoCompleted) return undefined;

    let active = true;

    setLoadingForum(true);
    setForumLoaded(false);
    setForumError('');

    const loadForum = async () => {
      try {
        const savedPost = await api.get('/foro/2.2/mine');

        if (!active) return;

        setMyPost(savedPost);
        setForumLoaded(true);

        try {
          const forumPosts = await api.get('/foro/2.2/posts');

          if (!active) return;

          setPosts(
            Array.isArray(forumPosts) ? forumPosts : []
          );
        } catch (err) {
          if (active) {
            setForumError(
              'No se pudieron cargar las respuestas de tus compañeros. Presiona Actualizar foro para volver a intentarlo.'
            );
          }
        }
      } catch (err) {
        if (active) {
          setForumError(
            err.message ||
              'No se pudo consultar tu participación en el foro.'
          );
        }
      } finally {
        if (active) {
          setLoadingForum(false);
        }
      }
    };

    loadForum();

    return () => {
      active = false;
    };
  }, [
    hasAccess,
    videoCompleted,
    moduleData.id,
    forumRetry,
  ]);

  useEffect(() => {
    let active = true;

    setEvaluationPassed(false);
    setEvaluationScore(null);
    setEvaluationError('');
    setLoadingEvaluation(true);

    if (!hasAccess) {
      return () => {
        active = false;
      };
    }

    const loadEvaluation = async () => {
      try {
        const progress = await api.get(
          `/evaluations/${evaluationId22}/progress`
        );

        if (!active) return;

        setEvaluationPassed(progress?.passed === true);
        setEvaluationScore(progress?.percentage ?? null);
      } catch (err) {
        if (active) {
          setEvaluationError(
            err.message ||
              'No se pudo consultar el resultado de la evaluación.'
          );
        }
      } finally {
        if (active) {
          setLoadingEvaluation(false);
        }
      }
    };

    loadEvaluation();

    return () => {
      active = false;
    };
  }, [
    hasAccess,
    moduleData.id,
    evaluationId22,
    evaluationRetry,
  ]);

  const verifyVideoCompletion = async () => {
    if (!video?.id || checkingProgress) return;

    setCheckingProgress(true);

    try {
      const progress = await api.get(
        `/videos/${video.id}/progress`
      );

      if (progress?.is_completed === true) {
        setVideoCompleted(true);
        setError('');
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

  const handlePublish22 = async (event) => {
    event.preventDefault();
    setForumError('');

    const content = answer.trim();

    if (content.length < 30 || content.length > 3000) {
      setForumError(
        'Escribe una respuesta de entre 30 y 3000 caracteres.'
      );
      return;
    }

    setPublishing(true);

    try {
      const published = await api.post(
        '/foro/2.2/posts',
        { content }
      );

      setMyPost(published);
      setForumLoaded(true);
      setAnswer('');

      try {
        const forumPosts = await api.get('/foro/2.2/posts');

        setPosts(
          Array.isArray(forumPosts) ? forumPosts : []
        );
      } catch (err) {
        setForumError(
          'Tu respuesta se publicó y ya puedes realizar la evaluación. No se pudo actualizar la lista de compañeros; presiona Actualizar foro.'
        );
      }
    } catch (err) {
      setForumError(
        err.message || 'No se pudo publicar tu respuesta.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleComment22 = async (event, postId) => {
    event.preventDefault();
    setCommentError('');

    const content = (commentDrafts[postId] || '').trim();

    if (content.length < 10 || content.length > 1000) {
      setCommentError(
        'Escribe una sugerencia de entre 10 y 1000 caracteres.'
      );
      return;
    }

    setCommentingPostId(postId);

    try {
      const publishedComment = await api.post(
        `/foro/2.2/posts/${postId}/comments`,
        { content }
      );

      setPosts((previous) =>
        previous.map((post) =>
          Number(post.id) === Number(postId)
            ? {
                ...post,
                ForoComments: [
                  ...(post.ForoComments || []),
                  publishedComment,
                ],
              }
            : post
        )
      );

      setCommentDrafts((previous) => ({
        ...previous,
        [postId]: '',
      }));

      try {
        const forumPosts = await api.get('/foro/2.2/posts');

        setPosts(
          Array.isArray(forumPosts) ? forumPosts : []
        );
      } catch (err) {
        setCommentError(
          'Tu comentario se publicó, pero no se pudo actualizar la lista. Presiona Actualizar foro.'
        );
      }
    } catch (err) {
      setCommentError(
        err.message || 'No se pudo publicar tu comentario.'
      );
    } finally {
      setCommentingPostId(null);
    }
  };

  const handleEvaluationSuccess22 = (result) => {
    if (result?.passed !== true) return;

    setEvaluationPassed(true);
    setEvaluationScore(result.percentage);
    setEvaluationError('');
  };

  const otherPosts = posts.filter(
    (post) =>
      myPost &&
      Number(post.userId) !== Number(myPost.userId)
  );

  const forumCompleted = Boolean(myPost);

  const canOpenEvaluation =
    videoCompleted && forumCompleted;

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
        to={`/course/${moduleData.courseId}`}
        className={styles.backLink}
      >
        Volver al curso ↗
      </Link>
    </>
  );

  if (loading) {
    return (
      <main className={styles.message}>
        Consultando el tema 2.2 y tu avance...
      </main>
    );
  }

  if (!hasAccess || !video) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.lessonCard}>
            <Link
              to={`/course/${moduleData.courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <h2>Tema 2.2: Transporte sostenible</h2>

            <p className={styles.pendingNote} role="alert">
              {error || 'No se pudo cargar el tema.'}
            </p>

            {!hasAccess && (
              <Link
                to={`/module/${moduleData.id}/topic/2.1`}
                className={styles.nextButton}
              >
                Volver al tema 2.1 →
              </Link>
            )}

            <button
              type="button"
              className={styles.returnButton}
              onClick={() => setRetry((value) => value + 1)}
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
        ? 'Completaste la clase del tema 2.2.'
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
        : '¿Qué haría que dejaras el automóvil en casa?',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Aprobaste la evaluación del tema 2.2.'
        : canOpenEvaluation
          ? 'Responde cinco preguntas sobre lo aprendido.'
          : 'Publica tu respuesta en el foro para continuar.',
      enabled: canOpenEvaluation,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {section === 'index' ? (
          <>
            <Link
              to={`/course/${moduleData.courseId}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <section className={styles.topicIndex}>
              <div className={styles.indexIntro}>
                <div className={styles.indexIntroText}>
                  <span className={styles.sectionLabel}>
                    MÓDULO 2 · TEMA 2.2
                  </span>

                  <h1>
                    Transporte <span>sostenible</span>
                  </h1>

                  <p>
                    Conoce cómo la planificación, la tecnología
                    y las alternativas de movilidad pueden
                    mejorar los desplazamientos y la calidad
                    de vida en las ciudades.
                  </p>
                </div>

                <div
                  className={styles.cityGraphic}
                  aria-hidden="true"
                >
                  <div className={styles.cityCircle}></div>
                  <div className={styles.cityBuildingOne}></div>
                  <div className={styles.cityBuildingTwo}></div>
                  <div className={styles.cityBuildingThree}></div>
                  <div className={styles.cityGround}></div>
                </div>
              </div>

              <div className={styles.indexGrid}>
                {sections.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.enabled}
                    className={styles.indexCard}
                    onClick={() => setSection(item.id)}
                  >
                    <span className={styles.indexNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className={styles.indexCardText}>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>

                    <span className={styles.indexStatus}>
                      {item.id === 'video' && videoCompleted
                        ? '✓ Completado'
                        : item.id === 'forum' && forumCompleted
                          ? '✓ Publicada'
                          : item.id === 'evaluation' &&
                              evaluationPassed
                            ? '✓ Aprobada'
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
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <h2>Introducción</h2>

              <p className={styles.introLead}>
                La movilidad influye en el acceso al trabajo,
                la educación y los servicios. El transporte
                sostenible busca mejorar los desplazamientos
                considerando las necesidades de las personas,
                la eficiencia de los servicios y el cuidado
                del ambiente.
              </p>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  OBJETIVO
                </span>

                <p>
                  Comprender el transporte sostenible y
                  reconocer cómo la planificación, las políticas
                  públicas, la infraestructura y la tecnología
                  pueden contribuir a mejorar la movilidad urbana.
                </p>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ¿QUÉ APRENDERÁS?
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    A reconocer la importancia del transporte
                    sostenible para la calidad de vida.
                  </li>
                  <li>
                    A identificar alternativas como el transporte
                    público, la bicicleta y los desplazamientos
                    a pie.
                  </li>
                  <li>
                    A comprender cómo la tecnología, las políticas
                    y la infraestructura pueden apoyar la
                    movilidad urbana.
                  </li>
                  <li>
                    A relacionar las soluciones de movilidad con
                    las necesidades de tu municipio.
                  </li>
                </ul>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ASÍ AVANZARÁS EN EL TEMA
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    <strong>Video:</strong> observa la clase
                    completa. Adelantarlo no contará como
                    progreso de esa parte.
                  </li>
                  <li>
                    <strong>Información:</strong> consulta las
                    publicaciones sobre transporte sostenible
                    y movilidad urbana, junto con las lecturas
                    complementarias de educación digital.
                    Son recursos opcionales.
                  </li>
                  <li>
                    <strong>Foro:</strong> elige una medida
                    para mejorar la movilidad, explica por qué
                    la priorizarías y menciona un indicador.
                    Después podrás leer las propuestas de tus
                    compañeros y comentarlas si deseas.
                  </li>
                  <li>
                    <strong>Evaluación:</strong> responde cinco
                    preguntas de 2 puntos cada una, equivalentes
                    al 20 % de la nota por pregunta. Para aprobar
                    con un mínimo del 70 %, necesitas al menos
                    cuatro respuestas correctas: 8/10 puntos,
                    equivalentes al 80 %.
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className={styles.nextButton}
                onClick={() => setSection('video')}
              >
                Ir al video →
              </button>
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
                  <span className={styles.videoEyebrow}>
                    APRENDE CON EL VIDEO
                  </span>
                  <h2>Transporte sostenible</h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>◷ Duración: 6 minutos y 42 segundos</span>
                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              </div>

              {error && (
                <p className={styles.pendingNote} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.playerFrame}>
                <VideoPlayer
                  ytVideoId="BNz5AHsH1nA"
                  dbVideoId={video.id}
                  videoDuration={video.duration || 402}
                  onProgress={(_, progress) => {
                    if (progress?.is_completed === true) {
                      setVideoCompleted(true);
                      setError('');
                    }
                  }}
                  onComplete={verifyVideoCompletion}
                />
              </div>

              {videoCompleted ? (
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() => setSection('article')}
                >
                  Ir a Información →
                </button>
              ) : (
                <>
                  <p className={styles.pendingNote}>
                    Mira el video completo. Adelantarlo no
                    registrará esa parte como vista.
                  </p>

                  <button
                    type="button"
                    className={styles.returnButton}
                    onClick={verifyVideoCompletion}
                    disabled={checkingProgress}
                  >
                    {checkingProgress
                      ? 'Consultando tu avance...'
                      : 'Comprobar mi avance'}
                  </button>
                </>
              )}
            </section>
          </div>
        ) : section === 'article' && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <div className={styles.articleHeader}>
                <span className={styles.sectionLabel}>
                  LECTURAS COMPLEMENTARIAS
                </span>

                <h2>Explora y profundiza</h2>

                <p>
                  Consulta estas publicaciones sobre transporte
                  sostenible y movilidad urbana, junto con
                  lecturas complementarias sobre educación
                  inteligente y plataformas de aprendizaje.
                  Son recursos opcionales que puedes revisar
                  ahora o cuando lo necesites.
                </p>
              </div>

              <div className={styles.articleGrid}>
                {topic22Articles.map((article) => (
                  <article
                    key={article.id}
                    className={styles.articleCard}
                  >
                    <span
                      className={styles.articleIcon}
                      aria-hidden="true"
                    >
                      ▤
                    </span>

                    <span className={styles.articleType}>
                      {article.type}
                    </span>

                    <h3>{article.title}</h3>
                    <p>{article.description}</p>

                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.articleLink}
                    >
                      {article.linkLabel} ↗
                    </a>
                  </article>
                ))}
              </div>

              <aside className={styles.cepalBanner}>
                <div>
                  <span className={styles.cepalEyebrow}>
                    FUENTE INSTITUCIONAL · IESE
                  </span>
                  <h3>
                    Conoce las estrategias de movilidad sostenible
                  </h3>
                  <p>
                    Explora ejemplos sobre tecnología, políticas
                    públicas, comportamiento de los usuarios
                    e infraestructura para mejorar la movilidad.
                  </p>
                </div>

                <a
                  href="https://www.iese.edu/insight/articles/setting-wheels-motion-sustainable-transportation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Visitar IESE ↗
                </a>
              </aside>

              <aside className={styles.cepalBanner}>
                <div>
                  <span className={styles.cepalEyebrow}>
                    FUENTE INSTITUCIONAL · CEPAL
                  </span>
                  <h3>
                    Explora la movilidad urbana desde el
                    análisis comparativo
                  </h3>
                  <p>
                    Consulta cómo el diagnóstico y la comparación
                    entre ciudades pueden orientar mejoras
                    adaptadas a las necesidades locales.
                  </p>
                </div>

                <a
                  href="https://www.cepal.org/es/publicaciones/81231-uso-analisis-comparativo-mejorar-la-movilidad-urbana-nueva-herramienta-construir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Visitar CEPAL ↗
                </a>
              </aside>

              <div className={styles.articleNextStep}>
                <div>
                  <strong>¿Listo para participar en el foro?</strong>
                  <p>
                    Las lecturas son opcionales. Comparte
                    una medida para mejorar la movilidad
                    de tu ciudad.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() => setSection('forum')}
                >
                  Ir al foro →
                </button>
              </div>
            </section>
          </div>
        ) : section === 'forum' && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.forumTopBar}>
                {navigation}
              </div>

              <div className={styles.forumHero}>
                <div
                  className={styles.forumHeroIcon}
                  aria-hidden="true"
                >
                  ✦
                </div>

                <div>
                  <span className={styles.forumEyebrow}>
                    ACTIVIDAD PARTICIPATIVA · TEMA 2.2
                  </span>

                  <h2>
                    ¿Qué haría que dejaras el automóvil en casa?
                  </h2>

                  <p>
                    Prioriza una medida de movilidad y explica
                    cómo comprobarías sus resultados.
                  </p>
                </div>
              </div>

              <div className={styles.forumPrompt}>
                <p>
                  Tener una aplicación que muestre las rutas
                  en tiempo real puede ayudar a planificar
                  un viaje. Sin embargo, también importan
                  la frecuencia del transporte público, su costo,
                  la seguridad y la posibilidad de caminar
                  o usar bicicleta.
                </p>

                <h3>
                  ¿Cuál de estos cambios tendría mayor impacto
                  en la forma de desplazarse de las personas
                  de tu ciudad?
                </h3>

                <p>
                  Elige una medida, explica por qué la
                  priorizarías y menciona un indicador que
                  permitiría comprobar si funcionó, como el
                  tiempo de viaje, la frecuencia del servicio
                  o la satisfacción de los usuarios.
                </p>

                <p>
                  Puedes leer las respuestas de tus compañeros
                  y, si deseas, comentar qué otra medida
                  podría complementar su propuesta.
                </p>
              </div>

              <div className={styles.forumGuide}>
                {forumGuide22.map((item) => (
                  <div
                    key={item.number}
                    className={styles.forumGuideCard}
                  >
                    <span className={styles.forumGuideNumber}>
                      {item.number}
                    </span>

                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={styles.returnButton}
                disabled={loadingForum || publishing}
                onClick={() =>
                  setForumRetry((value) => value + 1)
                }
              >
                {loadingForum
                  ? 'Actualizando foro...'
                  : 'Actualizar foro'}
              </button>

              {forumError && (
                <p className={styles.forumError} role="alert">
                  {forumError}
                </p>
              )}

              {loadingForum && (
                <p className={styles.pendingNote}>
                  Cargando las respuestas del foro...
                </p>
              )}

              {myPost ? (
                <>
                  <div className={styles.myForumPost}>
                    <div className={styles.forumPostHeading}>
                      <span aria-hidden="true">✓</span>
                      <strong>Tu respuesta está publicada</strong>
                    </div>

                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {myPost.content}
                    </p>
                  </div>

                  <div className={styles.articleNextStep}>
                    <div>
                      <strong>
                        ✓ Publicaste tu respuesta al foro
                      </strong>

                      <p>
                        {evaluationPassed
                          ? 'También aprobaste la evaluación. Puedes consultar tu resultado.'
                          : 'Tu respuesta quedó guardada. Ya puedes realizar la evaluación. Comentar a tus compañeros es opcional.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.nextButton}
                      disabled={!canOpenEvaluation}
                      onClick={() => setSection('evaluation')}
                    >
                      {evaluationPassed
                        ? 'Ver resultado →'
                        : 'Ir a la evaluación →'}
                    </button>
                  </div>

                  <div className={styles.otherPosts}>
                    <div className={styles.otherPostsHeading}>
                      <h3>Propuestas de tus compañeros</h3>
                    </div>

                    <p>
                      Lee sus respuestas. Si deseas, comenta
                      qué otra medida podría complementar
                      su propuesta.
                    </p>

                    <div className={styles.forumPostsGrid}>
                      {otherPosts.map((post) => {
                        const ownComment = (
                          post.ForoComments || []
                        ).some(
                          (comment) =>
                            Number(comment.userId) ===
                            Number(myPost.userId)
                        );

                        return (
                          <article
                            key={post.id}
                            className={styles.forumPost}
                          >
                            <div className={styles.forumPostAuthor}>
                              <span aria-hidden="true">
                                {(post.User?.name || 'P')
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>

                              <strong>
                                {post.User?.name || 'Participante'}
                              </strong>
                            </div>

                            <p style={{ whiteSpace: 'pre-wrap' }}>
                              {post.content}
                            </p>

                            {(post.ForoComments || []).map(
                              (comment) => (
                                <div
                                  key={comment.id}
                                  className={styles.myForumPost}
                                >
                                  <strong>
                                    {comment.User?.name ||
                                      (Number(comment.userId) ===
                                      Number(myPost.userId)
                                        ? 'Tú'
                                        : 'Participante')}:
                                  </strong>{' '}
                                  {comment.content}
                                </div>
                              )
                            )}

                            {ownComment ? (
                              <p>
                                ✓ Ya comentaste esta propuesta.
                              </p>
                            ) : (
                              <form
                                onSubmit={(event) =>
                                  handleComment22(event, post.id)
                                }
                                className={styles.forumForm}
                              >
                                <label
                                  htmlFor={`comment22-${post.id}`}
                                >
                                  Tu sugerencia — opcional
                                </label>

                                <textarea
                                  id={`comment22-${post.id}`}
                                  value={
                                    commentDrafts[post.id] || ''
                                  }
                                  onChange={(event) =>
                                    setCommentDrafts(
                                      (previous) => ({
                                        ...previous,
                                        [post.id]:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  placeholder="¿Qué otra medida podría complementar esta propuesta?"
                                  minLength={10}
                                  maxLength={1000}
                                  rows={3}
                                  required
                                />

                                <small>
                                  Para publicar un comentario,
                                  escribe entre 10 y 1000 caracteres.
                                </small>

                                <button
                                  type="submit"
                                  className={styles.nextButton}
                                  disabled={
                                    commentingPostId !== null
                                  }
                                >
                                  {commentingPostId === post.id
                                    ? 'Publicando...'
                                    : 'Comentar →'}
                                </button>
                              </form>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    {!loadingForum && otherPosts.length === 0 && (
                      <p className={styles.pendingNote}>
                        Todavía no hay propuestas de compañeros.
                        Tu respuesta quedó guardada y ya puedes
                        realizar la evaluación. Cuando otros
                        participantes publiquen, podrás leer
                        sus respuestas y comentarlas si deseas.
                      </p>
                    )}

                    {commentError && (
                      <p
                        className={styles.forumError}
                        role="alert"
                      >
                        {commentError}
                      </p>
                    )}
                  </div>
                </>
              ) : !loadingForum && forumLoaded ? (
                <form
                  onSubmit={handlePublish22}
                  className={styles.forumForm}
                >
                  <div className={styles.forumFormHeading}>
                    <div>
                      <span className={styles.forumEyebrow}>
                        AHORA TE TOCA PARTICIPAR
                      </span>

                      <h3>Comparte tu propuesta</h3>
                    </div>

                    <span className={styles.forumCharacterCount}>
                      {answer.trim().length}/3000
                    </span>
                  </div>

                  <label htmlFor="forumAnswer22">
                    Tu respuesta
                  </label>

                  <textarea
                    id="forumAnswer22"
                    value={answer}
                    onChange={(event) =>
                      setAnswer(event.target.value)
                    }
                    placeholder="Elige una medida, explica por qué la priorizarías y menciona un indicador para comprobar si funcionó."
                    minLength={30}
                    maxLength={3000}
                    rows={7}
                    required
                  />

                  <small>
                    Escribe entre 30 y 3000 caracteres.
                    Publicar tu respuesta habilita la evaluación.
                  </small>

                  <button
                    type="submit"
                    className={styles.nextButton}
                    disabled={publishing}
                  >
                    {publishing
                      ? 'Publicando...'
                      : 'Publicar respuesta →'}
                  </button>
                </form>
              ) : null}
            </section>
          </div>
        ) : section === 'evaluation' && canOpenEvaluation ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <span className={styles.sectionLabel}>
                EVALUACIÓN · TEMA 2.2
              </span>

              <h2>Comprueba lo que aprendiste</h2>

              <p>
                Responde las cinco preguntas sobre
                transporte sostenible.
              </p>

              <div className={styles.videoMeta}>
                <span>5 preguntas</span>
                <span>2 puntos por respuesta correcta · 20 %</span>
                <span>Nota máxima: 10 puntos</span>
                <span>Mínimo para aprobar: 70 %</span>
              </div>

              <p className={styles.pendingNote}>
                Con cuatro respuestas correctas obtienes
                8 de 10 puntos, equivalentes al 80 %, y apruebas.
                Si no alcanzas el mínimo, puedes revisar tus
                respuestas y volver a intentarlo.
              </p>

              {loadingEvaluation ? (
                <p className={styles.pendingNote}>
                  Consultando tu resultado...
                </p>
              ) : evaluationError ? (
                <div>
                  <p className={styles.forumError} role="alert">
                    {evaluationError}
                  </p>

                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={() => {
                      setLoadingEvaluation(true);
                      setEvaluationError('');
                      setEvaluationRetry((value) => value + 1);
                    }}
                  >
                    Volver a intentar →
                  </button>
                </div>
              ) : evaluationPassed ? (
                <div
                  className={styles.articleNextStep}
                  role="status"
                >
                  <div>
                    <strong>✓ Aprobaste el tema 2.2</strong>

                    <p>
                      Calificación:{' '}
                      {evaluationScore !== null
                        ? `${Number(evaluationScore).toFixed(0)}%`
                        : 'Aprobada'}
                      . Tu resultado quedó guardado.
                    </p>
                  </div>

                  <Link
                    to={`/module/${moduleData.id}/topic/2.3`}
                    className={styles.nextButton}
                  >
                    Tema 2.3 →
                  </Link>
                </div>
              ) : (
                <EvaluationForm
                  evaluationId={evaluationId22}
                  onSuccess={handleEvaluationSuccess22}
                />
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};

const Topic23Content = ({ moduleData }) => {
  const [section, setSection] = useState('index');

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [video, setVideo] = useState(null);
  const [videoCompleted, setVideoCompleted] = useState(false);

  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const [checkingProgress, setCheckingProgress] =
    useState(false);

  const [myPost, setMyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');

  const [loadingForum, setLoadingForum] = useState(false);
  const [forumLoaded, setForumLoaded] = useState(false);
  const [forumError, setForumError] = useState('');
  const [forumRetry, setForumRetry] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentingPostId, setCommentingPostId] =
    useState(null);
  const [commentError, setCommentError] = useState('');

  const [evaluationPassed, setEvaluationPassed] =
    useState(false);

  const forumGuide23 = [
    {
      number: '01',
      title: 'Analiza el parque',
      description:
        'Explica si cumple con el enfoque Smart Living.',
    },
    {
      number: '02',
      title: 'Propón mejoras',
      description:
        'Considera la iluminación, los recorridos accesibles y las actividades comunitarias.',
    },
    {
      number: '03',
      title: 'Escucha a las personas',
      description:
        'Explica por qué es importante consultar a quienes lo utilizan.',
    },
    {
      number: '04',
      title: 'Conoce otras propuestas',
      description:
        'Lee a tus compañeros. Si deseas, añade una idea para distintas edades y capacidades.',
    },
  ];

  useEffect(() => {
    let active = true;

    setLoading(true);
    setHasAccess(false);
    setVideo(null);
    setVideoCompleted(false);
    setSection('index');
    setError('');

    setMyPost(null);
    setPosts([]);
    setAnswer('');
    setForumLoaded(false);
    setForumError('');
    setCommentDrafts({});
    setCommentError('');
    setEvaluationPassed(false);

    const loadTopic = async () => {
      try {
        const previousProgress = await api.get(
          '/evaluations/6/progress'
        );

        if (!active) return;

        if (previousProgress?.passed !== true) {
          setError(
            'Aprueba la evaluación del tema 2.2 para comenzar el tema 2.3.'
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
                'mUOt_GcwS0E'
              )
            )
          : null;

        if (!topicVideo) {
          throw new Error(
            'El video del tema 2.3 no está registrado en este módulo.'
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
              'No se pudo cargar el tema 2.3.'
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
    if (!hasAccess || !videoCompleted) {
      return undefined;
    }

    let active = true;

    setLoadingForum(true);
    setForumLoaded(false);
    setForumError('');

    const loadForum = async () => {
      try {
        const savedPost = await api.get(
          '/foro/2.3/mine'
        );

        if (!active) return;

        setMyPost(savedPost);
        setForumLoaded(true);

        try {
          const forumPosts = await api.get(
            '/foro/2.3/posts'
          );

          if (!active) return;

          setPosts(
            Array.isArray(forumPosts)
              ? forumPosts
              : []
          );
        } catch (err) {
          if (active) {
            setForumError(
              'No se pudieron cargar las respuestas de tus compañeros. Presiona Actualizar foro para volver a intentarlo.'
            );
          }
        }
      } catch (err) {
        if (active) {
          setForumError(
            err.message ||
              'No se pudo consultar tu participación en el foro.'
          );
        }
      } finally {
        if (active) {
          setLoadingForum(false);
        }
      }
    };

    loadForum();

    return () => {
      active = false;
    };
  }, [
    hasAccess,
    videoCompleted,
    moduleData.id,
    forumRetry,
  ]);

  useEffect(() => {
    if (!hasAccess) return undefined;

    let active = true;

    const loadPracticalProgress = async () => {
      try {
        const progress = await api.get(
          '/evaluations/practical/2.3'
        );

        if (active) {
          setEvaluationPassed(
            progress?.passed === true
          );
        }
      } catch (err) {
        // El formulario mostrará el error y permitirá
        // volver a consultar la entrega.
        console.error(
          'No se pudo consultar la evaluación práctica:',
          err
        );
      }
    };

    loadPracticalProgress();

    return () => {
      active = false;
    };
  }, [hasAccess, moduleData.id, retry]);

  const verifyVideoCompletion = async () => {
    if (!video?.id || checkingProgress) return;

    setCheckingProgress(true);

    try {
      const progress = await api.get(
        `/videos/${video.id}/progress`
      );

      if (progress?.is_completed === true) {
        setVideoCompleted(true);
        setError('');
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

  const handlePublish23 = async (event) => {
    event.preventDefault();
    setForumError('');

    const content = answer.trim();

    if (
      content.length < 30 ||
      content.length > 3000
    ) {
      setForumError(
        'Escribe una respuesta de entre 30 y 3000 caracteres.'
      );
      return;
    }

    setPublishing(true);

    try {
      const published = await api.post(
        '/foro/2.3/posts',
        { content }
      );

      setMyPost(published);
      setForumLoaded(true);
      setAnswer('');

      try {
        const forumPosts = await api.get(
          '/foro/2.3/posts'
        );

        setPosts(
          Array.isArray(forumPosts)
            ? forumPosts
            : []
        );
      } catch (err) {
        setForumError(
          'Tu respuesta se publicó y ya puedes realizar la evaluación. No se pudo actualizar la lista de compañeros; presiona Actualizar foro.'
        );
      }
    } catch (err) {
      setForumError(
        err.message ||
          'No se pudo publicar tu respuesta.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleComment23 = async (event, postId) => {
    event.preventDefault();
    setCommentError('');

    const content = (
      commentDrafts[postId] || ''
    ).trim();

    if (
      content.length < 10 ||
      content.length > 1000
    ) {
      setCommentError(
        'Escribe una sugerencia de entre 10 y 1000 caracteres.'
      );
      return;
    }

    setCommentingPostId(postId);

    try {
      const publishedComment = await api.post(
        `/foro/2.3/posts/${postId}/comments`,
        { content }
      );

      setPosts((previous) =>
        previous.map((post) =>
          Number(post.id) === Number(postId)
            ? {
                ...post,
                ForoComments: [
                  ...(post.ForoComments || []),
                  publishedComment,
                ],
              }
            : post
        )
      );

      setCommentDrafts((previous) => ({
        ...previous,
        [postId]: '',
      }));

      try {
        const forumPosts = await api.get(
          '/foro/2.3/posts'
        );

        setPosts(
          Array.isArray(forumPosts)
            ? forumPosts
            : []
        );
      } catch (err) {
        setCommentError(
          'Tu comentario se publicó, pero no se pudo actualizar la lista. Presiona Actualizar foro.'
        );
      }
    } catch (err) {
      setCommentError(
        err.message ||
          'No se pudo publicar tu comentario.'
      );
    } finally {
      setCommentingPostId(null);
    }
  };

  const handleEvaluationSuccess23 = (result) => {
    if (result?.passed === true) {
      setEvaluationPassed(true);
    }
  };

  const otherPosts = posts.filter(
    (post) =>
      myPost &&
      Number(post.userId) !== Number(myPost.userId)
  );

  const forumCompleted = Boolean(myPost);

  const canOpenEvaluation =
    videoCompleted && forumCompleted;

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
        to={`/course/${moduleData.courseId || 1}`}
        className={styles.backLink}
      >
        Volver al curso ↗
      </Link>
    </>
  );

  if (loading) {
    return (
      <main className={styles.message}>
        Consultando el tema 2.3 y tu avance...
      </main>
    );
  }

  if (!hasAccess || !video) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.lessonCard}>
            <Link
              to={`/course/${moduleData.courseId || 1}`}
              className={styles.backLink}
            >
              ← Volver al curso
            </Link>

            <h2>Tema 2.3: Espacios urbanos</h2>

            <p
              className={styles.pendingNote}
              role="alert"
            >
              {error || 'No se pudo cargar el tema.'}
            </p>

            {!hasAccess && (
              <Link
                to={`/module/${moduleData.id}/topic/2.2`}
                className={styles.nextButton}
              >
                Volver al tema 2.2 →
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
        ? 'Completaste la clase del tema 2.3.'
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
        : '¿Un parque bonito es un buen espacio público?',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Aprobaste la evaluación del tema 2.3.'
        : canOpenEvaluation
          ? 'Completa la ficha y adjunta una imagen del lugar.'
          : 'Publica tu respuesta en el foro para continuar.',
      enabled: canOpenEvaluation,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {section === 'index' ? (
          <>
            <Link
              to={`/course/${moduleData.courseId || 1}`}
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
                    MÓDULO 2 · TEMA 2.3
                  </span>

                  <h1>
                    Espacios <span>urbanos</span>
                  </h1>

                  <p>
                    Conoce cómo los espacios urbanos pueden
                    mejorar la calidad de vida cuando son
                    accesibles, seguros, sostenibles e
                    inclusivos, y responden a las necesidades
                    de la comunidad.
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
                    disabled={!item.enabled}
                    className={styles.indexCard}
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
                        : item.id === 'forum' &&
                            forumCompleted
                          ? '✓ Publicada'
                          : item.id === 'evaluation' &&
                              evaluationPassed
                            ? '✓ Aprobada'
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
                {navigation}
              </div>

              <h2>Introducción</h2>

              <p className={styles.introLead}>
                Los espacios urbanos son lugares donde las
                personas se encuentran, se desplazan y
                realizan actividades recreativas,
                culturales, sociales y económicas. Su
                planificación debe considerar la diversidad
                de quienes los utilizan y las necesidades
                de la comunidad.
              </p>

              <div className={styles.introBlock}>
                <span
                  className={styles.introBlockLabel}
                >
                  OBJETIVO
                </span>

                <p>
                  Comprender qué caracteriza a los espacios
                  urbanos inteligentes y reconocer cómo la
                  accesibilidad, la seguridad, la
                  sostenibilidad, la inclusión y la
                  participación comunitaria contribuyen a
                  mejorar la calidad de vida.
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
                    A identificar las características de
                    un espacio urbano accesible, seguro,
                    sostenible e inclusivo.
                  </li>

                  <li>
                    A reconocer la importancia de conectar
                    los espacios públicos y facilitar su
                    uso por diferentes grupos de la
                    población.
                  </li>

                  <li>
                    A explicar cómo la comunidad puede
                    participar en la planificación de
                    estos lugares.
                  </li>

                  <li>
                    A reconocer el apoyo de herramientas
                    como los sistemas de información
                    geográfica y los gemelos digitales
                    en la planificación urbana.
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
                    las lecturas de apoyo del tema.
                    Son recursos opcionales.
                  </li>

                  <li>
                    <strong>Foro:</strong> publica tu
                    respuesta a la actividad. Podrás leer
                    las propuestas de tus compañeros y
                    comentarlas si deseas.
                  </li>

                  <li>
                    <strong>Evaluación práctica:</strong>{' '}
                    completa las seis respuestas sobre un
                    espacio público y adjunta una imagen
                    del lugar. Al guardar la entrega
                    completa obtendrás 10/10 puntos
                    (100 %), sin revisión manual.
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className={styles.nextButton}
                onClick={() =>
                  setSection('video')
                }
              >
                Ir al video →
              </button>
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
                  <span
                    className={styles.videoEyebrow}
                  >
                    APRENDE CON EL VIDEO
                  </span>

                  <h2>Espacios urbanos</h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>
                  ◷ Duración: 6 minutos y 40 segundos
                </span>

                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              </div>

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
                  ytVideoId="mUOt_GcwS0E"
                  dbVideoId={video.id}
                  videoDuration={
                    video.duration || 400
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
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() =>
                    setSection('article')
                  }
                >
                  Ir a Información →
                </button>
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
            </section>
          </div>
        ) : section === 'article' &&
          videoCompleted ? (
          <section className={styles.lessonCard}>
            <div
              className={styles.introNavigation}
            >
              {navigation}
            </div>

            <header
              className={styles.articleHeader}
            >
              <span
                className={styles.sectionLabel}
              >
                LECTURAS COMPLEMENTARIAS · TEMA 2.3
              </span>

              <h2>Explora y profundiza</h2>

              <p className={styles.introLead}>
                Conoce cómo la planificación, la
                participación ciudadana y el uso de
                información pueden contribuir a crear
                espacios urbanos accesibles, inclusivos
                y sostenibles.
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
                  ONU-HÁBITAT · INFORME · 2024 · INGLÉS
                </span>

                <h3>
                  World Smart Cities Outlook 2024
                </h3>

                <p>
                  Examina el desarrollo de las ciudades
                  inteligentes con un enfoque centrado
                  en las personas. Relaciona la tecnología
                  con la planificación urbana, los servicios
                  públicos y la participación de la
                  comunidad.
                </p>

                <p>
                  <strong>Para esta lectura:</strong>{' '}
                  revisa los apartados sobre participación
                  comunitaria y planificación urbana.
                  Reflexiona sobre cómo las herramientas
                  digitales pueden ayudar a mejorar los
                  espacios de tu ciudad.
                </p>

                <a
                  href="https://unhabitat.org/sites/default/files/2024/12/un_smart_city_outlook.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.articleLink}
                >
                  Abrir documento PDF ↗
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
                  ONU-HÁBITAT · CASOS INTERNACIONALES
                  · INGLÉS
                </span>

                <h3>
                  City-Wide Public Space Strategies:
                  A Compendium of Inspiring Practices
                </h3>

                <p>
                  Reúne experiencias de distintas ciudades
                  sobre estrategias para planificar y
                  gestionar los espacios públicos como una
                  red conectada.
                </p>

                <p>
                  <strong>Para esta lectura:</strong>{' '}
                  elige uno de los casos y analiza cómo
                  aborda el acceso, la inclusión y la
                  participación ciudadana. Identifica una
                  idea que podría adaptarse a tu municipio.
                </p>

                <a
                  href="https://unhabitat.org/sites/default/files/2020/03/cwpss_compendium_20200116-1.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.articleLink}
                >
                  Abrir documento PDF ↗
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
                  NACIONES UNIDAS · REVISIÓN 2018
                  · INGLÉS
                </span>

                <h3>
                  World Urbanization Prospects:
                  The 2018 Revision
                </h3>

                <p>
                  Presenta estimaciones y proyecciones
                  de la población urbana y rural.
                  Permite comprender cómo el crecimiento
                  de las ciudades influye en las necesidades
                  de planificación del territorio.
                </p>

                <p>
                  <strong>Para esta lectura:</strong>{' '}
                  consulta la introducción y sus
                  implicaciones para las políticas públicas.
                  Relaciona el crecimiento urbano con la
                  necesidad de contar con espacios públicos
                  y servicios accesibles.
                </p>

                <p>
                  <small>
                    Publicado en 2019, este informe
                    corresponde a la revisión de 2018.
                    Sus cifras deben interpretarse según
                    esa edición.
                  </small>
                </p>

                <a
                  href="https://population.un.org/wup/assets/WUP2018-Report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.articleLink}
                >
                  Abrir documento PDF ↗
                </a>
              </article>
            </div>

            <aside
              className={styles.cepalBanner}
            >
              <div>
                <span
                  className={styles.cepalEyebrow}
                >
                  RECURSOS INSTITUCIONALES
                </span>

                <h3>
                  Ciudades y espacios públicos centrados
                  en las personas
                </h3>

                <p>
                  Consulta las publicaciones de ONU-Hábitat
                  para profundizar en la planificación de
                  ciudades inclusivas y sostenibles.
                </p>
              </div>

              <a
                href="https://unhabitat.org/knowledge/publications"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cepalLink}
              >
                Explorar publicaciones ↗
              </a>
            </aside>

            <div
              className={styles.articleNextStep}
            >
              <p>
                <strong>Para reflexionar:</strong>{' '}
                piensa en un espacio público de tu ciudad.
                ¿Qué información necesitarías para mejorar
                su accesibilidad, sus actividades y la
                experiencia de quienes lo utilizan?
              </p>

              <button
                type="button"
                className={styles.nextButton}
                onClick={() =>
                  setSection('forum')
                }
              >
                Ir al foro →
              </button>
            </div>
          </section>
        ) : section === 'forum' &&
          videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.forumTopBar}>
                {navigation}
              </div>

              <div className={styles.forumHero}>
                <div
                  className={styles.forumHeroIcon}
                  aria-hidden="true"
                >
                  ✦
                </div>

                <div>
                  <span
                    className={styles.forumEyebrow}
                  >
                    ACTIVIDAD PARTICIPATIVA · TEMA 2.3
                  </span>

                  <h2>
                    ¿Un parque bonito es un buen
                    espacio público?
                  </h2>

                  <p>
                    Analiza cómo mejorar un parque para
                    que todas las personas puedan
                    utilizarlo.
                  </p>
                </div>
              </div>

              <div
                className={styles.forumPrompt}
              >
                <p>
                  Un parque tiene jardines y una apariencia
                  atractiva, pero cuenta con poca
                  iluminación, no tiene recorridos
                  accesibles y casi nadie lo utiliza para
                  actividades comunitarias.
                </p>

                <h3>
                  ¿Consideras que este parque cumple
                  con el enfoque Smart Living?
                </h3>

                <p>
                  Explica qué aspectos deberían mejorar y
                  por qué sería importante escuchar a las
                  personas que lo usan antes de hacer
                  cambios.
                </p>

                <p>
                  Lee las respuestas de tus compañeros.
                  Si deseas, añade una idea para que el
                  parque pueda ser utilizado por personas
                  de distintas edades y capacidades.
                  Comentar es opcional.
                </p>
              </div>

              <div
                className={styles.forumGuide}
              >
                {forumGuide23.map((item) => (
                  <div
                    key={item.number}
                    className={
                      styles.forumGuideCard
                    }
                  >
                    <span
                      className={
                        styles.forumGuideNumber
                      }
                    >
                      {item.number}
                    </span>

                    <div>
                      <strong>
                        {item.title}
                      </strong>
                      <p>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={styles.returnButton}
                disabled={
                  loadingForum || publishing
                }
                onClick={() =>
                  setForumRetry(
                    (value) => value + 1
                  )
                }
              >
                {loadingForum
                  ? 'Actualizando foro...'
                  : 'Actualizar foro'}
              </button>

              {forumError && (
                <p
                  className={styles.forumError}
                  role="alert"
                >
                  {forumError}
                </p>
              )}

              {loadingForum && (
                <p
                  className={styles.pendingNote}
                >
                  Cargando las respuestas del foro...
                </p>
              )}

              {myPost ? (
                <>
                  <div
                    className={styles.myForumPost}
                  >
                    <div
                      className={
                        styles.forumPostHeading
                      }
                    >
                      <span aria-hidden="true">
                        ✓
                      </span>
                      <strong>
                        Tu respuesta está publicada
                      </strong>
                    </div>

                    <p
                      style={{
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {myPost.content}
                    </p>
                  </div>

                  <div
                    className={
                      styles.articleNextStep
                    }
                  >
                    <div>
                      <strong>
                        ✓ Publicaste tu respuesta al foro
                      </strong>

                      <p>
                        {evaluationPassed
                          ? 'También aprobaste la evaluación. Puedes consultar tu resultado.'
                          : 'Tu respuesta quedó guardada. Ya puedes realizar la evaluación. Comentar a tus compañeros es opcional.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.nextButton}
                      disabled={
                        !canOpenEvaluation
                      }
                      onClick={() =>
                        setSection('evaluation')
                      }
                    >
                      {evaluationPassed
                        ? 'Ver resultado →'
                        : 'Ir a la evaluación →'}
                    </button>
                  </div>

                  <div
                    className={styles.otherPosts}
                  >
                    <div
                      className={
                        styles.otherPostsHeading
                      }
                    >
                      <h3>
                        Propuestas de tus compañeros
                      </h3>
                    </div>

                    <p>
                      Lee sus respuestas. Si deseas,
                      comenta cómo hacer el parque más
                      accesible e inclusivo.
                    </p>

                    <div
                      className={
                        styles.forumPostsGrid
                      }
                    >
                      {otherPosts.map((post) => {
                        const ownComment = (
                          post.ForoComments || []
                        ).some(
                          (comment) =>
                            Number(comment.userId) ===
                            Number(myPost.userId)
                        );

                        return (
                          <article
                            key={post.id}
                            className={
                              styles.forumPost
                            }
                          >
                            <div
                              className={
                                styles.forumPostAuthor
                              }
                            >
                              <span
                                aria-hidden="true"
                              >
                                {(
                                  post.User?.name ||
                                  'P'
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>

                              <strong>
                                {post.User?.name ||
                                  'Participante'}
                              </strong>
                            </div>

                            <p
                              style={{
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {post.content}
                            </p>

                            {(
                              post.ForoComments || []
                            ).map((comment) => (
                              <div
                                key={comment.id}
                                className={
                                  styles.myForumPost
                                }
                              >
                                <strong>
                                  {comment.User?.name ||
                                    (Number(
                                      comment.userId
                                    ) ===
                                    Number(
                                      myPost.userId
                                    )
                                      ? 'Tú'
                                      : 'Participante')}
                                  :
                                </strong>{' '}
                                {comment.content}
                              </div>
                            ))}

                            {ownComment ? (
                              <p>
                                ✓ Ya comentaste esta
                                propuesta.
                              </p>
                            ) : (
                              <form
                                className={
                                  styles.forumForm
                                }
                                onSubmit={(event) =>
                                  handleComment23(
                                    event,
                                    post.id
                                  )
                                }
                              >
                                <label
                                  htmlFor={
                                    `comment23-${post.id}`
                                  }
                                >
                                  Tu sugerencia — opcional
                                </label>

                                <textarea
                                  id={
                                    `comment23-${post.id}`
                                  }
                                  value={
                                    commentDrafts[
                                      post.id
                                    ] || ''
                                  }
                                  onChange={(event) =>
                                    setCommentDrafts(
                                      (previous) => ({
                                        ...previous,
                                        [post.id]:
                                          event.target
                                            .value,
                                      })
                                    )
                                  }
                                  placeholder="¿Qué idea ayudaría a incluir distintas edades y capacidades?"
                                  minLength={10}
                                  maxLength={1000}
                                  rows={3}
                                  required
                                />

                                <small>
                                  Para publicar un
                                  comentario, escribe entre
                                  10 y 1000 caracteres.
                                </small>

                                <button
                                  type="submit"
                                  className={
                                    styles.nextButton
                                  }
                                  disabled={
                                    commentingPostId !==
                                    null
                                  }
                                >
                                  {commentingPostId ===
                                  post.id
                                    ? 'Publicando...'
                                    : 'Comentar →'}
                                </button>
                              </form>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    {!loadingForum &&
                      otherPosts.length === 0 && (
                        <p
                          className={
                            styles.pendingNote
                          }
                        >
                          Todavía no hay propuestas de
                          compañeros. Tu respuesta quedó
                          guardada y ya puedes realizar la
                          evaluación. Cuando otros
                          participantes publiquen, podrás
                          leer sus respuestas y comentarlas
                          si deseas.
                        </p>
                      )}

                    {commentError && (
                      <p
                        className={styles.forumError}
                        role="alert"
                      >
                        {commentError}
                      </p>
                    )}
                  </div>
                </>
              ) : !loadingForum &&
                forumLoaded ? (
                <form
                  onSubmit={handlePublish23}
                  className={styles.forumForm}
                >
                  <div
                    className={
                      styles.forumFormHeading
                    }
                  >
                    <div>
                      <span
                        className={
                          styles.forumEyebrow
                        }
                      >
                        AHORA TE TOCA PARTICIPAR
                      </span>

                      <h3>
                        Comparte tu propuesta
                      </h3>
                    </div>

                    <span
                      className={
                        styles.forumCharacterCount
                      }
                    >
                      {answer.trim().length}/3000
                    </span>
                  </div>

                  <label
                    htmlFor="forumAnswer23"
                  >
                    Tu respuesta
                  </label>

                  <textarea
                    id="forumAnswer23"
                    value={answer}
                    onChange={(event) =>
                      setAnswer(
                        event.target.value
                      )
                    }
                    placeholder="Explica si el parque cumple con Smart Living, qué mejorarías y cómo escucharías a sus usuarios."
                    minLength={30}
                    maxLength={3000}
                    rows={7}
                    required
                  />

                  <small>
                    Escribe entre 30 y 3000 caracteres.
                    Publicar tu respuesta habilita la
                    evaluación.
                  </small>

                  <button
                    type="submit"
                    className={styles.nextButton}
                    disabled={publishing}
                  >
                    {publishing
                      ? 'Publicando...'
                      : 'Publicar respuesta →'}
                  </button>
                </form>
              ) : null}
            </section>
          </div>
        ) : section === 'evaluation' &&
          canOpenEvaluation ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div
                className={styles.introNavigation}
              >
                {navigation}
              </div>

              <span
                className={styles.sectionLabel}
              >
                EVALUACIÓN PRÁCTICA · TEMA 2.3
              </span>

              <h2>
                Rediseña un espacio público
              </h2>

              <p>
                Aplica los principios de Smart Living
                a un lugar de tu localidad.
              </p>

              <div className={styles.videoMeta}>
                <span>
                  6 respuestas obligatorias
                </span>

                <span>
                  1 imagen del lugar
                </span>

                <span>
                  Entrega completa: 10/10 puntos · 100 %
                </span>
              </div>

              <PracticalEvaluationForm
                courseId={
                  moduleData.courseId || 1
                }
                onSuccess={
                  handleEvaluationSuccess23
                }
              />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};

// Un solo archivo atiende los temas 2.1, 2.2 y 2.3.
const Topic21Intro = ({ moduleData }) => {
  const { topicNumber } = useParams();

  if (topicNumber === '2.1') {
    return (
      <Topic21Content
        key={`${moduleData.id}-2.1`}
        moduleData={moduleData}
      />
    );
  }

  if (topicNumber === '2.2') {
    return (
      <Topic22Content
        key={`${moduleData.id}-2.2`}
        moduleData={moduleData}
      />
    );
  }

  if (topicNumber === '2.3') {
    return (
      <Topic23Content
        key={`${moduleData.id}-2.3`}
        moduleData={moduleData}
      />
    );
  }

  return (
    <main className={styles.message}>
      Tema aún no disponible.
    </main>
  );
};

export default Topic21Intro;
