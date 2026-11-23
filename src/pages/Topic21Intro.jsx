import buttonStyles from '../components/LessonButtons.module.css';
import RequiredReadings, { useRequiredReadings } from '../components/RequiredReadings';
import PracticalEvaluationForm from '../components/PracticalEvaluationForm';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import EvaluationForm from '../components/EvaluationForm';
import sharedStyles from './TopicDetail.module.css';
import topic21Styles from './Topic21Design.module.css';
const styles = sharedStyles;

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
      'Describe qué observarías para ver los resultados',
  },
  {
    number: '04',
    title: 'Conoce otras propuestas',
    description:
      'Lee las respuestas de tus compañeros. Si deseas, comenta con una sugerencia para cuidar la biodiversidad del lugar.',
  },
];

const GreenInfrastructureArt = () => (
  <svg viewBox="0 0 280 210" role="img" aria-label="Parque urbano con árboles, sendero y jardín de lluvia">
    <ellipse cx="143" cy="108" rx="122" ry="92" fill="#e4efff" />
    <circle cx="229" cy="38" r="19" fill="#fff1c9" />
    <path d="M24 160h232v25H24z" fill="#d0e8de" />
    <path d="M114 184c-22-20 42-24 17-49" fill="none" stroke="#fff" strokeWidth="18" />
    <rect x="111" y="57" width="48" height="89" rx="7" fill="#fff" stroke="#8cb3ec" strokeWidth="2" />
    <rect x="162" y="85" width="34" height="61" rx="5" fill="#c9ddfc" />
    {[70,89,108].map(y => <g key={y} fill="#9abdf0"><rect x="122" y={y} width="9" height="9" rx="2"/><rect x="139" y={y} width="9" height="9" rx="2"/></g>)}
    <path d="M68 102v63m151-54v52" stroke="#67a58d" strokeWidth="4" />
    <ellipse cx="68" cy="88" rx="30" ry="39" fill="#a8d3c0" />
    <ellipse cx="219" cy="104" rx="23" ry="31" fill="#b9ddcc" />
    <path d="M166 171c10-19 37-19 51 0-13 12-37 12-51 0" fill="#9bcbee" />
    <path d="M169 163l4-13m24 11 5-15m-20 9-4-12" stroke="#6aa889" strokeWidth="3" strokeLinecap="round" />
    <path d="M27 185h229" stroke="#adc9e9" strokeWidth="2" />
    <rect x="27" y="24" width="48" height="39" rx="12" fill="#fff" stroke="#d5e3fa" />
    <path d="M42 51c-7-15 7-20 19-19-1 14-8 23-19 19m1 0 12-13" fill="#badfcb" stroke="#629c80" strokeWidth="2" />
  </svg>
);

