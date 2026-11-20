import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { Link } from 'react-router-dom';
import { api } from '../services/api';
import EvaluationForm from './EvaluationForm';
import styles from '../pages/TopicDetail.module.css';

const topics = {
  '3.1': {
    title: '¿Debe la IA decidir por la ciudad?',
    lead:
      'Analiza una recomendación de IA antes de convertirla en una decisión municipal.',
    scenario:
      'Un sistema de inteligencia artificial analiza reportes ciudadanos y recomienda qué problemas urbanos atender primero. El personal municipal observa que su recomendación no coincide con lo que viven algunas personas en los sectores afectados.',
    question:
      '¿Qué debería hacer el municipio antes de actuar?',
    instruction:
      'Explica cómo comprobarías si los datos son confiables, por qué conviene escuchar a la ciudadanía y quién debe asumir la decisión final.',
    guide: [
      [
        '01',
        'Comprueba los datos',
        'Explica cómo revisarías su origen, actualización y correspondencia con la realidad.',
      ],
      [
        '02',
        'Escucha a la ciudadanía',
        'Describe cómo conocerías la experiencia de las personas afectadas.',
      ],
      [
        '03',
        'Define la responsabilidad',
        'Indica quién debe validar la recomendación y asumir la decisión final.',
      ],
    ],
    subject:
      'inteligencia artificial aplicada a servicios urbanos',
    next: '3.2',
  },

  '3.2': {
    title: '¿Qué hace útil a un curso virtual?',
    lead:
      'Propón mejoras para que las personas sepan cómo continuar y puedan reconocer su avance.',
    scenario:
      'Una plataforma reúne videos, lecturas y evaluaciones, pero varios participantes dejan de usarla porque no saben qué estudiar después ni cómo van avanzando.',
    question:
      '¿Qué cambiarías para que el curso sea más fácil de seguir?',
    instruction:
      'Propón dos mejoras relacionadas con la organización de los contenidos, el acompañamiento docente o el seguimiento.',
    guide: [
      [
        '01',
        'Identifica la dificultad',
        'Explica qué dificulta continuar con el curso.',
      ],
      [
        '02',
        'Propón dos mejoras',
        'Considera la organización, el acompañamiento docente o el seguimiento.',
      ],
      [
        '03',
        'Explica su utilidad',
        'Describe cómo ayudarían a los participantes a seguir aprendiendo.',
      ],
    ],
    subject: 'educación inteligente',
    next: '3.3',
  },
  '3.3': {
  title: 'Probar antes de cambiar',

  lead:
    'Compara alternativas antes de modificar un servicio que utilizan distintos barrios.',

  scenario:
    'Se propone modificar una ruta de transporte para llegar a más barrios. El cambio podría beneficiar a nuevos pasajeros, pero también aumentar el tiempo de viaje de quienes ya utilizan el servicio.',

  question:
    '¿Qué escenarios compararías en un gemelo digital antes de cambiar la ruta?',

  instruction:
    'Explica qué datos necesitarías y qué resultados revisarías para elegir una alternativa.',

  guide: [
    [
      '01',
      'Compara escenarios',
      'Considera la ruta actual y alternativas que permitan atender nuevos barrios.',
    ],
    [
      '02',
      'Identifica los datos',
      'Piensa en los recorridos, la demanda de pasajeros, los horarios, el tráfico y los tiempos de viaje.',
    ],
    [
      '03',
      'Revisa los resultados',
      'Explica cómo compararías la cobertura y los tiempos de viaje para elegir una alternativa.',
    ],
  ],

  subject:
    'gemelos digitales y simulación urbana',

  next: null,
},
};

