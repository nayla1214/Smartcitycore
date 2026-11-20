import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { getModuleById } from '../data/courseData';
import VideoPlayer from '../components/VideoPlayer';
import EvaluationForm from '../components/EvaluationForm';
import Topic21Intro from './Topic21Intro';
import styles from './TopicDetail.module.css';
import Topic31Intro, {
  Topic32Content,
  Topic33Content,
} from './Topic31Intro';

const forumPrompts = [
  {
    number: '01',
    title: 'Identifica el problema',
    description: '¿Qué ocurre en tu ciudad o cantón y a quiénes afecta?',
  },
  {
    number: '02',
    title: 'Reúne información',
    description: '¿Qué datos debería recoger el municipio?',
  },
  {
    number: '03',
    title: 'Propón una decisión',
    description: '¿Cómo usaría esos datos para elegir una solución?',
  },
  {
    number: '04',
    title: 'Incluye a la ciudadanía',
    description: '¿Cómo participarían los habitantes?',
  },
];

const articles = [
  {
    id: 'smart-cities',
    type: 'CIUDADES INTELIGENTES',
    title: 'El camino de desarrollo de las ciudades inteligentes',
    description:
      'Una evaluación de Bogotá, Buenos Aires, Ciudad de México y São Paulo. Publicación de Sebastián Cabello para la CEPAL.',
    url: 'https://www.cepal.org/es/publicaciones/48000-camino-desarrollo-ciudades-inteligentes-evaluacion-bogota-buenos-aires-ciudad',
    linkLabel: 'Leer publicación',
  },
  {
    id: 'online-teaching',
    type: 'EDUCACIÓN EN LÍNEA',
    title: 'Innovative Online Teaching and Learning Methods',
    description:
      'Una lectura en inglés sobre métodos y recursos para la enseñanza y el aprendizaje en línea.',
    url: 'https://journaleet.in/index.php/jeet/article/view/2368',
    linkLabel: 'Consultar artículo',
  },
  {
    id: 'digital-innovation',
    type: 'INNOVACIÓN DIGITAL',
    title: 'Digital Innovation in Higher Education',
    description:
      'Un análisis en inglés de distintos enfoques de innovación digital en instituciones de educación superior.',
    url: 'https://doi.org/10.3389/feduc.2025.1723087',
    linkLabel: 'Consultar artículo',
  },
];