const MobilityArt = () => (<svg viewBox="0 0 280 210" role="img" aria-label="Autobús y bicicleta para una movilidad sostenible"><ellipse cx="140" cy="108" rx="121" ry="88" fill="#e4efff"/><circle cx="229" cy="42" r="18" fill="#fff0c9"/><path d="M22 174h237" stroke="#adc7ec" strokeWidth="3"/><rect x="50" y="66" width="149" height="89" rx="17" fill="#c5daf9" stroke="#83abe3" strokeWidth="2"/><rect x="64" y="79" width="121" height="35" rx="7" fill="white"/><path d="M102 80v33m40-33v33" stroke="#a9c5ec" strokeWidth="3"/><rect x="64" y="125" width="17" height="7" rx="3" fill="#fff1c9"/><rect x="168" y="125" width="17" height="7" rx="3" fill="#fff1c9"/><circle cx="79" cy="156" r="13" fill="#5f85bc"/><circle cx="169" cy="156" r="13" fill="#5f85bc"/><circle cx="79" cy="156" r="5" fill="white"/><circle cx="169" cy="156" r="5" fill="white"/><g fill="none" stroke="#5d9e86" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="204" cy="154" r="15"/><circle cx="250" cy="154" r="15"/><path d="m204 154 16-28 15 28h-31l12-21h25m-6 21 8-37h-8m-25 9h15"/></g><path d="M28 122V84" stroke="#6caa91" strokeWidth="4"/><ellipse cx="28" cy="72" rx="18" ry="28" fill="#aed6c3"/></svg>);
const PublicSpaceArt = () => (<svg viewBox="0 0 280 210" role="img" aria-label="Plaza accesible con árboles, banco y personas"><ellipse cx="140" cy="106" rx="122" ry="89" fill="#e5efff"/><circle cx="229" cy="39" r="18" fill="#fff0c9"/><path d="M24 160h233v25H24z" fill="#d6e9e1"/><path d="m123 185 18-49h29l22 49" fill="white"/><path d="M57 108v55m166-56v56" stroke="#6da48b" strokeWidth="4"/><ellipse cx="57" cy="84" rx="27" ry="38" fill="#add4c0"/><ellipse cx="223" cy="87" rx="26" ry="35" fill="#bedecd"/><g stroke="#89aee0" strokeWidth="4" strokeLinecap="round"><path d="M79 127h48m-48 12h48m-41 1v21m35-21v21"/></g><rect x="137" y="57" width="47" height="55" rx="9" fill="white" stroke="#acc8ed"/><path d="M151 75h20m-20 10h15m-15 10h18" stroke="#9dbdeb" strokeWidth="3"/><circle cx="181" cy="130" r="7" fill="#e3bb92"/><path d="M181 141v16m0-11 11 5m-11 6-8 18m8-18 8 18" stroke="#6e94ce" strokeWidth="5" strokeLinecap="round"/><circle cx="147" cy="136" r="6" fill="#e3bb92"/><path d="M147 146v13h14m-14-13 12 2m-12 9-8 9" fill="none" stroke="#86b6a0" strokeWidth="4" strokeLinecap="round"/><circle cx="150" cy="167" r="12" fill="none" stroke="#86b6a0" strokeWidth="3"/><path d="M25 185h232" stroke="#abc6e9" strokeWidth="2"/></svg>);