const Topic31Activities = ({
  section,
  moduleId,
  onSectionChange,
  onStatusChange,
  topicNumber = '3.1',
}) => {
  const topic = topics[topicNumber];

  const notifyRef = useRef(onStatusChange);
  notifyRef.current = onStatusChange;

  const [myPost, setMyPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [answer, setAnswer] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);

  const [drafts, setDrafts] = useState({});
  const [commentError, setCommentError] =
    useState('');
  const [commenting, setCommenting] =
    useState(null);

  const [evaluationId, setEvaluationId] =
    useState(null);
  const [evaluationLoading, setEvaluationLoading] =
    useState(true);
  const [evaluationError, setEvaluationError] =
    useState('');

  const [passed, setPassed] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    const load = async () => {
      try {
        const mine = await api.get(
          `/foro/${topicNumber}/mine`
        );

        if (!active) return;

        setMyPost(mine);

        if (mine) {
          try {
            const data = await api.get(
              `/foro/${topicNumber}/posts`
            );

            if (active) {
              setPosts(
                Array.isArray(data) ? data : []
              );
            }
          } catch (err) {
            if (active) {
              setError(
                'Tu respuesta está guardada. No se pudieron cargar las respuestas de compañeros; puedes continuar a la evaluación.'
              );
            }
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'No se pudo consultar el foro.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [retry, topicNumber]);

  useEffect(() => {
    let active = true;

    setEvaluationLoading(true);
    setEvaluationError('');

    const load = async () => {
      try {
        const evaluation = await api.get(
          `/evaluations/topic/${topicNumber}`
        );

        const progress = await api.get(
          `/evaluations/${evaluation.id}/progress`
        );

        if (!active) return;

        setEvaluationId(evaluation.id);
        setPassed(progress?.passed === true);
        setScore(progress?.percentage ?? null);
      } catch (err) {
        if (active) {
          setEvaluationError(
            err.message ||
              'No se pudo cargar la evaluación.'
          );
        }
      } finally {
        if (active) {
          setEvaluationLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [retry, topicNumber]);

  useEffect(() => {
    notifyRef.current?.({
      forumCompleted: Boolean(myPost),
      evaluationPassed: passed,
    });
  }, [myPost, passed]);

  const publish = async (event) => {
    event.preventDefault();

    const content = answer.trim();

    if (
      content.length < 30 ||
      content.length > 3000
    ) {
      setError(
        'Escribe entre 30 y 3000 caracteres.'
      );
      return;
    }

    setBusy(true);
    setError('');

    try {
      const post = await api.post(
        `/foro/${topicNumber}/posts`,
        { content }
      );

      setMyPost(post);
      setAnswer('');
      setRetry((value) => value + 1);
    } catch (err) {
      setError(
        err.message || 'No se pudo publicar.'
      );
    } finally {
      setBusy(false);
    }
  };

  const comment = async (event, postId) => {
    event.preventDefault();

    const content = (
      drafts[postId] || ''
    ).trim();

    if (
      content.length < 10 ||
      content.length > 1000
    ) {
      setCommentError(
        'Escribe entre 10 y 1000 caracteres para comentar.'
      );
      return;
    }

    setCommenting(postId);
    setCommentError('');

    try {
      const saved = await api.post(
        `/foro/${topicNumber}/posts/${postId}/comments`,
        { content }
      );

      setPosts((previous) =>
        previous.map((post) =>
          Number(post.id) === Number(postId)
            ? {
                ...post,
                ForoComments: [
                  ...(post.ForoComments || []),
                  saved,
                ],
              }
            : post
        )
      );

      setDrafts((previous) => ({
        ...previous,
        [postId]: '',
      }));
    } catch (err) {
      setCommentError(
        err.message || 'No se pudo comentar.'
      );
    } finally {
      setCommenting(null);
    }
  };

  if (section === 'evaluation') {
    if (loading) {
      return (
        <p>
          Cargando tu participación en el foro...
        </p>
      );
    }

    if (!myPost) {
      return (
        <>
          <p>
            Publica tu respuesta en el foro para
            realizar la evaluación.
          </p>

          <button
            type="button"
            className={styles.nextButton}
            onClick={() =>
              onSectionChange('forum')
            }
          >
            Ir al foro →
          </button>
        </>
      );
    }

    return (
      <>
        <span className={styles.sectionLabel}>
          EVALUACIÓN · TEMA {topicNumber}
        </span>

        <h2>Comprueba lo que aprendiste</h2>

        <p>
          Responde las cinco preguntas sobre{' '}
          {topic.subject}.
        </p>

        <div className={styles.videoMeta}>
          <span>5 preguntas</span>
          <span>
            2 puntos por respuesta correcta · 20 %
          </span>
          <span>Nota máxima: 10 puntos</span>
          <span>Mínimo para aprobar: 70 %</span>
        </div>

        <p className={styles.pendingNote}>
          Con cuatro respuestas correctas obtienes
          8/10 puntos (80 %) y apruebas. Si no
          alcanzas el mínimo, revisa tus respuestas
          y vuelve a intentarlo.
        </p>

        {evaluationLoading ? (
          <p>Consultando tu resultado...</p>
        ) : evaluationError ? (
          <>
            <p
              role="alert"
              className={styles.forumError}
            >
              {evaluationError}
            </p>

            <button
              type="button"
              className={styles.nextButton}
              onClick={() =>
                setRetry((value) => value + 1)
              }
            >
              Volver a intentar →
            </button>
          </>
        ) : passed ? (
          <div
            className={styles.articleNextStep}
            role="status"
          >
            <div>
              <strong>
                ✓ Aprobaste el tema {topicNumber}
              </strong>

              <p>
                Calificación:{' '}
                {Number(score).toFixed(0)} %.
                Tu resultado quedó guardado.
              </p>
            </div>

          {topic.next ? (
  <Link
    className={styles.nextButton}
    to={`/module/${moduleId}/topic/${topic.next}`}
  >
    Tema {topic.next} →
  </Link>
) : (
  <Link
    className={styles.nextButton}
    to="/course/1"
  >
    Volver al curso →
  </Link>
)}
          </div>
        ) : (
          <EvaluationForm
            evaluationId={evaluationId}
            onSuccess={(result) => {
              if (result?.passed === true) {
                setPassed(true);
                setScore(result.percentage);
              }
            }}
          />
        )}
      </>
    );
  }

  const others = posts.filter(
    (post) =>
      myPost &&
      Number(post.userId) !==
        Number(myPost.userId)
  );

  return (
    <>
      <div className={styles.forumHero}>
        <div
          className={styles.forumHeroIcon}
          aria-hidden="true"
        >
          ✦
        </div>

        <div>
          <span className={styles.forumEyebrow}>
            ACTIVIDAD PARTICIPATIVA · TEMA{' '}
            {topicNumber}
          </span>

          <h2>{topic.title}</h2>
          <p>{topic.lead}</p>
        </div>
      </div>

      <div className={styles.forumPrompt}>
        <p>{topic.scenario}</p>
        <h3>{topic.question}</h3>
        <p>{topic.instruction}</p>
      </div>

      <div className={styles.forumGuide}>
        {topic.guide.map(
          ([number, title, text]) => (
            <div
              key={number}
              className={styles.forumGuideCard}
            >
              <span
                className={
                  styles.forumGuideNumber
                }
              >
                {number}
              </span>

              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          )
        )}
      </div>

      <button
        type="button"
        className={styles.returnButton}
        disabled={loading || busy}
        onClick={() =>
          setRetry((value) => value + 1)
        }
      >
        Actualizar foro
      </button>

      {error && (
        <p
          role="alert"
          className={styles.forumError}
        >
          {error}
        </p>
      )}

      {loading && <p>Cargando el foro...</p>}

      {myPost ? (
        <>
          <div className={styles.myForumPost}>
            <strong>
              ✓ Tu respuesta está publicada
            </strong>

            <p
              style={{
                whiteSpace: 'pre-wrap',
              }}
            >
              {myPost.content}
            </p>
          </div>

          <div className={styles.articleNextStep}>
            <div>
              <strong>
                Ya puedes realizar la evaluación
              </strong>

              <p>
                Leer las propuestas te permite
                conocer otras perspectivas.
                Comentar es opcional.
              </p>
            </div>

            <button
              type="button"
              className={styles.nextButton}
              onClick={() =>
                onSectionChange('evaluation')
              }
            >
              {passed
                ? 'Ver resultado →'
                : 'Ir a la evaluación →'}
            </button>
          </div>

          <div className={styles.otherPosts}>
            <h3>
              Respuestas de tus compañeros
            </h3>

            {!loading &&
              others.length === 0 && (
                <p>
                  Todavía no hay respuestas de
                  compañeros. Puedes continuar
                  a la evaluación.
                </p>
              )}

            {commentError && (
              <p
                role="alert"
                className={styles.forumError}
              >
                {commentError}
              </p>
            )}

            <div
              className={styles.forumPostsGrid}
            >
              {others.map((post) => (
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
                      {(
                        post.User?.name || 'P'
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
                  ).map((item) => (
                    <div
                      key={item.id}
                      className={
                        styles.myForumPost
                      }
                    >
                      <strong>
                        {item.User?.name ||
                          (Number(item.userId) ===
                          Number(myPost.userId)
                            ? 'Tú'
                            : 'Participante')}
                        :
                      </strong>

                      <p
                        style={{
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {item.content}
                      </p>
                    </div>
                  ))}

                  {(
                    post.ForoComments || []
                  ).some(
                    (item) =>
                      Number(item.userId) ===
                      Number(myPost.userId)
                  ) ? (
                    <p>
                      ✓ Ya comentaste esta respuesta.
                    </p>
                  ) : (
                    <form
                      className={styles.forumForm}
                      onSubmit={(event) =>
                        comment(event, post.id)
                      }
                    >
                      <label
                        htmlFor={
                          `comment-${topicNumber}-${post.id}`
                        }
                      >
                        Tu comentario — opcional
                      </label>

                      <textarea
                        id={
                          `comment-${topicNumber}-${post.id}`
                        }
                        value={
                          drafts[post.id] || ''
                        }
                        onChange={(event) =>
                          setDrafts(
                            (previous) => ({
                              ...previous,
                              [post.id]:
                                event.target.value,
                            })
                          )
                        }
                        rows={3}
                        minLength={10}
                        maxLength={1000}
                        required
                      />

                      <button
                        type="submit"
                        className={
                          styles.nextButton
                        }
                        disabled={
                          commenting !== null
                        }
                      >
                        {commenting === post.id
                          ? 'Publicando...'
                          : 'Comentar →'}
                      </button>
                    </form>
                  )}
                </article>
              ))}
            </div>
          </div>
        </>
      ) : !loading ? (
        <form
          className={styles.forumForm}
          onSubmit={publish}
        >
          <h3>Comparte tu respuesta</h3>

          <label
            htmlFor={
              `forumAnswer-${topicNumber}`
            }
          >
            Tu respuesta
          </label>

          <textarea
            id={
              `forumAnswer-${topicNumber}`
            }
            value={answer}
            onChange={(event) =>
              setAnswer(event.target.value)
            }
            rows={7}
            minLength={30}
            maxLength={3000}
            required
            placeholder={topic.instruction}
          />

          <small>
            {answer.trim().length}/3000 caracteres.
            Publicar tu respuesta habilita
            la evaluación.
          </small>

          <button
            type="submit"
            className={styles.nextButton}
            disabled={busy}
          >
            {busy
              ? 'Publicando...'
              : 'Publicar respuesta →'}
          </button>
        </form>
      ) : null}
    </>
  );
};

export default Topic31Activities;