const topic12Articles = [
  {
    id: 'smart-city-workforce-mooc',
    type: 'FORMACIÓN PARA CIUDADES INTELIGENTES',
    title: 'MOOCs para formar profesionales de ciudades inteligentes',
    description:
      'Estudio sobre la formación en línea para equipos que trabajan en ciudades inteligentes.',
    url: 'https://www.kmel-journal.org/ojs/index.php/online-publication/article/view/659',
    linkLabel: 'Consultar publicación',
  },
  {
    id: 'mooc-platforms-review',
    type: 'EDUCACIÓN EN LÍNEA',
    title: 'Revisión sistemática de plataformas MOOC',
    description:
      'Investigación sobre plataformas y recursos para el aprendizaje abierto en línea.',
    url: 'https://link.springer.com/article/10.1007/s44217-025-01085-2',
    linkLabel: 'Consultar artículo',
  },
  {
    id: 'ifip-digital-technologies',
    type: 'TRANSFORMACIÓN DIGITAL',
    title: '18th IFIP WG 9.4 International Conference',
    description:
      'Actas de una conferencia internacional sobre tecnologías digitales y desarrollo.',
    url: 'https://link.springer.com/book/10.1007/978-3-031-66986-6',
    linkLabel: 'Consultar publicación',
  },
  {
    id: 'iese-2025-article',
    type: 'CIUDADES EN MOVIMIENTO',
    title: 'Las ciudades líderes convergen en sus estrategias',
    description:
      'Artículo de IESE sobre los desafíos comunes de las ciudades en su índice Cities in Motion.',
    url: 'https://www.iese.edu/insight/articles/smart-cities-in-motion-ranking/',
    linkLabel: 'Consultar artículo',
  },
  {
    id: 'iese-report-2025',
    type: 'INFORME IESE · 2025',
    title: 'IESE Cities in Motion Index 2025',
    description:
      'Informe de 2025 para explorar indicadores y comparar ciudades.',
    url: 'https://www.iese.edu/media/research/pdfs/ST-0665-E',
    linkLabel: 'Consultar informe',
  },
  {
    id: 'iese-report-2026',
    type: 'INFORME IESE · 2026',
    title: 'IESE Cities in Motion Index 2026',
    description:
      'Informe de 2026 para conocer la evolución de las ciudades analizadas.',
    url: 'https://www.iese.edu/media/research/pdfs/ST-0684-E.pdf',
    linkLabel: 'Consultar informe',
  },
];
const Topic12Intro = ({ moduleData }) => {
  const [section, setSection] = useState('index');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [topicVideo, setTopicVideo] = useState(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);

  const [myPost, setMyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');
  const [forumError, setForumError] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentError, setCommentError] = useState('');

  const [evaluationPassed, setEvaluationPassed] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState(null);

  const evaluationId12 = 2;

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      try {
        const evaluation11Id = moduleData?.evaluation?.id;
        if (!evaluation11Id) return;

        const result = await api.get(
          `/evaluations/${evaluation11Id}/progress`
        );

        if (active) {
          setHasAccess(result?.passed === true);
        }
      } catch (error) {
        console.error('No se pudo verificar el tema 1.1:', error);
      } finally {
        if (active) setCheckingAccess(false);
      }
    };

    checkAccess();

    return () => {
      active = false;
    };
  }, [moduleData?.evaluation?.id]);

  useEffect(() => {
    let active = true;

    const loadVideo = async () => {
      try {
        const videos = await api.get(
          `/videos/module/${moduleData.id}`
        );

        const found = videos.find((item) =>
          String(item.url).includes('t7Yng5_mHzw')
        );

        if (!active || !found) return;

        setTopicVideo(found);

        const progress = await api.get(
          `/videos/${found.id}/progress`
        );

        if (active) {
          setVideoCompleted(progress?.is_completed === true);
        }
      } catch (error) {
        console.error('No se pudo cargar el video 1.2:', error);
      } finally {
        if (active) setLoadingVideo(false);
      }
    };

    loadVideo();

    return () => {
      active = false;
    };
  }, [moduleData.id]);

  useEffect(() => {
    if (!videoCompleted) return undefined;

    let active = true;

    const loadForum = async () => {
      try {
        const [savedPost, forumPosts] = await Promise.all([
          api.get('/foro/1.2/mine'),
          api.get('/foro/1.2/posts'),
        ]);

        if (active) {
          setMyPost(savedPost);
          setPosts(Array.isArray(forumPosts) ? forumPosts : []);
          setForumError('');
        }
      } catch (error) {
        if (active) {
          setForumError(
            error.message || 'No se pudo cargar el foro.'
          );
        }
      }
    };

    loadForum();

    return () => {
      active = false;
    };
  }, [videoCompleted]);

  useEffect(() => {
    let active = true;

    const loadEvaluation = async () => {
      try {
        const progress = await api.get(
          `/evaluations/${evaluationId12}/progress`
        );

        if (active) {
          setEvaluationPassed(progress?.passed === true);
          setEvaluationScore(progress?.percentage ?? null);
        }
      } catch (error) {
        console.error('No se pudo cargar la evaluación 1.2:', error);
      }
    };

    loadEvaluation();

    return () => {
      active = false;
    };
  }, []);

  const handlePublish12 = async (event) => {
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
        '/foro/1.2/posts',
        { content }
      );

      setMyPost(published);
      setAnswer('');

      const forumPosts = await api.get('/foro/1.2/posts');
      setPosts(Array.isArray(forumPosts) ? forumPosts : []);
    } catch (error) {
      setForumError(
        error.message || 'No se pudo publicar tu respuesta.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleComment12 = async (event, postId) => {
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
      await api.post(
        `/foro/1.2/posts/${postId}/comments`,
        { content }
      );

      const forumPosts = await api.get('/foro/1.2/posts');
      setPosts(Array.isArray(forumPosts) ? forumPosts : []);

      setCommentDrafts((previous) => ({
        ...previous,
        [postId]: '',
      }));
    } catch (error) {
      setCommentError(
        error.message || 'No se pudo publicar tu comentario.'
      );
    } finally {
      setCommentingPostId(null);
    }
  };

  if (checkingAccess) {
    return (
      <main className={styles.message}>
        Consultando tu avance...
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className={styles.message}>
        <p>Aprueba el tema 1.1 para acceder al tema 1.2.</p>
        <Link to={`/course/${moduleData.courseId}`}>
          Volver al curso
        </Link>
      </main>
    );
  }

  const sections = [
    {
      id: 'about',
      label: 'Introducción',
      description: 'Conoce el objetivo y los aprendizajes del tema.',
      enabled: true,
    },
    {
      id: 'video',
      label: 'Video',
      description: 'Observa la clase del tema 1.2.',
      enabled: true,
    },
    {
      id: 'article',
      label: 'Información',
      description: 'Explora los índices y las lecturas de apoyo.',
      enabled: videoCompleted,
    },
    {
      id: 'forum',
      label: 'Foro',
      description: 'Propón una función para tu municipio.',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Evaluación aprobada.'
        : 'Comprueba lo que aprendiste.',
      enabled: Boolean(myPost),
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
                    MÓDULO 1 · TEMA 1.2
                  </span>

                  <h1>
                    Gobernanza inteligente y{' '}
                    <span>ciudadanía digital</span>
                  </h1>

                  <p>
                    Descubre cómo los municipios pueden tomar mejores
                    decisiones y acercarse a la ciudadanía mediante
                    información, tecnología y participación.
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
                      {evaluationPassed && item.id === 'evaluation'
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
              </div>

              <h2>Introducción</h2>

              <p className={styles.introLead}>
                Una ciudad se gobierna mejor cuando sus autoridades
                escuchan a la población, utilizan información para
                decidir y ofrecen servicios accesibles.
              </p>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  OBJETIVO
                </span>

                <p>
                  Comprender cómo la gobernanza inteligente combina
                  tecnología, datos y participación ciudadana para
                  mejorar las decisiones y los servicios municipales.
                </p>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ¿QUÉ APRENDERÁS?
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    A reconocer los principios de transparencia,
                    participación y colaboración.
                  </li>
                  <li>
                    A identificar formas de participar en la gestión
                    municipal mediante herramientas digitales.
                  </li>
                  <li>
                    A proponer medidas para incluir a personas con
                    poco acceso o experiencia digital.
                  </li>
                </ul>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ASÍ AVANZARÁS EN EL TEMA
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    <strong>Video:</strong> observa la clase completa.
                    Adelantarlo no contará como progreso.
                  </li>
                  <li>
                    <strong>Información:</strong> explora las lecturas
                    y los informes de IESE 2025 y 2026.
                  </li>
                  <li>
                    <strong>Foro:</strong> publica una propuesta para
                    tu municipio y comenta la de un compañero.
                  </li>
                  <li>
                    <strong>Evaluación:</strong> responde cinco
                    preguntas de 2 puntos cada una. Necesitas al
                    menos 70 % para aprobar; eso significa acertar
                    cuatro de las cinco preguntas.
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
                  <h2>Gobernanza inteligente y ciudadanía digital</h2>
                </div>
              </div>

              {topicVideo ? (
                <div className={styles.playerFrame}>
                  <VideoPlayer
                    ytVideoId="t7Yng5_mHzw"
                    dbVideoId={topicVideo.id}
                    videoDuration={topicVideo.duration}
                    onProgress={(_, progress) => {
                      if (progress?.is_completed === true) {
                        setVideoCompleted(true);
                      }
                    }}
                    onComplete={() => setVideoCompleted(true)}
                  />
                </div>
              ) : (
                <p className={styles.pendingNote}>
                  {loadingVideo
                    ? 'Cargando el video...'
                    : 'El video 1.2 aún no está registrado en la base de datos.'}
                </p>
              )}

              {videoCompleted ? (
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() => setSection('article')}
                >
                  Ir a Información →
                </button>
              ) : topicVideo ? (
                <p className={styles.pendingNote}>
                  Mira el video completo. Adelantarlo no registrará
                  esa parte como vista.
                </p>
              ) : null}
            </section>
          </div>
        ) : section === 'article' ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <button
                type="button"
                className={styles.returnButton}
                onClick={() => setSection('index')}
              >
                ← Contenido del tema
              </button>

              <div className={styles.articleHeader}>
                <span className={styles.sectionLabel}>
                  LECTURAS COMPLEMENTARIAS
                </span>

                <h2>Explora y profundiza</h2>

                <p>
                  Consulta estas publicaciones sobre educación
                  digital, ciudades inteligentes e indicadores urbanos.
                </p>
              </div>

              <div className={styles.articleGrid}>
                {topic12Articles.map((article) => (
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
                    FUENTE INSTITUCIONAL
                  </span>

                  <h3>Explora los datos de IESE Cities in Motion</h3>

                  <p>
                    Consulta el índice interactivo y compara
                    los indicadores de distintas ciudades.
                  </p>
                </div>

                <a
                  href="https://citiesinmotion.iese.edu/index/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cepalLink}
                >
                  Visitar IESE ↗
                </a>
              </aside>

              <div className={styles.articleNextStep}>
                <div>
                  <strong>¿Listo para participar?</strong>
                  <p>Publica una propuesta para tu municipio.</p>
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
                    ACTIVIDAD PARTICIPATIVA
                  </span>

                  <h2>Una propuesta para mi municipio</h2>

                  <p>
                    Elige una función para mejorar la participación ciudadana.
                  </p>
                </div>
              </div>

              <div className={styles.forumPrompt}>
                <h3>¿Qué función incluirías primero?</h3>

                <p>
                  Imagina que tu municipio quiere mejorar la
                  participación ciudadana mediante una plataforma
                  digital. ¿Qué función incluirías primero:
                  consultar información pública, realizar trámites,
                  reportar problemas o presentar propuestas?
                </p>
              </div>

              <div className={styles.forumGuide}>
                <div className={styles.forumGuideCard}>
                  <span className={styles.forumGuideNumber}>01</span>
                  <div>
                    <strong>Elige una función</strong>
                    <p>¿Qué incluirías primero?</p>
                  </div>
                </div>

                <div className={styles.forumGuideCard}>
                  <span className={styles.forumGuideNumber}>02</span>
                  <div>
                    <strong>Explica tu elección</strong>
                    <p>¿Cómo ayudaría al municipio?</p>
                  </div>
                </div>

                <div className={styles.forumGuideCard}>
                  <span className={styles.forumGuideNumber}>03</span>
                  <div>
                    <strong>Incluye a todos</strong>
                    <p>
                      ¿Cómo participarían quienes tienen barreras digitales?
                    </p>
                  </div>
                </div>
              </div>

              {myPost ? (
                <div className={styles.myForumPost}>
                  <div className={styles.forumPostHeading}>
                    <span aria-hidden="true">✓</span>
                    <strong>Tu respuesta está publicada</strong>
                  </div>
                  <p>{myPost.content}</p>
                </div>
              ) : (
                <form
                  onSubmit={handlePublish12}
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

                  <label htmlFor="forumAnswer12">
                    Tu respuesta
                  </label>

                  <textarea
                    id="forumAnswer12"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="....."
                    minLength={30}
                    maxLength={3000}
                    rows={7}
                    required
                  />

                  <small>Escribe entre 30 y 3000 caracteres.</small>

                  {forumError && (
                    <p className={styles.forumError} role="alert">
                      {forumError}
                    </p>
                  )}

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
              )}

              {myPost && (
                <>
                  {forumError && (
                    <p className={styles.forumError} role="alert">
                      {forumError}
                    </p>
                  )}

                  <div className={styles.otherPosts}>
                    <div className={styles.otherPostsHeading}>
                      <h3>Propuestas de tus compañeros</h3>
                    </div>

                    <p>
                      Lee una propuesta y comenta con una sugerencia concreta.
                    </p>

                    <div className={styles.forumPostsGrid}>
                      {posts
                        .filter(
                          (post) =>
                            Number(post.id) !== Number(myPost.id)
                        )
                        .map((post) => {
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

                              <p>{post.content}</p>

                              {(post.ForoComments || []).map((comment) => (
                                <div
                                  key={comment.id}
                                  className={styles.myForumPost}
                                >
                                  <strong>
                                    {comment.User?.name || 'Participante'}:
                                  </strong>{' '}
                                  {comment.content}
                                </div>
                              ))}

                              {!ownComment && (
                                <form
                                  onSubmit={(event) =>
                                    handleComment12(event, post.id)
                                  }
                                  className={styles.forumForm}
                                >
                                  <label htmlFor={`comment12-${post.id}`}>
                                    Tu sugerencia
                                  </label>

                                  <textarea
                                    id={`comment12-${post.id}`}
                                    value={commentDrafts[post.id] || ''}
                                    onChange={(event) =>
                                      setCommentDrafts((previous) => ({
                                        ...previous,
                                        [post.id]: event.target.value,
                                      }))
                                    }
                                    minLength={10}
                                    maxLength={1000}
                                    rows={3}
                                    required
                                  />

                                  <button
                                    type="submit"
                                    className={styles.nextButton}
                                    disabled={commentingPostId === post.id}
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

                    {posts.filter(
                      (post) => Number(post.id) !== Number(myPost.id)
                    ).length === 0 && (
                      <p>
                        Cuando un compañero publique su propuesta,
                        podrás comentarla aquí.
                      </p>
                    )}

                    {commentError && (
                      <p className={styles.forumError} role="alert">
                        {commentError}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={() => setSection('evaluation')}
                  >
                    Ir a la evaluación →
                  </button>
                </>
              )}
            </section>
          </div>
        ) : section === 'evaluation' && myPost ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
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
              </div>

              <span className={styles.sectionLabel}>
                EVALUACIÓN · TEMA 1.2
              </span>

              <h2>Comprueba lo que aprendiste</h2>

              <p>
                Cinco preguntas de 2 puntos cada una.
                Necesitas al menos 70 % para aprobar:
                cuatro respuestas correctas.
              </p>

              {evaluationPassed ? (
                <div className={styles.articleNextStep} role="status">
                  <div>
                    <strong>✓ Aprobaste el tema 1.2</strong>

                    <p>
                      Calificación:{' '}
                      {evaluationScore !== null
                        ? `${Number(evaluationScore).toFixed(0)}%`
                        : 'Aprobada'}
                      . Tu resultado quedó guardado.
                    </p>
                  </div>

                  <Link
                    to={`/module/${moduleData.id}/topic/1.3`}
                    className={styles.nextButton}
                  >
                    Tema 1.3 →
                  </Link>
                </div>
              ) : (
                <EvaluationForm
                  evaluationId={evaluationId12}
                  onSuccess={(result) => {
                    setEvaluationPassed(true);
                    setEvaluationScore(result.percentage);
                  }}
                />
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};
const Topic13Intro = ({ moduleData }) => {
  const evaluationId13 = 3;

  const [section, setSection] = useState('index');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState('');

  const [topicVideo, setTopicVideo] = useState(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState('');

  const [myPost, setMyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loadingForum, setLoadingForum] = useState(false);
  const [forumLoaded, setForumLoaded] = useState(false);
  const [forumError, setForumError] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentError, setCommentError] = useState('');

  const [evaluationPassed, setEvaluationPassed] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState(null);
  const [loadingEvaluation, setLoadingEvaluation] = useState(true);
  const [evaluationError, setEvaluationError] = useState('');
  const [evaluationRetry, setEvaluationRetry] = useState(0);

  const topic13Articles = [
    {
      id: 'smart-city-sustainability',
      type: 'CIUDADES INTELIGENTES Y SOSTENIBILIDAD',
      title:
        'Smart Cities for Sustainability: An Analytical Perspective',
      description:
        'Estudio de Monica Mundada y Raghava Rao Mukkamala sobre el uso de datos y tecnología para apoyar el desarrollo sostenible en diferentes ámbitos de una ciudad.',
      url: 'https://research.cbs.dk/en/publications/smart-cities-for-sustainability-an-analytical-perspective',
      linkLabel: 'Consultar publicación',
    },
    {
      id: 'smart-city-data-governance',
      type: 'INFORME OCDE · 2023',
      title:
        'Smart City Data Governance: Challenges and the Way Forward',
      description:
        'Informe sobre la gestión de datos en las ciudades inteligentes, sus desafíos y su importancia para mejorar los servicios públicos y proteger la privacidad.',
      url: 'https://doi.org/10.1787/e57ce301-en',
      linkLabel: 'Consultar informe',
    },
    {
      id: 'people-centered-smart-cities',
      type: 'GUÍA ONU-HÁBITAT',
      title: 'Centering People in Smart Cities',
      description:
        'Guía para gobiernos locales y regionales que aborda la transformación digital desde las necesidades de las personas, la participación y la inclusión digital.',
      url: 'https://unhabitat.org/sites/default/files/2021/11/centering_people_in_smart_cities.pdf',
      linkLabel: 'Leer documento',
    },
    {
      id: 'ims-ld-learning-model',
      type: 'PLATAFORMAS EDUCATIVAS · IMS-LD',
      title:
        'Designing an IMS-LD Model for Disciplinary Information Space of Learning Management System',
      description:
        'Artículo en inglés sobre el diseño de un modelo IMS-LD para organizar contenidos y actividades en una plataforma de gestión del aprendizaje.',
      url: 'https://doi.org/10.1145/3286606.3286817',
      linkLabel: 'Consultar artículo',
    },
    {
      id: 'learning-path-rules',
      type: 'PLATAFORMAS EDUCATIVAS · RUTAS DE APRENDIZAJE',
      title:
        'Development of Converted Deterministic Finite Automaton of Decision Tree Rules of Student Graduation and Adaptive Learning Environment',
      description:
        'Artículo en inglés sobre la representación de reglas y secuencias de aprendizaje mediante autómatas, junto con un modelo de predicción de graduación.',
      url: 'https://doi.org/10.1145/3301551.3301598',
      linkLabel: 'Consultar artículo',
    },
  ];

  const forumGuide13 = [
    {
      number: '01',
      title: 'Analiza la situación',
      description:
        '¿Digitalizar los formularios es suficiente para considerar inteligente al municipio?',
    },
    {
      number: '02',
      title: 'Explica tu respuesta',
      description:
        'Relaciona tu opinión con las demoras que todavía experimenta la ciudadanía.',
    },
    {
      number: '03',
      title: 'Propón una acción',
      description:
        '¿Qué cambio adicional ayudaría a mejorar el servicio?',
    },
  ];

  useEffect(() => {
    let active = true;

    setCheckingAccess(true);
    setHasAccess(false);
    setAccessError('');
    setSection('index');
    setMyPost(null);
    setPosts([]);
    setAnswer('');
    setForumLoaded(false);
    setForumError('');
    setCommentDrafts({});
    setCommentError('');

    const checkAccess = async () => {
      try {
        const progress = await api.get('/evaluations/2/progress');

        if (active) {
          setHasAccess(progress?.passed === true);
        }
      } catch (error) {
        console.error('No se pudo verificar el tema 1.2:', error);

        if (active) {
          setAccessError(
            'No se pudo consultar tu avance. Actualiza la página para volver a intentarlo.'
          );
        }
      } finally {
        if (active) {
          setCheckingAccess(false);
        }
      }
    };

    checkAccess();

    return () => {
      active = false;
    };
  }, [moduleData.id]);

  useEffect(() => {
    let active = true;

    setTopicVideo(null);
    setVideoCompleted(false);
    setVideoError('');
    setLoadingVideo(true);

    if (!hasAccess) {
      setLoadingVideo(false);

      return () => {
        active = false;
      };
    }

    const loadVideo = async () => {
      try {
        const videos = await api.get(
          `/videos/module/${moduleData.id}`
        );

        if (!active) return;

        const found = Array.isArray(videos)
          ? videos.find((item) =>
              String(item.url || '').includes('1u7iqnn2Saw')
            )
          : null;

        if (!found) {
          setVideoError(
            'El video 1.3 aún no está registrado en la base de datos.'
          );
          return;
        }

        setTopicVideo(found);

        const progress = await api.get(
          `/videos/${found.id}/progress`
        );

        if (active) {
          setVideoCompleted(progress?.is_completed === true);
        }
      } catch (error) {
        console.error('No se pudo cargar el video 1.3:', error);

        if (active) {
          setVideoError(
            'No se pudo cargar el video o consultar su avance. Actualiza la página para volver a intentarlo.'
          );
        }
      } finally {
        if (active) {
          setLoadingVideo(false);
        }
      }
    };

    loadVideo();

    return () => {
      active = false;
    };
  }, [moduleData.id, hasAccess]);

  useEffect(() => {
    if (!hasAccess || !videoCompleted) return undefined;

    let active = true;

    setLoadingForum(true);
    setForumLoaded(false);
    setForumError('');

    const loadForum = async () => {
      try {
        const [savedPost, forumPosts] = await Promise.all([
          api.get('/foro/1.3/mine'),
          api.get('/foro/1.3/posts'),
        ]);

        if (!active) return;

        setMyPost(savedPost);
        setPosts(Array.isArray(forumPosts) ? forumPosts : []);
        setForumLoaded(true);
      } catch (error) {
        console.error('No se pudo cargar el foro 1.3:', error);

        if (active) {
          setForumError(
            error.message ||
              'No se pudo cargar el foro. Actualiza la página para volver a intentarlo.'
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
  }, [hasAccess, videoCompleted, moduleData.id]);

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

    const loadEvaluationProgress = async () => {
      try {
        const progress = await api.get(
          `/evaluations/${evaluationId13}/progress`
        );

        if (!active) return;

        setEvaluationPassed(progress?.passed === true);
        setEvaluationScore(progress?.percentage ?? null);
      } catch (error) {
        console.error(
          'No se pudo consultar la evaluación 1.3:',
          error
        );

        if (active) {
          setEvaluationError(
            error.message ||
              'No se pudo consultar tu resultado de la evaluación.'
          );
        }
      } finally {
        if (active) {
          setLoadingEvaluation(false);
        }
      }
    };

    loadEvaluationProgress();

    return () => {
      active = false;
    };
  }, [
    hasAccess,
    moduleData.id,
    evaluationId13,
    evaluationRetry,
  ]);

  const handlePublish13 = async (event) => {
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
        '/foro/1.3/posts',
        { content }
      );

      setMyPost(published);
      setAnswer('');

      try {
        const forumPosts = await api.get('/foro/1.3/posts');
        setPosts(Array.isArray(forumPosts) ? forumPosts : []);
      } catch (error) {
        setForumError(
          'Tu respuesta se publicó, pero no se pudo actualizar la lista. Recarga la página.'
        );
      }
    } catch (error) {
      setForumError(
        error.message || 'No se pudo publicar tu respuesta.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleComment13 = async (event, postId) => {
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
        `/foro/1.3/posts/${postId}/comments`,
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
        const forumPosts = await api.get('/foro/1.3/posts');
        setPosts(Array.isArray(forumPosts) ? forumPosts : []);
      } catch (error) {
        setCommentError(
          'Tu comentario se publicó, pero no se pudo actualizar la lista. Recarga la página.'
        );
      }
    } catch (error) {
      setCommentError(
        error.message || 'No se pudo publicar tu comentario.'
      );
    } finally {
      setCommentingPostId(null);
    }
  };

  const handleEvaluationSuccess13 = (result) => {
    if (result?.passed !== true) return;

    setEvaluationPassed(true);
    setEvaluationScore(result.percentage);
    setEvaluationError('');
  };

  if (checkingAccess) {
    return (
      <main className={styles.message}>
        Consultando tu avance...
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className={styles.message}>
        <p role={accessError ? 'alert' : undefined}>
          {accessError ||
            'Aprueba el tema 1.2 para acceder al tema 1.3.'}
        </p>

        <Link to={`/course/${moduleData.courseId}`}>
          Volver al curso
        </Link>
      </main>
    );
  }

  const sections = [
    {
      id: 'about',
      label: 'Introducción',
      description: 'Conoce el objetivo y los aprendizajes del tema.',
      enabled: true,
    },
    {
      id: 'video',
      label: 'Video',
      description: videoCompleted
        ? 'Completaste la clase del tema 1.3.'
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
      description: myPost
        ? 'Tu respuesta está publicada.'
        : 'Reflexiona: ¿digitalizar es suficiente?',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Aprobaste la evaluación del tema 1.3.'
        : myPost
          ? 'Responde cinco preguntas sobre lo aprendido.'
          : 'Publica tu respuesta en el foro para continuar.',
      enabled: videoCompleted && Boolean(myPost),
    },
  ];

  const otherPosts = posts.filter(
    (post) => Number(post.id) !== Number(myPost?.id)
  );

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
                    MÓDULO 1 · TEMA 1.3
                  </span>

                  <h1>
                    Evolución de las Ciudades Tradicionales a{' '}
                    <span>Ciudades Inteligentes</span>
                  </h1>

                  <p>
                    Conoce cómo la planificación, la tecnología,
                    los datos y la participación ciudadana ayudan
                    a transformar los servicios de una ciudad.
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
                        : item.id === 'forum' && myPost
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
                La transformación de una ciudad tradicional en una
                ciudad inteligente es un proceso gradual. Parte de
                reconocer las necesidades de sus habitantes y mejorar
                la gestión municipal mediante planificación,
                información, tecnología y participación ciudadana.
              </p>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  OBJETIVO
                </span>

                <p>
                  Comprender cómo evolucionan las ciudades
                  tradicionales hacia ciudades inteligentes y
                  reconocer los cambios que permiten mejorar sus
                  servicios y la calidad de vida de la población.
                </p>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ¿QUÉ APRENDERÁS?
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    A identificar diferencias entre la gestión de
                    una ciudad tradicional y una ciudad inteligente.
                  </li>
                  <li>
                    A reconocer el papel de la planificación, los
                    datos y la tecnología en la transformación de
                    los servicios municipales.
                  </li>
                  <li>
                    A explicar por qué la participación ciudadana
                    y la inclusión digital son necesarias en
                    este proceso.
                  </li>
                  <li>
                    A relacionar esta transformación con las
                    necesidades de tu municipio.
                  </li>
                </ul>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ASÍ AVANZARÁS EN EL TEMA
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    <strong>Video:</strong> observa la clase completa.
                    Adelantarlo no contará como progreso de esa parte.
                  </li>
                  <li>
                    <strong>Información:</strong> consulta las
                    publicaciones y las lecturas de apoyo.
                    Son recursos opcionales.
                  </li>
                  <li>
                    <strong>Foro:</strong> explica si digitalizar
                    los trámites es suficiente y propón una
                    acción adicional para mejorar el servicio.
                    Después puedes comentar la respuesta de un compañero.
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

                  <h2>
                    Evolución de las Ciudades Tradicionales
                    a Ciudades Inteligentes
                  </h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>◷ Duración: 6 minutos y 14 segundos</span>

                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              </div>

              {loadingVideo ? (
                <p className={styles.pendingNote}>
                  Cargando el video y tu avance...
                </p>
              ) : (
                <>
                  {videoError && (
                    <p
                      className={styles.pendingNote}
                      role="alert"
                    >
                      {videoError}
                    </p>
                  )}

                  {topicVideo && (
                    <div className={styles.playerFrame}>
                      <VideoPlayer
                        ytVideoId="1u7iqnn2Saw"
                        dbVideoId={topicVideo.id}
                        videoDuration={topicVideo.duration || 374}
                        onProgress={(_, progress) => {
                          if (progress?.is_completed === true) {
                            setVideoCompleted(true);
                          }
                        }}
                        onComplete={() => setVideoCompleted(true)}
                      />
                    </div>
                  )}

                  {topicVideo &&
                    (videoCompleted ? (
                      <button
                        type="button"
                        className={styles.nextButton}
                        onClick={() => setSection('article')}
                      >
                        Ir a Información →
                      </button>
                    ) : (
                      <p className={styles.pendingNote}>
                        Mira el video completo. Adelantarlo no
                        registrará esa parte como vista.
                      </p>
                    ))}
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
                  Consulta estas publicaciones sobre ciudades
                  inteligentes, sostenibilidad y gestión de datos,
                  junto con lecturas sobre plataformas educativas.
                  Son recursos opcionales que puedes revisar
                  ahora o cuando lo necesites.
                </p>
              </div>

              <div className={styles.articleGrid}>
                {topic13Articles.map((article) => (
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
                    FUENTE INSTITUCIONAL
                  </span>

                  <h3>Conoce las guías de ONU-Hábitat</h3>

                  <p>
                    Explora sus recursos para desarrollar ciudades
                    inteligentes centradas en las personas.
                  </p>
                </div>

                <a
                  href="https://unhabitat.org/programme/people-centered-smart-cities/people-centered-smart-cities-playbooks"
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
                    Las lecturas son opcionales. Comparte tu opinión
                    sobre la digitalización de los servicios municipales.
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
                    ACTIVIDAD PARTICIPATIVA · TEMA 1.3
                  </span>

                  <h2>¿Digitalizar es suficiente?</h2>

                  <p>
                    Analiza una situación municipal y propón
                    una acción para mejorar el servicio.
                  </p>
                </div>
              </div>

              <div className={styles.forumPrompt}>
                <p>
                  Un municipio reemplaza los trámites en papel
                  por formularios en línea. Sin embargo, las personas
                  siguen esperando mucho tiempo para recibir
                  una respuesta.
                </p>

                <h3>
                  ¿Dirías que este municipio ya es una ciudad inteligente?
                </h3>

                <p>
                  Explica tu respuesta y propón una acción adicional
                  que ayude a mejorar el servicio. Puedes considerar
                  cómo se organiza la información, cómo se toman
                  las decisiones y cómo se conoce la experiencia
                  de la ciudadanía.
                </p>
              </div>

              <div className={styles.forumGuide}>
                {forumGuide13.map((item) => (
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

              {loadingForum ? (
                <p className={styles.pendingNote}>
                  Cargando las respuestas del foro...
                </p>
              ) : (
                <>
                  {forumError && (
                    <p className={styles.forumError} role="alert">
                      {forumError}
                    </p>
                  )}

                  {forumLoaded &&
                    (myPost ? (
                      <div className={styles.myForumPost}>
                        <div className={styles.forumPostHeading}>
                          <span aria-hidden="true">✓</span>
                          <strong>Tu respuesta está publicada</strong>
                        </div>

                        <p>{myPost.content}</p>
                      </div>
                    ) : (
                      <form
                        onSubmit={handlePublish13}
                        className={styles.forumForm}
                      >
                        <div className={styles.forumFormHeading}>
                          <div>
                            <span className={styles.forumEyebrow}>
                              AHORA TE TOCA PARTICIPAR
                            </span>

                            <h3>Comparte tu reflexión</h3>
                          </div>

                          <span className={styles.forumCharacterCount}>
                            {answer.trim().length}/3000
                          </span>
                        </div>

                        <label htmlFor="forumAnswer13">
                          Tu respuesta
                        </label>

                        <textarea
                          id="forumAnswer13"
                          value={answer}
                          onChange={(event) =>
                            setAnswer(event.target.value)
                          }
                          placeholder="Explica tu opinión y propone una acción adicional para mejorar el servicio."
                          minLength={30}
                          maxLength={3000}
                          rows={7}
                          required
                        />

                        <small>
                          Escribe entre 30 y 3000 caracteres.
                          Incluye tu explicación y una acción concreta.
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
                    ))}

                  {myPost && (
                    <>
                      <div className={styles.otherPosts}>
                        <div className={styles.otherPostsHeading}>
                          <h3>Reflexiones de tus compañeros</h3>
                        </div>

                        <p>
                          Lee una respuesta y comenta con una
                          sugerencia concreta para mejorar el servicio.
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

                                <p>{post.content}</p>

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

                                {!ownComment && (
                                  <form
                                    onSubmit={(event) =>
                                      handleComment13(event, post.id)
                                    }
                                    className={styles.forumForm}
                                  >
                                    <label
                                      htmlFor={`comment13-${post.id}`}
                                    >
                                      Tu sugerencia
                                    </label>

                                    <textarea
                                      id={`comment13-${post.id}`}
                                      value={commentDrafts[post.id] || ''}
                                      onChange={(event) =>
                                        setCommentDrafts((previous) => ({
                                          ...previous,
                                          [post.id]: event.target.value,
                                        }))
                                      }
                                      minLength={10}
                                      maxLength={1000}
                                      rows={3}
                                      required
                                    />

                                    <small>
                                      Escribe entre 10 y 1000 caracteres.
                                    </small>

                                    <button
                                      type="submit"
                                      className={styles.nextButton}
                                      disabled={commentingPostId !== null}
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

                        {otherPosts.length === 0 && (
                          <p>
                            Cuando un compañero publique su
                            respuesta, podrás comentarla aquí.
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

                      <div className={styles.articleNextStep}>
                        <div>
                          <strong>✓ Completaste tu respuesta al foro</strong>

                          <p>
                            {evaluationPassed
                              ? 'También aprobaste la evaluación. Puedes consultar tu resultado.'
                              : 'Tu respuesta quedó guardada. Ahora puedes realizar la evaluación del tema 1.3.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          className={styles.nextButton}
                          onClick={() => setSection('evaluation')}
                        >
                          {evaluationPassed
                            ? 'Ver resultado →'
                            : 'Ir a la evaluación →'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          </div>
        ) : section === 'evaluation' &&
          videoCompleted &&
          myPost ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <span className={styles.sectionLabel}>
                EVALUACIÓN · TEMA 1.3
              </span>

              <h2>Comprueba lo que aprendiste</h2>

              <p>
                Responde las cinco preguntas sobre la evolución
                de las ciudades tradicionales a ciudades inteligentes.
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
                Si no alcanzas el mínimo, puedes revisar
                tus respuestas y volver a intentarlo.
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
                      setEvaluationRetry((previous) => previous + 1);
                    }}
                  >
                    Volver a intentar →
                  </button>
                </div>
              ) : evaluationPassed ? (
                <div className={styles.articleNextStep} role="status">
                  <div>
                    <strong>✓ Aprobaste el tema 1.3</strong>

                    <p>
                      Calificación:{' '}
                      {evaluationScore !== null
                        ? `${Number(evaluationScore).toFixed(0)}%`
                        : 'Aprobada'}
                      . Tu resultado quedó guardado.
                    </p>
                  </div>

                  <Link
                    to={`/module/${moduleData.id}/topic/1.4`}
                    className={styles.nextButton}
                  >
                    Tema 1.4 →
                  </Link>
                </div>
              ) : (
                <EvaluationForm
                  evaluationId={evaluationId13}
                  onSuccess={handleEvaluationSuccess13}
                />
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};
const Topic14Intro = ({ moduleData }) => {
  const evaluationId14 = 4;

  const [section, setSection] = useState('index');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState('');

  const [topicVideo, setTopicVideo] = useState(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState('');

  const [myPost, setMyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loadingForum, setLoadingForum] = useState(false);
  const [forumLoaded, setForumLoaded] = useState(false);
  const [forumError, setForumError] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentError, setCommentError] = useState('');

  const [evaluationPassed, setEvaluationPassed] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState(null);
  const [loadingEvaluation, setLoadingEvaluation] = useState(true);
  const [evaluationError, setEvaluationError] = useState('');
  const [evaluationRetry, setEvaluationRetry] = useState(0);

  const topic14Articles = [
    {
      id: 'smart-cities',
      type: 'CIUDADES INTELIGENTES Y SOSTENIBILIDAD',
      title:
        'Smart Cities for Sustainability: An Analytical Perspective',
      description:
        'Estudio sobre el uso del análisis de datos en las ciudades inteligentes y su relación con el desarrollo sostenible.',
      url: 'https://research.cbs.dk/en/publications/smart-cities-for-sustainability-an-analytical-perspective',
      linkLabel: 'Consultar publicación',
    },
    {
      id: 'data-governance',
      type: 'INFORME OCDE · 2023',
      title:
        'Smart City Data Governance: Challenges and the Way Forward',
      description:
        'Informe sobre la organización y gestión de los datos urbanos para mejorar los servicios públicos, cuidar la calidad de la información y proteger la privacidad.',
      url: 'https://doi.org/10.1787/e57ce301-en',
      linkLabel: 'Consultar informe',
    },
    {
      id: 'people-centered',
      type: 'GUÍA ONU-HÁBITAT',
      title: 'Centering People in Smart Cities',
      description:
        'Guía para gobiernos locales y regionales sobre ciudades inteligentes centradas en las personas, la participación y la inclusión digital.',
      url: 'https://unhabitat.org/sites/default/files/2021/11/centering_people_in_smart_cities.pdf',
      linkLabel: 'Leer documento',
    },
    {
      id: 'platform-quality',
      type: 'PLATAFORMAS EDUCATIVAS · CALIDAD DEL SOFTWARE',
      title:
        'Comprehensive Analysis of the Quality Dimensions of MOOC Software: A Systematic Literature Review',
      description:
        'Artículo sobre usabilidad, funcionalidad, rendimiento, integración, seguridad y soporte en plataformas de cursos en línea.',
      url: 'https://doi.org/10.62527/joiv.10.2.3566',
      linkLabel: 'Consultar artículo',
    },
    {
      id: 'digital-innovation',
      type: 'PLATAFORMAS EDUCATIVAS · INNOVACIÓN DIGITAL',
      title:
        'Digital innovation in higher education: comparing approaches in developed and developing countries',
      description:
        'Artículo sobre la transformación digital de instituciones educativas y los desafíos relacionados con el acceso, la infraestructura y la organización.',
      url: 'https://doi.org/10.3389/feduc.2025.1723087',
      linkLabel: 'Consultar artículo',
    },
  ];

  const forumGuide14 = [
    {
      number: '01',
      title: 'Elige una sección',
      description:
        'Escoge áreas verdes y ambiente, transporte, zonas de riesgo o proyectos urbanos. Explica por qué la priorizarías.',
    },
    {
      number: '02',
      title: 'Presenta la información',
      description:
        'Indica qué mostrarías en mapas o gráficos y cómo mantendrías la información clara y actualizada.',
    },
    {
      number: '03',
      title: 'Explica su utilidad',
      description:
        'Describe cómo la usaría la ciudadanía y qué decisión ayudaría a tomar al municipio.',
    },
  ];

  useEffect(() => {
    let active = true;

    setCheckingAccess(true);
    setHasAccess(false);
    setAccessError('');
    setSection('index');
    setMyPost(null);
    setPosts([]);
    setAnswer('');
    setForumLoaded(false);
    setForumError('');
    setCommentDrafts({});
    setCommentError('');

    const checkAccess = async () => {
      try {
        const progress = await api.get('/evaluations/3/progress');

        if (active) {
          setHasAccess(progress?.passed === true);
        }
      } catch (error) {
        console.error('No se pudo verificar el tema 1.3:', error);

        if (active) {
          setAccessError(
            'No se pudo consultar tu avance. Actualiza la página para volver a intentarlo.'
          );
        }
      } finally {
        if (active) {
          setCheckingAccess(false);
        }
      }
    };

    checkAccess();

    return () => {
      active = false;
    };
  }, [moduleData.id]);

  useEffect(() => {
    let active = true;

    setTopicVideo(null);
    setVideoCompleted(false);
    setVideoError('');
    setLoadingVideo(true);

    if (!hasAccess) {
      setLoadingVideo(false);

      return () => {
        active = false;
      };
    }

    const loadVideo = async () => {
      try {
        const videos = await api.get(
          `/videos/module/${moduleData.id}`
        );

        if (!active) return;

        const found = Array.isArray(videos)
          ? videos.find((item) =>
              String(item.url || '').includes('9oOPvXQliTo')
            )
          : null;

        if (!found) {
          setVideoError(
            'El video 1.4 aún no está registrado en la base de datos.'
          );
          return;
        }

        setTopicVideo(found);

        const progress = await api.get(
          `/videos/${found.id}/progress`
        );

        if (active) {
          setVideoCompleted(progress?.is_completed === true);
        }
      } catch (error) {
        console.error('No se pudo cargar el video 1.4:', error);

        if (active) {
          setVideoError(
            'No se pudo cargar el video o consultar su avance. Actualiza la página para volver a intentarlo.'
          );
        }
      } finally {
        if (active) {
          setLoadingVideo(false);
        }
      }
    };

    loadVideo();

    return () => {
      active = false;
    };
  }, [moduleData.id, hasAccess]);

  useEffect(() => {
    if (!hasAccess || !videoCompleted) return undefined;

    let active = true;

    setLoadingForum(true);
    setForumLoaded(false);
    setForumError('');

    const loadForum = async () => {
      try {
        const [savedPost, forumPosts] = await Promise.all([
          api.get('/foro/1.4/mine'),
          api.get('/foro/1.4/posts'),
        ]);

        if (!active) return;

        setMyPost(savedPost);
        setPosts(Array.isArray(forumPosts) ? forumPosts : []);
        setForumLoaded(true);
      } catch (error) {
        console.error('No se pudo cargar el foro 1.4:', error);

        if (active) {
          setForumError(
            error.message ||
              'No se pudo cargar el foro. Actualiza la página para volver a intentarlo.'
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
  }, [hasAccess, videoCompleted, moduleData.id]);

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

    const loadEvaluationProgress = async () => {
      try {
        const progress = await api.get(
          `/evaluations/${evaluationId14}/progress`
        );

        if (!active) return;

        setEvaluationPassed(progress?.passed === true);
        setEvaluationScore(progress?.percentage ?? null);
      } catch (error) {
        console.error(
          'No se pudo consultar la evaluación 1.4:',
          error
        );

        if (active) {
          setEvaluationError(
            error.message ||
              'No se pudo consultar tu resultado de la evaluación.'
          );
        }
      } finally {
        if (active) {
          setLoadingEvaluation(false);
        }
      }
    };

    loadEvaluationProgress();

    return () => {
      active = false;
    };
  }, [
    hasAccess,
    moduleData.id,
    evaluationId14,
    evaluationRetry,
  ]);

  const handlePublish14 = async (event) => {
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
        '/foro/1.4/posts',
        { content }
      );

      setMyPost(published);
      setAnswer('');

      try {
        const forumPosts = await api.get('/foro/1.4/posts');
        setPosts(Array.isArray(forumPosts) ? forumPosts : []);
      } catch (error) {
        setForumError(
          'Tu respuesta se publicó, pero no se pudo actualizar la lista. Recarga la página.'
        );
      }
    } catch (error) {
      setForumError(
        error.message || 'No se pudo publicar tu respuesta.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleComment14 = async (event, postId) => {
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
        `/foro/1.4/posts/${postId}/comments`,
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
        const forumPosts = await api.get('/foro/1.4/posts');
        setPosts(Array.isArray(forumPosts) ? forumPosts : []);
      } catch (error) {
        setCommentError(
          'Tu comentario se publicó, pero no se pudo actualizar la lista. Recarga la página.'
        );
      }
    } catch (error) {
      setCommentError(
        error.message || 'No se pudo publicar tu comentario.'
      );
    } finally {
      setCommentingPostId(null);
    }
  };

  const verifyVideoCompletion = async () => {
    if (!topicVideo) return;

    try {
      const progress = await api.get(
        `/videos/${topicVideo.id}/progress`
      );

      if (progress?.is_completed === true) {
        setVideoCompleted(true);
        setVideoError('');
      }
    } catch (error) {
      console.error(
        'No se pudo consultar la finalización del video 1.4:',
        error
      );

      setVideoError(
        'No se pudo confirmar tu avance. Actualiza la página para consultarlo nuevamente.'
      );
    }
  };

  const handleEvaluationSuccess14 = (result) => {
    if (result?.passed !== true) return;

    setEvaluationPassed(true);
    setEvaluationScore(result.percentage);
    setEvaluationError('');
  };

  if (checkingAccess) {
    return (
      <main className={styles.message}>
        Consultando tu avance...
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className={styles.message}>
        <p role={accessError ? 'alert' : undefined}>
          {accessError ||
            'Aprueba el tema 1.3 para acceder al tema 1.4.'}
        </p>

        <Link to={`/course/${moduleData.courseId}`}>
          Volver al curso
        </Link>
      </main>
    );
  }

  const sections = [
    {
      id: 'about',
      label: 'Introducción',
      description: 'Conoce el objetivo y los aprendizajes del tema.',
      enabled: true,
    },
    {
      id: 'video',
      label: 'Video',
      description: videoCompleted
        ? 'Completaste la clase del tema 1.4.'
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
      description: myPost
        ? 'Tu respuesta está publicada.'
        : '¿Qué información mostrarías de tu ciudad?',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Aprobaste la evaluación del tema 1.4.'
        : myPost
          ? 'Responde cinco preguntas sobre lo aprendido.'
          : 'Publica tu respuesta en el foro para continuar.',
      enabled: videoCompleted && Boolean(myPost),
    },
  ];

  const otherPosts = posts.filter(
    (post) => Number(post.id) !== Number(myPost?.id)
  );

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
                    MÓDULO 1 · TEMA 1.4
                  </span>

                  <h1>
                    Plataforma web de{' '}
                    <span>urbanismo inteligente</span>
                  </h1>

                  <p>
                    Conoce cómo una plataforma web puede organizar
                    información territorial y apoyar la planificación
                    y la gestión de los servicios municipales.
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
                        : item.id === 'forum' && myPost
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
                La planificación urbana requiere información
                organizada sobre el territorio, sus servicios y las
                necesidades de la población. Una plataforma web de
                urbanismo inteligente puede facilitar la consulta
                de esa información y apoyar el trabajo de los
                gobiernos municipales.
              </p>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  OBJETIVO
                </span>

                <p>
                  Comprender la función de una plataforma web de
                  urbanismo inteligente y reconocer cómo puede
                  apoyar la organización de información, la
                  planificación territorial y la mejora de los
                  servicios municipales.
                </p>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ¿QUÉ APRENDERÁS?
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    A reconocer la utilidad de una plataforma web
                    para la gestión urbana.
                  </li>
                  <li>
                    A identificar la importancia de organizar y
                    consultar información territorial.
                  </li>
                  <li>
                    A relacionar las herramientas digitales con
                    la planificación y las decisiones municipales.
                  </li>
                  <li>
                    A considerar las necesidades de la ciudadanía
                    al utilizar estas herramientas.
                  </li>
                </ul>
              </div>

              <div className={styles.introBlock}>
                <span className={styles.introBlockLabel}>
                  ASÍ AVANZARÁS EN EL TEMA
                </span>

                <ul className={styles.learningPoints}>
                  <li>
                    <strong>Video:</strong> observa la clase completa.
                    Adelantarlo no contará como progreso de esa parte.
                  </li>
                  <li>
                    <strong>Información:</strong> consulta las
                    publicaciones y las lecturas de apoyo.
                    Son recursos opcionales.
                  </li>
                  <li>
                    <strong>Foro:</strong> elige una sección para una
                    plataforma municipal y explica qué información
                    mostrarías y para qué serviría.
                    Después puedes comentar una propuesta.
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

                  <h2>Plataforma web de urbanismo inteligente</h2>
                </div>
              </div>

              <div className={styles.videoMeta}>
                <span>◷ Duración: 7 minutos y 9 segundos</span>

                <span>
                  {videoCompleted
                    ? '✓ Video completado'
                    : '○ Pendiente de completar'}
                </span>
              </div>

              {loadingVideo ? (
                <p className={styles.pendingNote}>
                  Cargando el video y tu avance...
                </p>
              ) : (
                <>
                  {videoError && (
                    <p className={styles.pendingNote} role="alert">
                      {videoError}
                    </p>
                  )}

                  {topicVideo && (
                    <div className={styles.playerFrame}>
                      <VideoPlayer
                        ytVideoId="9oOPvXQliTo"
                        dbVideoId={topicVideo.id}
                        videoDuration={topicVideo.duration || 429}
                        onProgress={(_, progress) => {
                          if (progress?.is_completed === true) {
                            setVideoCompleted(true);
                            setVideoError('');
                          }
                        }}
                        onComplete={verifyVideoCompletion}
                      />
                    </div>
                  )}

                  {topicVideo &&
                    (videoCompleted ? (
                      <button
                        type="button"
                        className={styles.nextButton}
                        onClick={() => setSection('article')}
                      >
                        Ir a Información →
                      </button>
                    ) : (
                      <p className={styles.pendingNote}>
                        Mira el video completo. Adelantarlo no
                        registrará esa parte como vista.
                      </p>
                    ))}
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
                  Consulta estas publicaciones sobre ciudades
                  inteligentes, sostenibilidad y gestión de datos,
                  junto con lecturas sobre plataformas educativas.
                  Son recursos opcionales que puedes revisar
                  ahora o cuando lo necesites.
                </p>
              </div>

              <div className={styles.articleGrid}>
                {topic14Articles.map((article) => (
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
                    FUENTE INSTITUCIONAL
                  </span>

                  <h3>Conoce las guías de ONU-Hábitat</h3>

                  <p>
                    Explora sus recursos para desarrollar ciudades
                    inteligentes centradas en las personas.
                  </p>
                </div>

                <a
                  href="https://unhabitat.org/programme/people-centered-smart-cities/people-centered-smart-cities-playbooks"
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
                    Las lecturas son opcionales. Comparte tu opinión
                    sobre la información que priorizarías en tu municipio.
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
                    ACTIVIDAD PARTICIPATIVA · TEMA 1.4
                  </span>

                  <h2>¿Qué información mostrarías de tu ciudad?</h2>

                  <p>
                    Elige una prioridad y explica cómo una plataforma
                    puede ayudar a conocer mejor el territorio.
                  </p>
                </div>
              </div>

              <div className={styles.forumPrompt}>
                <p>
                  Tu municipio quiere crear una plataforma web para que la
                  ciudadanía conozca mejor su territorio y participe en las
                  decisiones. Solo puede comenzar con <strong>una</strong> de
                  estas secciones: áreas verdes y ambiente, transporte,
                  zonas de riesgo o proyectos urbanos.
                </p>

                <h3>¿Cuál elegirías y por qué?</h3>

                <p>
                  Explica qué información mostrarías en mapas o gráficos,
                  cómo podrían utilizarla los ciudadanos y qué decisión
                  ayudaría a tomar al municipio. Recuerda que la información
                  debe ser fácil de comprender y estar actualizada.
                </p>
              </div>

              <div className={styles.forumGuide}>
                {forumGuide14.map((item) => (
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

              {loadingForum ? (
                <p className={styles.pendingNote}>
                  Cargando las respuestas del foro...
                </p>
              ) : (
                <>
                  {forumError && (
                    <p className={styles.forumError} role="alert">
                      {forumError}
                    </p>
                  )}

                  {forumLoaded &&
                    (myPost ? (
                      <div className={styles.myForumPost}>
                        <div className={styles.forumPostHeading}>
                          <span aria-hidden="true">✓</span>
                          <strong>Tu respuesta está publicada</strong>
                        </div>

                        <p>{myPost.content}</p>
                      </div>
                    ) : (
                      <form
                        onSubmit={handlePublish14}
                        className={styles.forumForm}
                      >
                        <div className={styles.forumFormHeading}>
                          <div>
                            <span className={styles.forumEyebrow}>
                              AHORA TE TOCA PARTICIPAR
                            </span>

                            <h3>Comparte tu reflexión</h3>
                          </div>

                          <span className={styles.forumCharacterCount}>
                            {answer.trim().length}/3000
                          </span>
                        </div>

                        <label htmlFor="forumAnswer14">
                          Tu respuesta
                        </label>

                        <textarea
                          id="forumAnswer14"
                          value={answer}
                          onChange={(event) =>
                            setAnswer(event.target.value)
                          }
                          placeholder="Elige una sección, explica qué información mostrarías y cómo ayudaría a la ciudadanía y al municipio."
                          minLength={30}
                          maxLength={3000}
                          rows={7}
                          required
                        />

                        <small>
                          Escribe entre 30 y 3000 caracteres.
                          Incluye tu elección, la información que
                          mostrarías y su utilidad.
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
                    ))}

                  {myPost && (
                    <>
                      <div className={styles.otherPosts}>
                        <div className={styles.otherPostsHeading}>
                          <h3>Propuestas de tus compañeros</h3>
                        </div>

                        <p>
                          Puedes comentar una propuesta con una sugerencia
                          para mejorar la información presentada o su utilidad.
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

                                <p>{post.content}</p>

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

                                {!ownComment && (
                                  <form
                                    onSubmit={(event) =>
                                      handleComment14(event, post.id)
                                    }
                                    className={styles.forumForm}
                                  >
                                    <label
                                      htmlFor={`comment14-${post.id}`}
                                    >
                                      Tu sugerencia
                                    </label>

                                    <textarea
                                      id={`comment14-${post.id}`}
                                      value={commentDrafts[post.id] || ''}
                                      onChange={(event) =>
                                        setCommentDrafts((previous) => ({
                                          ...previous,
                                          [post.id]: event.target.value,
                                        }))
                                      }
                                      minLength={10}
                                      maxLength={1000}
                                      rows={3}
                                      required
                                    />

                                    <small>
                                      Escribe entre 10 y 1000 caracteres.
                                    </small>

                                    <button
                                      type="submit"
                                      className={styles.nextButton}
                                      disabled={commentingPostId !== null}
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

                        {otherPosts.length === 0 && (
                          <p>
                            Cuando un compañero publique su
                            respuesta, podrás comentarla aquí.
                          </p>
                        )}

                        {commentError && (
                          <p className={styles.forumError} role="alert">
                            {commentError}
                          </p>
                        )}
                      </div>

                      <div className={styles.articleNextStep}>
                        <div>
                          <strong>✓ Completaste tu respuesta al foro</strong>

                          <p>
                            {evaluationPassed
                              ? 'También aprobaste la evaluación. Puedes consultar tu resultado.'
                              : 'Tu respuesta quedó guardada. Ahora puedes realizar la evaluación del tema 1.4.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          className={styles.nextButton}
                          onClick={() => setSection('evaluation')}
                        >
                          {evaluationPassed
                            ? 'Ver resultado →'
                            : 'Ir a la evaluación →'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          </div>
        ) : section === 'evaluation' &&
          videoCompleted &&
          myPost ? (
          <div className={styles.lessonContent}>
            <section className={styles.lessonCard}>
              <div className={styles.introNavigation}>
                {navigation}
              </div>

              <span className={styles.sectionLabel}>
                EVALUACIÓN · TEMA 1.4
              </span>

              <h2>Comprueba lo que aprendiste</h2>

              <p>
                Responde las cinco preguntas sobre la plataforma
                web de urbanismo inteligente.
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
                Si no alcanzas el mínimo, puedes revisar
                tus respuestas y volver a intentarlo.
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
                      setEvaluationRetry((previous) => previous + 1);
                    }}
                  >
                    Volver a intentar →
                  </button>
                </div>
              ) : evaluationPassed ? (
                <div className={styles.articleNextStep} role="status">
                  <div>
                    <strong>✓ Aprobaste el tema 1.4</strong>

                    <p>
                      Calificación:{' '}
                      {evaluationScore !== null
                        ? `${Number(evaluationScore).toFixed(0)}%`
                        : 'Aprobada'}
                      . Tu resultado quedó guardado.
                    </p>
                  </div>

                  <Link
                    to={`/course/${moduleData.courseId}`}
                    className={styles.nextButton}
                  >
                    Volver al curso →
                  </Link>
                </div>
              ) : (
                <EvaluationForm
                  evaluationId={evaluationId14}
                  onSuccess={handleEvaluationSuccess14}
                />
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};
const TopicDetail = () => {
  const { moduleId, topicNumber } = useParams();
  const moduleData = getModuleById(moduleId);
  const video = moduleData?.videos?.[0];
  const evaluationId = moduleData?.evaluation?.id;

  const [section, setSection] = useState('index');
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [myPost, setMyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');
  const [forumError, setForumError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [evaluationPassed, setEvaluationPassed] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState(null);

  useEffect(() => {
    let active = true;

    setSection('index');
    setVideoCompleted(false);
    setMyPost(null);
    setPosts([]);
    setAnswer('');
    setForumError('');
    setEvaluationPassed(false);
    setEvaluationScore(null);
    setLoadingProgress(true);

    if (
      !video?.id ||
      String(moduleId) !== '1' ||
      topicNumber !== '1.1'
    ) {
      setLoadingProgress(false);

      return () => {
        active = false;
      };
    }

    const loadProgress = async () => {
      try {
        const progress = await api.get(
          `/videos/${video.id}/progress`
        );

        if (active) {
          setVideoCompleted(progress?.is_completed === true);
        }
      } catch (error) {
        console.error(
          'No se pudo cargar el progreso del video:',
          error
        );
      } finally {
        if (active) {
          setLoadingProgress(false);
        }
      }
    };

    loadProgress();

    return () => {
      active = false;
    };
  }, [moduleId, topicNumber, video?.id]);

  useEffect(() => {
    if (
      !videoCompleted ||
      String(moduleId) !== '1' ||
      topicNumber !== '1.1'
    ) {
      return;
    }

    let active = true;

    const loadForum = async () => {
      try {
        const [savedPost, forumPosts] = await Promise.all([
          api.get('/foro/1.1/mine'),
          api.get('/foro/1.1/posts'),
        ]);

        if (!active) return;

        setMyPost(savedPost);
        setPosts(Array.isArray(forumPosts) ? forumPosts : []);
      } catch (error) {
        console.error('No se pudo cargar el foro:', error);

        if (active) {
          setForumError(
            'No se pudieron cargar las respuestas del foro.'
          );
        }
      }
    };

    loadForum();

    return () => {
      active = false;
    };
  }, [videoCompleted, moduleId, topicNumber]);

  useEffect(() => {
    if (
      !evaluationId ||
      String(moduleId) !== '1' ||
      topicNumber !== '1.1'
    ) {
      return;
    }

    let active = true;

    const loadEvaluationProgress = async () => {
      try {
        const progress = await api.get(
          `/evaluations/${evaluationId}/progress`
        );

        if (!active) return;

        setEvaluationPassed(progress.passed === true);
        setEvaluationScore(progress.percentage);
      } catch (error) {
        console.error(
          'No se pudo consultar la evaluación:',
          error
        );
      }
    };

    loadEvaluationProgress();

    return () => {
      active = false;
    };
  }, [evaluationId, moduleId, topicNumber]);

  const handlePublish = async (event) => {
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
      const publishedPost = await api.post(
        '/foro/1.1/posts',
        { content }
      );

      setMyPost(publishedPost);
      setAnswer('');

      const forumPosts = await api.get('/foro/1.1/posts');
      setPosts(Array.isArray(forumPosts) ? forumPosts : []);
    } catch (error) {
      setForumError(
        error.message || 'No se pudo publicar tu respuesta.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleEvaluationSuccess = (result) => {
    setEvaluationPassed(true);
    setEvaluationScore(result.percentage);
  };

    if (!moduleData) {
    return (
      <main className={styles.message}>
        Módulo no encontrado.
      </main>
    );
  }

  if (
    String(moduleId) === '1' &&
    topicNumber === '1.2'
  ) {
    return (
      <Topic12Intro moduleData={moduleData} />
    );
  }

  if (
    String(moduleId) === '1' &&
    topicNumber === '1.3'
  ) {
    return (
      <Topic13Intro moduleData={moduleData} />
    );
  }

  if (
    String(moduleId) === '1' &&
    topicNumber === '1.4'
  ) {
    return (
      <Topic14Intro moduleData={moduleData} />
    );
  }

  if (
    String(moduleId) === '2' &&
    ['2.1', '2.2', '2.3'].includes(topicNumber)
  ) {
    return (
      <Topic21Intro
        key={`${moduleId}-${topicNumber}`}
        moduleData={moduleData}
      />
    );
  }

   if (
    String(moduleId) === '3' &&
    topicNumber === '3.1'
  ) {
    return (
      <Topic31Intro
        key={`${moduleId}-${topicNumber}`}
        moduleData={moduleData}
      />
    );
  }

  if (
    String(moduleId) === '3' &&
    topicNumber === '3.2'
  ) {
    return (
      <Topic32Content
        key={`${moduleId}-${topicNumber}`}
        moduleData={moduleData}
      />
    );
  }

  if (
    String(moduleId) === '3' &&
    topicNumber === '3.3'
  ) {
    return (
      <Topic33Content
        key={`${moduleId}-${topicNumber}`}
        moduleData={moduleData}
      />
    );
  }

  if (
    String(moduleId) !== '1' ||
    topicNumber !== '1.1'
  ) {
    return (
      <main className={styles.message}>
        Tema aún no disponible.
      </main>
    );
  }

  const sections = [
    {
      id: 'about',
      label: 'Introducción',
      description: 'Conoce el objetivo y los aprendizajes del tema.',
      enabled: true,
    },
    {
      id: 'video',
      label: 'Video',
      description: 'Observa la clase y completa el video.',
      enabled: true,
    },
    {
      id: 'article',
      label: 'Información',
      description: 'Explora lecturas complementarias.',
      enabled: videoCompleted,
    },
    {
      id: 'forum',
      label: 'Foro',
      description: 'Comparte una solución para tu ciudad.',
      enabled: videoCompleted,
    },
    {
      id: 'evaluation',
      label: 'Evaluación',
      description: evaluationPassed
        ? 'Evaluación aprobada.'
        : 'Comprueba lo que aprendiste.',
      enabled: Boolean(myPost) && Boolean(evaluationId),
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {section === 'index' && (
          <Link
            to={`/course/${moduleData.courseId}`}
            className={styles.backLink}
          >
            ← Volver al curso
          </Link>
        )}

        {section === 'index' ? (
          <section className={styles.topicIndex}>
            <div className={styles.indexIntro}>
              <div className={styles.indexIntroText}>
                <span className={styles.sectionLabel}>
                  MÓDULO 1 · TEMA 1.1
                </span>

                <h1>
                  Concepto de{' '}
                  <span>Ciudad Inteligente</span>
                </h1>

                <p>
                  Descubre cómo una ciudad puede usar información,
                  planificación y participación para mejorar la vida
                  de sus habitantes.
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
                    {evaluationPassed && item.id === 'evaluation'
                      ? '✓ Aprobada'
                      : item.enabled
                        ? 'Abrir →'
                        : '🔒 Pendiente'}
                  </span>
                </button>
              ))}
            </div>

            {loadingProgress && (
              <p>Consultando tu avance...</p>
            )}
          </section>
        ) : (
          <div className={styles.lessonContent}>
            {section === 'article' && (
              <button
                type="button"
                className={styles.returnButton}
                onClick={() => setSection('index')}
              >
                ← Contenido del tema
              </button>
            )}

            {section === 'about' && (
              <section className={styles.lessonCard}>
                <div className={styles.introNavigation}>
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
                </div>

                <h2>Introducción</h2>

                <p className={styles.introLead}>
                  Una ciudad inteligente mejora la vida de las
                  personas al combinar información, tecnología,
                  planificación y participación ciudadana para
                  resolver necesidades reales.
                </p>

                <div className={styles.introBlock}>
                  <span className={styles.introBlockLabel}>
                    OBJETIVO
                  </span>

                  <p>
                    Comprender qué es una ciudad inteligente y
                    reconocer cómo el uso de datos y la
                    participación de la ciudadanía pueden ayudar
                    a un municipio a mejorar sus servicios y
                    tomar mejores decisiones.
                  </p>
                </div>

                <div className={styles.introBlock}>
                  <span className={styles.introBlockLabel}>
                    ¿QUÉ APRENDERÁS?
                  </span>

                  <ul className={styles.learningPoints}>
                    <li>
                      A explicar qué caracteriza a una ciudad
                      inteligente más allá de instalar tecnología.
                    </li>
                    <li>
                      A identificar cómo la información ayuda
                      a detectar problemas y priorizar soluciones.
                    </li>
                    <li>
                      A reconocer la importancia de la participación
                      ciudadana y los indicadores para comprobar
                      resultados.
                    </li>
                  </ul>
                </div>

                <div className={styles.introBlock}>
                  <span className={styles.introBlockLabel}>
                    ASÍ AVANZARÁS EN EL TEMA
                  </span>

                  <ul className={styles.learningPoints}>
                    <li>
                      <strong>Video:</strong> míralo completo para
                      registrar tu avance. Adelantarlo no equivale
                      a haber visto esa parte.
                    </li>
                    <li>
                      <strong>Información:</strong> puedes consultar
                      las lecturas de apoyo antes de participar
                      en el foro.
                    </li>
                    <li>
                      <strong>Foro:</strong> publica tu propuesta
                      para habilitar la evaluación.
                    </li>
                    <li>
                      <strong>Evaluación:</strong> son 5 preguntas;
                      cada una vale 2 puntos, equivalentes al 20 %
                      de la nota. Necesitas al menos el 70 %
                      para aprobar y pasar al tema 1.2.
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() => setSection('video')}
                >
                  Empezar →
                </button>
              </section>
            )}

            {section === 'video' && (
              <section className={styles.lessonCard}>
                <div className={styles.videoTopBar}>
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

                    <h2>¿Qué hace inteligente a una ciudad?</h2>
                  </div>
                </div>

                <div className={styles.videoMeta}>
                  <span>◷ Duración aproximada: 7 minutos</span>

                  <span>
                    {videoCompleted
                      ? '✓ Video completado'
                      : '○ Pendiente de completar'}
                  </span>
                </div>

                {video ? (
                  <div className={styles.playerFrame}>
                    <VideoPlayer
                      ytVideoId={video.url}
                      dbVideoId={video.id}
                      videoDuration={video.duration}
                      onProgress={(_, progress) => {
                        if (progress?.is_completed === true) {
                          setVideoCompleted(true);
                        }
                      }}
                      onComplete={() => setVideoCompleted(true)}
                    />
                  </div>
                ) : (
                  <p>El video aún no está disponible.</p>
                )}

                {videoCompleted ? (
                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={() => setSection('article')}
                  >
                    Ir a Información →
                  </button>
                ) : (
                  <p className={styles.pendingNote}>
                    Termina el video para acceder a Información y al foro.
                  </p>
                )}
              </section>
            )}

            {section === 'forum' && videoCompleted && (
              <section className={styles.lessonCard}>
                <div className={styles.forumTopBar}>
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
                      ACTIVIDAD PARTICIPATIVA
                    </span>

                    <h2>Una solución inteligente para tu ciudad</h2>

                    <p>
                      Observa tu entorno, plantea una idea y
                      compártela con los demás participantes.
                    </p>
                  </div>
                </div>

                <div className={styles.forumPrompt}>
                  <h3>
                    ¿Cómo resolverías un problema de tu ciudad
                    de forma inteligente?
                  </h3>

                  <p>
                    Piensa en una calle dañada, dificultades
                    en el transporte o demoras en un trámite.
                    Publica una respuesta breve siguiendo estas ideas:
                  </p>
                </div>

                <div className={styles.forumGuide}>
                  {forumPrompts.map((prompt) => (
                    <div
                      key={prompt.number}
                      className={styles.forumGuideCard}
                    >
                      <span className={styles.forumGuideNumber}>
                        {prompt.number}
                      </span>

                      <div>
                        <strong>{prompt.title}</strong>
                        <p>{prompt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {myPost ? (
                  <div className={styles.myForumPost}>
                    <div className={styles.forumPostHeading}>
                      <span aria-hidden="true">✓</span>
                      <strong>Tu respuesta está publicada</strong>
                    </div>

                    <p>{myPost.content}</p>
                  </div>
                ) : (
                  <form
                    onSubmit={handlePublish}
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

                    <label htmlFor="forumAnswer">
                      Tu respuesta
                    </label>

                    <textarea
                      id="forumAnswer"
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      placeholder="Describe el problema, los datos que reunirías, tu propuesta, cómo participarían los habitantes y cómo medirías el resultado."
                      minLength={30}
                      maxLength={3000}
                      rows={7}
                      required
                    />

                    <small>
                      Escribe entre 30 y 3000 caracteres.
                      Puedes apoyarte en las ideas anteriores.
                    </small>

                    {forumError && (
                      <p className={styles.forumError} role="alert">
                        {forumError}
                      </p>
                    )}

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
                )}

                {myPost && (
                  <>
                    {forumError && (
                      <p className={styles.forumError} role="alert">
                        {forumError}
                      </p>
                    )}

                    <button
                      type="button"
                      className={styles.nextButton}
                      onClick={() => setSection('evaluation')}
                    >
                      Ir a la evaluación →
                    </button>

                    <div className={styles.otherPosts}>
                      <div className={styles.otherPostsHeading}>
                        <h3>Respuestas del foro</h3>
                      </div>

                      <div className={styles.forumPostsGrid}>
                        {posts.map((post) => (
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

                            <p>{post.content}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

            {section === 'article' && videoCompleted && (
              <section className={styles.lessonCard}>
                <div className={styles.articleHeader}>
                  <span className={styles.sectionLabel}>
                    LECTURAS COMPLEMENTARIAS
                  </span>

                  <h2>Explora y profundiza</h2>

                  <p>
                    Estas publicaciones son un refuerzo opcional.
                    Puedes consultarlas ahora o regresar a ellas
                    cuando quieras.
                  </p>
                </div>

                <div className={styles.articleGrid}>
                  {articles.map((article) => (
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
                      FUENTE INSTITUCIONAL
                    </span>

                    <h3>Conoce más publicaciones de la CEPAL</h3>

                    <p>
                      Explora sus estudios y recursos sobre desarrollo
                      urbano, tecnología y América Latina.
                    </p>
                  </div>

                  <a
                    href="https://www.cepal.org/es"
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
                      Las lecturas son opcionales.
                      Continúa al foro para compartir tu propuesta.
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
            )}

            {section === 'evaluation' && myPost && evaluationId && (
              <section className={styles.lessonCard}>
                <div className={styles.introNavigation}>
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
                </div>

                <span className={styles.sectionLabel}>
                  EVALUACIÓN · TEMA 1.1
                </span>

                <h2>Comprueba lo que aprendiste</h2>

                <p>
                  Responde cinco preguntas. Cada una vale 2 puntos y
                  necesitas al menos 70 % para aprobar.
                </p>

                {evaluationPassed ? (
                  <div className={styles.articleNextStep} role="status">
                    <div>
                      <strong>✓ Aprobaste el tema 1.1</strong>

                      <p>
                        Calificación:{' '}
                        {evaluationScore !== null
                          ? `${Number(evaluationScore).toFixed(0)}%`
                          : 'Aprobada'}
                        . Tu resultado quedó guardado.
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.nextButton}
                      onClick={() => setSection('index')}
                    >
                      Tema 1.2 →
                    </button>
                  </div>
                ) : (
                  <EvaluationForm
                    evaluationId={evaluationId}
                    onSuccess={handleEvaluationSuccess}
                  />
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default TopicDetail;