const Topic21Content = ({ moduleData }) => {
  const styles = { ...sharedStyles, ...topic21Styles };
  const [section, setSectionState] = useState('index');
  const readingGate = useRequiredReadings('2.1', moduleData?.id ?? '2');
  const setSection = (next) => setSectionState((current) => {
    const destination = typeof next === 'function' ? next(current) : next;
    return ['forum', 'evaluation'].includes(destination) && !readingGate.complete ? 'article' : destination;
  });

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
      <></>

      <Link
        to={`/course/${moduleData.courseId}`}
        className={styles.backLink}
      >
        Volver al curso 
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

            <h2 className={styles.moduleHeading}><span>Tema 2.1: </span>Infraestructura verde</h2>

            <p className={styles.pendingNote} role="alert">
              {error || 'No se pudo cargar el tema.'}
            </p>

            <></>
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

                  <h1 className={styles.moduleIndexTitle}>
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
                <Link to={`/course/${moduleData.courseId}`} className={styles.backLink}>Volver al curso </Link>
              </div>

<div className={styles.greenWelcome}><div>              <h2 className={styles.plainHeading}>Introducción</h2>

              <p className={styles.introLead}>
                Los parques, los árboles y otros espacios naturales
                pueden formar parte de una red planificada que
                aporta beneficios ambientales y sociales a la
                ciudad. La infraestructura verde integra estos
                elementos en la gestión del territorio y en la
                atención de las necesidades de la población.
              </p>

</div><div className={styles.greenArt}><GreenInfrastructureArt /></div></div>
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

              <div className={styles.lessonActionGroup}><button
                type="button"
                className={`${styles.nextButton} ${buttonStyles.primary}`}
                onClick={() => setSection('video')}
              >
                Empezar 
              </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('index')}>← Anterior</button></div>
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
                  <h2 className={styles.moduleHeading}><span>Infraestructura </span>verde</h2>
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
                <span>ⓘ No adelantes el video: las partes que saltes no contarán en tu progreso.</span>
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
                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={`${styles.nextButton} ${buttonStyles.primary}`}
                  onClick={() => setSection('article')}
                >
                  Siguiente 
                </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('about')}>← Anterior</button></div>
              ) : (
                <>
                  <p className={styles.pendingNote}>
                    Mira el video completo. Adelantarlo no
                    registrará esa parte como vista.
                  </p>

                  <button
                    type="button"
                    className={`${styles.returnButton} ${buttonStyles.primary}`}
                    onClick={verifyVideoCompletion}
                    disabled={checkingProgress}
                  >
                   
                  </button>
                </>
              )}
              {!videoCompleted && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('about')}>← Anterior</button></div>}
            </section>
          </div>
        ) : section === 'article' && videoCompleted ? (
          <RequiredReadings gate={readingGate}><div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <div className={styles.articleHeader}>
                <h2 className={styles.plainHeading}>Explora y profundiza</h2>

                <p>
                  Consulta estas publicaciones sobre soluciones
                  basadas en la naturaleza, infraestructura
                  resiliente y financiamiento urbano, junto con
                  una lectura tecnológica complementaria y el
                  informe Cities in Motion 2025. 
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
                  
                </div>

                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={`${styles.nextButton} ${buttonStyles.primary}`}
                  onClick={() => setSection('forum')}
                >
                  Siguiente 
                </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('video')}>← Anterior</button></div>
              </div>
            </section>
          </div></RequiredReadings>
        ) : section === 'forum' && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.forumTopBar}>
                {navigation}
              </div>

<div className={styles.greenWelcome}><div><h2 className={styles.moduleHeading}><span>Un espacio verde</span> con una función</h2><p>Propón soluciones para el calor y la acumulación de agua, considerando a los vecinos y la biodiversidad.</p></div><div className={styles.greenArt}><GreenInfrastructureArt /></div></div>
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
                  en su planificación.
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

                  <div className={styles.forumEvaluationStep}>
                    <div>
                      <strong>
                        ¿Estás preparado?
                      </strong>

                      <p>
                        Es momento de realizar la evaluación.
                      </p>
                    </div>

                    <div className={styles.lessonActionGroup}><button
                      type="button"
                      className={`${styles.nextButton} ${buttonStyles.primary}`}
                      disabled={!canOpenEvaluation}
                      onClick={() => setSection('evaluation')}
                    >
                      Evaluación
                    </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('article')}>← Anterior</button></div>
                  </div>

                  <div className={styles.otherPosts}>
                    <div className={styles.otherPostsHeading}>
                      <h3>Respuestas del foro</h3>
                    <button type="button" className={`${styles.refreshForumButton} ${buttonStyles.primary}`} disabled={loadingForum || publishing} onClick={() => setForumRetry(value => value + 1)}>{loadingForum }</button></div>

                    <div className={styles.forumPostsGrid}>
                      <article className={styles.forumPost}>
                        <div className={styles.forumPostAuthor}><span aria-hidden="true">{(myPost.User?.name || posts.find(post => Number(post.id) === Number(myPost.id))?.User?.name || 'T').charAt(0).toUpperCase()}</span><strong>{myPost.User?.name || posts.find(post => Number(post.id) === Number(myPost.id))?.User?.name || 'Tu publicación'}</strong></div>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{myPost.content}</p>
                        {(posts.find(post => Number(post.id) === Number(myPost.id))?.ForoComments || myPost.ForoComments || []).map(comment => <div key={comment.id} className={styles.myForumPost}><strong>{comment.User?.name || 'Participante'}:</strong> {comment.content}</div>)}
                      </article>
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
                                  className={`${styles.nextButton} ${buttonStyles.primary}`}
                                  disabled={
                                    commentingPostId !== null
                                  }
                                >
                                  {commentingPostId === post.id
                                    ? 'Publicando...'
                                    : 'Comentar '}
                                </button>
                              </form>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    {!loadingForum && otherPosts.length === 0 && (
                      <p className={styles.pendingNote}>
                        Cuando tus compañeros publiquen, sus respuestas aparecerán aquí. Puedes comentar sus propuestas si deseas.
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
                    className={`${styles.nextButton} ${buttonStyles.primary}`}
                    disabled={publishing}
                  >
                    {publishing
                      ? 'Publicando...'
                      : 'Publicar respuesta '}
                  </button>
                </form>
              ) : null}
              {!myPost && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('article')}>← Anterior</button></div>}
            </section>
          </div>
        ) : section === 'evaluation' && canOpenEvaluation ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

             

