import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { getModuleById } from '../data/courseData';
import VideoPlayer from '../components/VideoPlayer';
import EvaluationForm from '../components/EvaluationForm';
import styles from './TopicDetail.module.css';

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
        setPosts(forumPosts);
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
      setPosts(forumPosts);
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

  if (String(moduleId) !== '1' || topicNumber !== '1.1') {
    return (
      <main className={styles.message}>
        Tema aún no disponible.
      </main>
    );
  }

  if (!moduleData) {
    return (
      <main className={styles.message}>
        Módulo no encontrado.
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
                  Concepto de <span>Ciudad Inteligente</span>
                </h1>

                <p>
                  Descubre cómo una ciudad puede usar información,
                  planificación y participación para mejorar la vida de
                  sus habitantes.
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
                  Una ciudad inteligente mejora la vida de las personas
                  al combinar información, tecnología, planificación y
                  participación ciudadana para resolver necesidades
                  reales.
                </p>

                <div className={styles.introBlock}>
                  <span className={styles.introBlockLabel}>
                    OBJETIVO
                  </span>

                  <p>
                    Comprender qué es una ciudad inteligente y reconocer
                    cómo el uso de datos y la participación de la
                    ciudadanía pueden ayudar a un municipio a mejorar
                    sus servicios y tomar mejores decisiones.
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
                      A identificar cómo la información ayuda a
                      detectar problemas y priorizar soluciones.
                    </li>
                    <li>
                      A reconocer la importancia de la participación
                      ciudadana y los indicadores para comprobar
                      resultados.
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
                      onComplete={() =>
                        setVideoCompleted(true)
                      }
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

                    <h2>
                      Una solución inteligente para tu ciudad
                    </h2>

                    <p>
                      Observa tu entorno, plantea una idea y
                      compártela con los demás participantes.
                    </p>
                  </div>
                </div>

                <div className={styles.forumPrompt}>
                  <h3>
                    ¿Cómo resolverías un problema de tu ciudad de
                    forma inteligente?
                  </h3>

                  <p>
                    Piensa en una calle dañada, dificultades en el
                    transporte o demoras en un trámite. Publica una
                    respuesta breve siguiendo estas cinco ideas:
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
                      <strong>
                        Tu respuesta está publicada
                      </strong>
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

                      <span
                        className={
                          styles.forumCharacterCount
                        }
                      >
                        {answer.trim().length}/3000
                      </span>
                    </div>

                    <label htmlFor="forumAnswer">
                      Tu respuesta
                    </label>

                    <textarea
                      id="forumAnswer"
                      value={answer}
                      onChange={(event) =>
                        setAnswer(event.target.value)
                      }
                      placeholder="Describe el problema, los datos que reunirías, tu propuesta, cómo participarían los habitantes y cómo medirías el resultado."
                      minLength={30}
                      maxLength={3000}
                      rows={7}
                      required
                    />

                    <small>
                      Escribe entre 30 y 3000 caracteres.
                      Puedes apoyarte en las cinco ideas
                      anteriores.
                    </small>

                    {forumError && (
                      <p
                        className={styles.forumError}
                        role="alert"
                      >
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
                      <p
                        className={styles.forumError}
                        role="alert"
                      >
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
                      <div
                        className={
                          styles.otherPostsHeading
                        }
                      >
                        <h3>Respuestas del foro</h3>
                      </div>

                      <div className={styles.forumPostsGrid}>
                        {posts.map((post) => (
                          <article
                            key={post.id}
                            className={styles.forumPost}
                          >
                            <div
                              className={
                                styles.forumPostAuthor
                              }
                            >
                              <span aria-hidden="true">
                                {(post.User?.name || 'P')
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>

                              <strong>
                                {post.User?.name ||
                                  'Participante'}
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
                    Estas publicaciones son un refuerzo
                    opcional. Puedes consultarlas ahora o
                    regresar a ellas cuando quieras.
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

                    <h3>
                      Conoce más publicaciones de la CEPAL
                    </h3>

                    <p>
                      Explora sus estudios y recursos sobre
                      desarrollo urbano, tecnología y América
                      Latina.
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
                    <strong>
                      ¿Listo para participar en el foro?
                    </strong>

                    <p>
                      Las lecturas son opcionales. Continúa al foro
                      para compartir tu propuesta.
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

            {section === 'evaluation' &&
              myPost &&
              evaluationId && (
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
                    Responde cinco preguntas. Cada una vale
                    2 puntos y necesitas al menos 70% para
                    aprobar.
                  </p>

                  {evaluationPassed ? (
                    <div
                      className={styles.articleNextStep}
                      role="status"
                    >
                      <div>
                        <strong>
                          ✓ Aprobaste el tema 1.1
                        </strong>

                        <p>
                          Calificación:{' '}
                          {evaluationScore !== null
                            ? `${Number(
                                evaluationScore
                              ).toFixed(0)}%`
                            : 'Aprobada'}
                          . Tu resultado quedó guardado.
                        </p>
                      </div>

                      <button
                        type="button"
                        className={styles.nextButton}
                        onClick={() => setSection('index')}
                      >
                        Ver contenido del tema →
                      </button>
                    </div>
                  ) : (
                    <EvaluationForm
                      evaluationId={evaluationId}
                      onSuccess={
                        handleEvaluationSuccess
                      }
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