<h2 className={`${styles.greenEvaluationTitle} ${styles.moduleHeading}`}><span>Comprueba</span> lo que aprendiste</h2>
              <div className={styles.greenEvaluationInfo}>
                <p>Responde cinco preguntas sobre infraestructura verde. Cada una vale 2 puntos y necesitas al menos un 70 % para aprobar.</p>
                <div className={styles.greenEvaluationBadges}><span>5 preguntas</span><span>2 puntos por pregunta</span><span>Apruebas con 4 respuestas correctas</span></div>
              </div>
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
                    className={`${styles.nextButton} ${buttonStyles.primary}`}
                    onClick={() => {
                      setLoadingEvaluation(true);
                      setEvaluationError('');
                      setEvaluationRetry((value) => value + 1);
                    }}
                  >
                    Volver a intentar 
                  </button>
                </div>
              ) : evaluationPassed ? (
                <div
                  className={styles.articleNextStep}
                  role="status"
                >
                  <div>
                    <h3 className={styles.greenCongratulations}>¡Felicidades!</h3><p>Aprobaste el tema 2.1. Puedes pasar al siguiente tema.</p>

                    <p>
                      Calificación:{' '}
                      {evaluationScore !== null
                        ? `${Number(evaluationScore).toFixed(0)}%`
                        : 'Aprobada'}
                      . Tu resultado quedó guardado.
                    </p>
                  </div>

                                   <div className={styles.lessonActionGroup}><Link
                    to={`/module/${moduleData.id}/topic/2.2`}
                    className={`${styles.nextButton} ${buttonStyles.primary}`}
                  >
                    Tema 2.2 
                  </Link><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('forum')}>← Anterior</button></div>
                </div>
              ) : (
                <EvaluationForm
                  evaluationId={EVALUATION_ID}
                  onSuccess={handleEvaluationSuccess21}
                />
              )}
              {!evaluationPassed && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('forum')}>← Anterior</button></div>}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};
const Topic22Content = ({ moduleData }) => {
 const styles = { ...sharedStyles, ...topic21Styles };
  const evaluationId22 = 6;

  const [section, setSectionState] = useState('index');
  const readingGate = useRequiredReadings('2.2', moduleData?.id ?? '2');
  const setSection = (next) => setSectionState((current) => {
    const destination = typeof next === 'function' ? next(current) : next;
    return ['forum', 'evaluation'].includes(destination) && !readingGate.complete ? 'article' : destination;
  });
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
        'Uso del análisis comparativo para mejorar la movilidad urbana.',
      description:
        'Estudio sobre cómo comparar ciudades con características similares para diagnosticar la movilidad y orientar mejoras en el transporte público, el uso de la bicicleta y la información en tiempo real.',
      url: 'https://www.cepal.org/es/publicaciones/81231-uso-analisis-comparativo-mejorar-la-movilidad-urbana-nueva-herramienta-construir',
      linkLabel: 'Consultar publicación',
    },
    {
      id: 'smart-education-sustainability',
      type: 'LECTURA COMPLEMENTARIA · EDUCACIÓN E IA',
      title:
        'Smart Education and Sustainable Learning Environments in Smart Cities',
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
        'Indica cómo comprobarías sus resultados',
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
      <></>

      <Link
        to={`/course/${moduleData.courseId}`}
        className={styles.backLink}
      >
        Volver al curso 
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

            <h2 className={styles.moduleHeading}><span>Tema 2.2: </span>Transporte sostenible</h2>

            <p className={styles.pendingNote} role="alert">
              {error || 'No se pudo cargar el tema.'}
            </p>

        

            <></>
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

                  <h1 className={styles.moduleIndexTitle}>
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
                <Link to={`/course/${moduleData.courseId}`} className={styles.backLink}>Volver al curso </Link>
              </div>

              <div className={styles.greenWelcome}><div><h2 className={styles.plainHeading}>Introducción</h2>

              <p className={styles.introLead}>
                La movilidad influye en el acceso al trabajo,
                la educación y los servicios. El transporte
                sostenible busca mejorar los desplazamientos
                considerando las necesidades de las personas,
                la eficiencia de los servicios y el cuidado
                del ambiente.
              </p></div><div className={styles.greenArt}><MobilityArt /></div></div>

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

              <div className={styles.lessonActionGroup}><button
                type="button"
                className={`${styles.nextButton} ${buttonStyles.primary}`}
                onClick={() => setSection('video')}
              >
                Empezar 
              </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('index')}>← Anterior</button></div>
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
                  
                  <h2 className={styles.moduleHeading}>Transporte <span>sostenible</span></h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>◷ Duración: 6 minutos y 42 segundos</span>
                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              <span>ⓘ No adelantes el video: las partes que saltes no contarán en tu progreso.</span></div>

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
                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={`${styles.nextButton} ${buttonStyles.primary}`}
                  onClick={() => setSection('article')}
                >
                  Siguiente 
                </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('about')}>← Anterior</button></div>
              ) : (
                <>
                  <p className={styles.pendingNote}>
                    Mira el video completo. Adelantarlo no
                    registrará esa parte como vista.
                  </p>

                  <button
                    type="button"
                    className={`${styles.returnButton} ${buttonStyles.primary}`}
                    onClick={verifyVideoCompletion}
                    disabled={checkingProgress}
                  >
                  
                  </button>
                </>
              )}
            {!videoCompleted && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('about')}>← Anterior</button></div>}</section>
          </div>
        ) : section === 'article' && videoCompleted ? (
          <RequiredReadings gate={readingGate}><div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <div className={styles.articleHeader}>
                

                <h2 className={styles.plainHeading}>Explora y profundiza</h2>

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
               
                </div>

                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={`${styles.nextButton} ${buttonStyles.primary}`}
                  onClick={() => setSection('forum')}
                >
                  Siguiente 
                </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('video')}>← Anterior</button></div>
              </div>
            </section>
          </div></RequiredReadings>
        ) : section === 'forum' && videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.forumTopBar}>
                {navigation}
              </div>

              <div className={styles.greenWelcome}><div>
                

                  <h2 className={styles.moduleHeading}><span>¿Qué haría que dejaras </span>el automóvil en casa?</h2>

                  <p>
                    Prioriza una medida de movilidad y explica
                    cómo comprobarías sus resultados.
                  </p>
                </div><div className={styles.greenArt}><MobilityArt /></div></div>

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
                  permitiría comprobar si funcionó.
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

                  <div className={styles.forumEvaluationStep}>
                    <div>
                      <strong>
                        ¿Estás preparado?
                      </strong>

                      <p>
                        Es momento de realizar la evaluación.
                      </p>
                    </div>

                    <div className={styles.lessonActionGroup}><button
                      type="button"
                      className={`${styles.nextButton} ${buttonStyles.primary}`}
                      disabled={!canOpenEvaluation}
                      onClick={() => setSection('evaluation')}
                    >
                      Evaluación
                    </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('article')}>← Anterior</button></div>
                  </div>

                  <div className={styles.otherPosts}>
                    <div className={styles.otherPostsHeading}>
                      <h3>Respuestas del foro</h3>
                    <button type="button" className={`${styles.refreshForumButton} ${buttonStyles.primary}`} disabled={loadingForum || publishing} onClick={() => setForumRetry(value => value + 1)}>{loadingForum }</button></div>

                    

                    <div className={styles.forumPostsGrid}>
                      <article className={styles.forumPost}><div className={styles.forumPostAuthor}><span aria-hidden="true">{(myPost.User?.name || posts.find(post => Number(post.id) === Number(myPost.id))?.User?.name || 'T').charAt(0).toUpperCase()}</span><strong>{myPost.User?.name || posts.find(post => Number(post.id) === Number(myPost.id))?.User?.name || 'Tu publicación'}</strong></div><p style={{ whiteSpace: 'pre-wrap' }}>{myPost.content}</p>{(posts.find(post => Number(post.id) === Number(myPost.id))?.ForoComments || myPost.ForoComments || []).map(comment => <div key={comment.id} className={styles.myForumPost}><strong>{comment.User?.name || 'Participante'}:</strong> {comment.content}</div>)}</article>{otherPosts.map((post) => {
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
                                  className={`${styles.nextButton} ${buttonStyles.primary}`}
                                  disabled={
                                    commentingPostId !== null
                                  }
                                >
                                  {commentingPostId === post.id
                                    ? 'Publicando...'
                                    : 'Comentar '}
                                </button>
                              </form>
                            )}
                          </article>
                        );
                      })}
                    </div>

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
                    className={`${styles.nextButton} ${buttonStyles.primary}`}
                    disabled={publishing}
                  >
                    {publishing
                      ? 'Publicando...'
                      : 'Publicar respuesta '}
                  </button>
                </form>
              ) : null}
            {!myPost && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('article')}>← Anterior</button></div>}</section>
          </div>
        ) : section === 'evaluation' && canOpenEvaluation ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

            

              <h2 className={`${styles.greenEvaluationTitle} ${styles.moduleHeading}`}><span>Comprueba</span> lo que aprendiste</h2><div className={styles.greenEvaluationInfo}><p>Responde cinco preguntas sobre transporte sostenible. Cada una vale 2 puntos y necesitas al menos un 70 % para aprobar.</p><div className={styles.greenEvaluationBadges}><span>5 preguntas</span><span>2 puntos por pregunta</span><span>Apruebas con 4 respuestas correctas</span></div></div>{loadingEvaluation ? (
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
                    className={`${styles.nextButton} ${buttonStyles.primary}`}
                    onClick={() => {
                      setLoadingEvaluation(true);
                      setEvaluationError('');
                      setEvaluationRetry((value) => value + 1);
                    }}
                  >
                    Volver a intentar 
                  </button>
                </div>
              ) : evaluationPassed ? (
                <div
                  className={styles.articleNextStep}
                  role="status"
                >
                  <div>
                    <h3 className={styles.greenCongratulations}>¡Felicidades!</h3><p>Aprobaste el tema 2.2. Puedes pasar al siguiente tema.</p>

                    <p>
                      Calificación:{' '}
                      {evaluationScore !== null
                        ? `${Number(evaluationScore).toFixed(0)}%`
                        : 'Aprobada'}
                      . Tu resultado quedó guardado.
                    </p>
                  </div>

                  <div className={styles.lessonActionGroup}><Link
                    to={`/module/${moduleData.id}/topic/2.3`}
                    className={`${styles.nextButton} ${buttonStyles.primary}`}
                  >
                    Tema 2.3 
                  </Link><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('forum')}>← Anterior</button></div>
                </div>
              ) : (
                <EvaluationForm
                  evaluationId={evaluationId22}
                  onSuccess={handleEvaluationSuccess22}
                />
              )}
            {!evaluationPassed && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('forum')}>← Anterior</button></div>}</section>
          </div>
        ) : null}
      </div>
    </main>
  );
};

const Topic23Content = ({ moduleData }) => {
 const styles = { ...sharedStyles, ...topic21Styles };
  const [section, setSectionState] = useState('index');
  const readingGate = useRequiredReadings('2.3', moduleData?.id ?? '2');
  const setSection = (next) => setSectionState((current) => {
    const destination = typeof next === 'function' ? next(current) : next;
    return ['forum', 'evaluation'].includes(destination) && !readingGate.complete ? 'article' : destination;
  });

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
      <></>

      <Link
        to={`/course/${moduleData.courseId || 1}`}
        className={styles.backLink}
      >
        Volver al curso 
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

            <h2 className={styles.moduleHeading}><span>Tema 2.3: </span>Espacios urbanos</h2>

            <p
              className={styles.pendingNote}
              role="alert"
            >
              {error || 'No se pudo cargar el tema.'}
            </p>

          

            <></>
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

                  <h1 className={styles.moduleIndexTitle}>
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
                <Link to={`/course/${moduleData.courseId}`} className={styles.backLink}>Volver al curso </Link>
              </div>

              <div className={styles.greenWelcome}><div><h2 className={styles.plainHeading}>Introducción</h2>

              <p className={styles.introLead}>
                Los espacios urbanos son lugares donde las
                personas se encuentran, se desplazan y
                realizan actividades recreativas,
                culturales, sociales y económicas. Su
                planificación debe considerar la diversidad
                de quienes los utilizan y las necesidades
                de la comunidad.
              </p></div><div className={styles.greenArt}><PublicSpaceArt /></div></div>

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

              <div className={styles.lessonActionGroup}><button
                type="button"
                className={`${styles.nextButton} ${buttonStyles.primary}`}
                onClick={() =>
                  setSection('video')
                }
              >
                Empezar 
              </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('index')}>← Anterior</button></div>
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
                  

                  <h2 className={styles.moduleHeading}>Espacios <span>urbanos</span></h2>
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
                <div className={styles.lessonActionGroup}><button
                  type="button"
                  className={`${styles.nextButton} ${buttonStyles.primary}`}
                  onClick={() =>
                    setSection('article')
                  }
                >
                  Siguiente 
                </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('about')}>← Anterior</button></div>
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
                    className={`${styles.returnButton} ${buttonStyles.primary}`}
                    onClick={
                      verifyVideoCompletion
                    }
                    disabled={checkingProgress}
                  >
                  
                  </button>
                </>
              )}
            {!videoCompleted && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('about')}>← Anterior</button></div>}</section>
          </div>
        ) : section === 'article' &&
          videoCompleted ? (
          <RequiredReadings gate={readingGate}><section className={styles.lessonCard}>
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
            

              <div className={styles.lessonActionGroup}><button
                type="button"
                className={`${styles.nextButton} ${buttonStyles.primary}`}
                onClick={() =>
                  setSection('forum')
                }
              >
                Siguiente 
              </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('video')}>← Anterior</button></div>
            </div>
          </section></RequiredReadings>
        ) : section === 'forum' &&
          videoCompleted ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.forumTopBar}>
                {navigation}
              </div>

              <div className={styles.greenWelcome}><div>
              

                  <h2 className={styles.moduleHeading}><span>¿Un parque bonito es </span>un buen
                    espacio público?</h2>

                  <p>
                    Analiza cómo mejorar un parque para
                    que todas las personas puedan
                    utilizarlo.
                  </p>
                </div><div className={styles.greenArt}><PublicSpaceArt /></div></div>

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
                      styles.forumEvaluationStep
                    }
                  >
                    <div>
                      <strong>
                        ¿Estás preparado?
                      </strong>

                      <p>
                        Es momento de realizar la evaluación.
                      </p>
                    </div>

                    <div className={styles.lessonActionGroup}><button
                      type="button"
                      className={`${styles.nextButton} ${buttonStyles.primary}`}
                      disabled={
                        !canOpenEvaluation
                      }
                      onClick={() =>
                        setSection('evaluation')
                      }
                    >
                      Evaluación
                    </button><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('article')}>← Anterior</button></div>
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
                        Respuestas del foro
                      </h3>
                    <button type="button" className={`${styles.refreshForumButton} ${buttonStyles.primary}`} disabled={loadingForum || publishing} onClick={() => setForumRetry(value => value + 1)}>{loadingForum }</button></div>

                    

                    <div
                      className={
                        styles.forumPostsGrid
                      }
                    >
                      <article className={styles.forumPost}><div className={styles.forumPostAuthor}><span aria-hidden="true">{(myPost.User?.name || posts.find(post => Number(post.id) === Number(myPost.id))?.User?.name || 'T').charAt(0).toUpperCase()}</span><strong>{myPost.User?.name || posts.find(post => Number(post.id) === Number(myPost.id))?.User?.name || 'Tu publicación'}</strong></div><p style={{ whiteSpace: 'pre-wrap' }}>{myPost.content}</p>{(posts.find(post => Number(post.id) === Number(myPost.id))?.ForoComments || myPost.ForoComments || []).map(comment => <div key={comment.id} className={styles.myForumPost}><strong>{comment.User?.name || 'Participante'}:</strong> {comment.content}</div>)}</article>{otherPosts.map((post) => {
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
                                  className={`${styles.nextButton} ${buttonStyles.primary}`}
                                  disabled={
                                    commentingPostId !==
                                    null
                                  }
                                >
                                  {commentingPostId ===
                                  post.id
                                    ? 'Publicando...'
                                    : 'Comentar '}
                                </button>
                              </form>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    

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
                    Publicar tu respuesta hgradabilita la
                    evaluación.
                  </small>

                  <button
                    type="submit"
                    className={`${styles.nextButton} ${buttonStyles.primary}`}
                    disabled={publishing}
                  >
                    {publishing
                      ? 'Publicando...'
                      : 'Publicar respuesta '}
                  </button>
                </form>
              ) : null}
            {!myPost && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('article')}>← Anterior</button></div>}</section>
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

             

              <h2 className={styles.moduleHeading}><span>Rediseña un </span>espacio público</h2>

            

              <div className={styles.greenEvaluationInfo}><div className={styles.greenEvaluationBadges}>
                <span>
                  6 respuestas obligatorias
                </span>

                <span>
                  1 imagen del lugar
                </span>

                <span>
                  Entrega completa: 10/10 puntos · 100 %
                </span>
              </div></div>

              {evaluationPassed && <div className={styles.practicalSuccess} role="status"><div><h3>¡Felicidades!</h3><p>Aprobaste el tema 2.3 — 10/10 puntos (100 %)</p><p>Tu actividad y la imagen quedaron guardadas.</p></div><div className={styles.lessonActionGroup}><Link to="/module/2/integrative-evaluation" className={`${styles.nextButton} ${buttonStyles.primary}`}>Evaluación integradora </Link><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('forum')}>← Anterior</button></div></div>}
<div className={`${styles.practicalPresentation} ${evaluationPassed ? styles.practicalResultSaved : ""}`}><PracticalEvaluationForm
                courseId={
                  moduleData.courseId || 1
                }
                onSuccess={
                  handleEvaluationSuccess23
                }
              /></div>
            {!evaluationPassed && <div className={styles.lessonActionGroup}><button type="button" className={`${styles.previousLessonButton} ${buttonStyles.previous}`} onClick={() => setSection('forum')}>← Anterior</button></div>}</section>
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
