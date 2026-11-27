import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

import styles from './TeacherDashboard.module.css';

const scoreLabel = (value) =>
  value === null || value === undefined
    ? '—'
    : `${(Number(value) / 10).toLocaleString(
        'es-EC',
        { maximumFractionDigits: 2 }
      )}/10`;

const dateLabel = (value) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('es-EC');
};

const useTeachingCourses = () => {
  const { user } = useContext(AuthContext);
  const identity = user?.id ?? user?._id;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setCourses([]);
    setError('');

    api.get('/teachers/me/courses')
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error(
            'La lista de cursos no es válida.'
          );
        }

        if (active) setCourses(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar tus cursos.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [identity, retry]);

  return {
    identity,
    courses,
    loading,
    error,
    reload: () =>
      setRetry((current) => current + 1),
  };
};

const Notice = ({ error, onRetry }) => (
  <div className={styles.error} role="alert">
    <p>{error}</p>

    {onRetry && (
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onRetry}
      >
        Reintentar
      </button>
    )}
  </div>
);

const CourseSelector = ({
  courses,
  value,
  onChange,
}) => (
  <div className={styles.moduleToolbar}>
    <div className={styles.moduleSelector}>
      <label htmlFor="teacher-support-course">
        Selecciona un curso
      </label>

      <select
        id="teacher-support-course"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">Selecciona un curso</option>

        {courses.map((course) => (
          <option
            key={course.id}
            value={String(course.id)}
          >
            {course.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const ParticipantDetail = ({
  courseId,
  participant,
  onBack,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    setData(null);

    api.get(
      `/teacher-support/courses/${courseId}/participants/${participant.id}/progress`
    )
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message ||
              'No se pudo consultar el seguimiento.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseId, participant.id, retry]);

  return (
    <section className={styles.card}>
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onBack}
      >
        ← Volver a participantes
      </button>

      <h2 style={{ marginTop: 22 }}>
        {participant.name}
      </h2>

      <p className={styles.description}>
        {participant.email}
      </p>

      {loading && (
        <p role="status">Consultando seguimiento…</p>
      )}

      {error && (
        <Notice
          error={error}
          onRetry={() =>
            setRetry((current) => current + 1)
          }
        />
      )}

      {data && !loading && (
        <>
          <p className={styles.badge}>
            Avance del curso: {data.course.progress} %
          </p>

          <p className={styles.description}>
            Videos: {data.course.completedVideos}/
            {data.course.totalVideos}
            {' · '}
            Módulos aprobados:{' '}
            {data.course.completedModules}/
            {data.course.totalModules}
          </p>

          {(data.course.modules || []).map(
            (module) => (
              <section
                key={module.id}
                className={styles.resourceSection}
              >
                <h3>
                  Módulo {module.order}: {module.title}
                </h3>

                <p className={styles.description}>
                  Avance: {module.progress} %
                  {' · '}
                  Videos: {module.completedVideos}/
                  {module.totalVideos}
                  {' · '}
                  Lecturas: {module.readings?.viewed ?? 0}/
                  {module.readings?.total ?? 0}
                </p>

                {!!module.readings?.topics?.length && (
                  <ul className={styles.modules}>
                    {module.readings.topics.map((topic) => (
                      <li key={topic.topic}>
                        Tema {topic.topic}: {topic.viewed}
                        {' de '}
                        {topic.total} lecturas consultadas
                      </li>
                    ))}
                  </ul>
                )}

                {module.supported && (
                  <div className={styles.resultsTable}>
                    <table>
                      <caption>
                        Calificaciones del módulo
                      </caption>

                      <thead>
                        <tr>
                          <th>Evaluación</th>
                          <th>Intentos</th>
                          <th>Mejor nota</th>
                          <th>Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        {[
                          ...(module.evaluations || []).map(
                            (evaluation) => ({
                              ...evaluation,
                              label:
                                `Tema ${evaluation.topic}`,
                              key: evaluation.topic,
                            })
                          ),
                          {
                            ...(module.integrative || {}),
                            label: 'Integradora',
                            key: 'integrative',
                          },
                        ].map((evaluation) => (
                          <tr key={evaluation.key}>
                            <th scope="row">
                              {evaluation.label}
                            </th>
                            <td>
                              {evaluation.attempts ?? '—'}
                            </td>
                            <td>
                              {scoreLabel(
                                evaluation.bestScore
                              )}
                            </td>
                            <td>
                              {evaluation.passed
                                ? 'Aprobada'
                                : 'Pendiente de aprobar'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )
          )}

          <section className={styles.resourceSection}>
            <h3>Historial de intentos</h3>

            <div className={styles.resultsTable}>
              <table>
                <caption>
                  Intentos de este participante en el curso
                </caption>

                <thead>
                  <tr>
                    <th>Evaluación</th>
                    <th>Nota</th>
                    <th>Resultado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {data.attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <th scope="row">
                        {attempt.title}
                      </th>
                      <td>{scoreLabel(attempt.score)}</td>
                      <td>
                        {attempt.passed
                          ? 'Aprobada'
                          : 'No aprobada'}
                      </td>
                      <td>
                        {dateLabel(attempt.attemptedAt)}
                      </td>
                    </tr>
                  ))}

                  {!data.attempts.length && (
                    <tr>
                      <td colSpan={4}>
                        No hay intentos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
};

const Participants = ({ courseId }) => {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    setData(null);

    api.get(
      `/teacher-support/courses/${courseId}/participants?page=${page}`
    )
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar los participantes.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseId, page, retry]);

  if (selected) {
    return (
      <ParticipantDetail
        courseId={courseId}
        participant={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <section className={styles.card}>
      <h2>Participantes del curso</h2>

      {loading && (
        <p role="status">Consultando participantes…</p>
      )}

      {error && (
        <Notice
          error={error}
          onRetry={() =>
            setRetry((current) => current + 1)
          }
        />
      )}

      {data && (
        <>
          <p className={styles.description}>
            {data.total} participantes inscritos
          </p>

          <div className={styles.resultsTable}>
            <table>
              <caption>
                Participantes de tu curso asignado
              </caption>

              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {data.participants.map((participant) => (
                  <tr key={participant.id}>
                    <th scope="row">
                      {participant.name}
                    </th>
                    <td>{participant.email}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() =>
                          setSelected(participant)
                        }
                      >
                        Ver seguimiento
                      </button>
                    </td>
                  </tr>
                ))}

                {!data.participants.length && (
                  <tr>
                    <td colSpan={3}>
                      No hay participantes inscritos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
};

const Pagination = ({
  page,
  totalPages,
  onChange,
}) => totalPages > 1 ? (
  <nav
    className={styles.moduleNavigation}
    aria-label="Páginas"
  >
    <button
      type="button"
      className={styles.secondaryButton}
      disabled={page <= 1}
      onClick={() => onChange(page - 1)}
    >
      Anterior
    </button>

    <span>Página {page} de {totalPages}</span>

    <button
      type="button"
      className={styles.primaryButton}
      disabled={page >= totalPages}
      onClick={() => onChange(page + 1)}
    >
      Siguiente
    </button>
  </nav>
) : null;

export const TeacherTracking = () => {
  const source = useTeachingCourses();
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    setCourseId('');
  }, [source.identity]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              ACOMPAÑAMIENTO ACADÉMICO
            </span>
            <h1>Seguimiento de participantes</h1>
            <p>
              Consulta notas, intentos, videos y lecturas
              de los participantes de tus cursos.
            </p>
          </div>
        </header>

        {source.loading ? (
          <p role="status">Consultando cursos…</p>
        ) : source.error ? (
          <Notice
            error={source.error}
            onRetry={source.reload}
          />
        ) : !source.courses.length ? (
          <p className={styles.empty}>
            Todavía no tienes cursos asignados.
          </p>
        ) : (
          <>
            <CourseSelector
              courses={source.courses}
              value={courseId}
              onChange={setCourseId}
            />

            {courseId && (
              <Participants
                key={`${source.identity}-${courseId}`}
                courseId={courseId}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};

const ForumPosts = ({
  courseId,
  topicNumber,
}) => {
  const { user } = useContext(AuthContext);
  const ownId = Number(user?.id ?? user?._id);

  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);

  const lockRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    setData(null);

    api.get(
      `/teacher-support/courses/${courseId}/forums/${encodeURIComponent(topicNumber)}/posts?page=${page}`
    )
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message ||
              'No se pudo consultar el foro.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseId, topicNumber, page, retry]);

  const reply = async (event, post) => {
    event.preventDefault();

    if (lockRef.current) return;

    const content = (drafts[post.id] || '').trim();

    if (content.length < 10 || content.length > 1000) {
      setError(
        'Escribe entre 10 y 1000 caracteres.'
      );
      return;
    }

    lockRef.current = true;
    setBusyId(post.id);
    setError('');
    setMessage('');

    try {
      const comment = await api.post(
        `/teacher-support/courses/${courseId}/forums/${encodeURIComponent(topicNumber)}/posts/${post.id}/comments`,
        { content }
      );

      if (!mountedRef.current) return;

      setData((current) => ({
        ...current,
        posts: current.posts.map((item) =>
          item.id === post.id
            ? {
                ...item,
                comments: [
                  ...item.comments,
                  comment,
                ],
              }
            : item
        ),
      }));

      setDrafts((current) => ({
        ...current,
        [post.id]: '',
      }));

      setMessage(
        'Comentario publicado. El participante podrá verlo en sus notificaciones.'
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          requestError.message ||
            'No se pudo publicar el comentario.'
        );
      }
    } finally {
      lockRef.current = false;

      if (mountedRef.current) {
        setBusyId(null);
      }
    }
  };

  return (
    <section className={styles.card}>
      <h2>Foro del tema {topicNumber}</h2>

      <p className={styles.editorHint}>
        Tu respuesta es opcional. No modifica notas
        ni bloquea el avance del participante.
      </p>

      {message && (
        <p className={styles.success} role="status">
          {message}
        </p>
      )}

      {error && (
        <Notice
          error={error}
          onRetry={!data
            ? () => setRetry((current) => current + 1)
            : undefined}
        />
      )}

      {loading && (
        <p role="status">Consultando publicaciones…</p>
      )}

      {data && !loading && (
        <>
          {!data.posts.length && (
            <p className={styles.description}>
              Todavía no hay publicaciones en este tema.
            </p>
          )}

          {data.posts.map((post) => {
            const alreadyCommented = post.comments.some(
              (comment) =>
                Number(comment.userId) === ownId
            );

            return (
              <article
                key={post.id}
                className={styles.forumPost}
              >
                <h3>{post.authorName}</h3>

                <time>
                  {dateLabel(post.createdAt)}
                </time>

                <p className={styles.forumText}>
                  {post.content}
                </p>

                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={
                      comment.authorRole === 'DOCENTE'
                        ? styles.teacherComment
                        : styles.forumComment
                    }
                  >
                    <strong>
                      {comment.authorName}
                    </strong>

                    {comment.authorRole === 'DOCENTE' && (
                      <span className={styles.badge}>
                        Comentario del docente
                      </span>
                    )}

                    <p className={styles.forumText}>
                      {comment.content}
                    </p>
                  </div>
                ))}

                {Number(post.userId) !== ownId && (
                  alreadyCommented ? (
                    <p className={styles.description}>
                      Ya dejaste tu comentario en esta
                      publicación.
                    </p>
                  ) : (
                    <form
                      className={styles.form}
                      onSubmit={(event) =>
                        reply(event, post)
                      }
                    >
                      <label>
                        Tu comentario como docente

                        <textarea
                          value={drafts[post.id] || ''}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [post.id]: event.target.value,
                            }))
                          }
                          placeholder="Comparte una observación, recomendación o pregunta."
                          minLength={10}
                          maxLength={1000}
                          rows={4}
                          disabled={busyId !== null}
                          required
                        />
                      </label>

                      <div className={styles.actions}>
                        <button
                          type="submit"
                          className={styles.primaryButton}
                          disabled={busyId !== null}
                        >
                          {busyId === post.id
                            ? 'Publicando…'
                            : 'Publicar comentario'}
                        </button>
                      </div>
                    </form>
                  )
                )}
              </article>
            );
          })}

          <Pagination
            page={page}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
};

const CourseForum = ({ courseId }) => {
  const [topics, setTopics] = useState([]);
  const [topicNumber, setTopicNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    api.get(
      `/teacher-support/courses/${courseId}/forum-topics`
    )
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error(
            'La lista de temas no es válida.'
          );
        }

        if (active) setTopics(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar los temas.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseId, retry]);

  if (loading) {
    return <p role="status">Consultando temas…</p>;
  }

  if (error) {
    return (
      <Notice
        error={error}
        onRetry={() =>
          setRetry((current) => current + 1)
        }
      />
    );
  }

  if (!topics.length) {
    return (
      <p className={styles.empty}>
        Este curso todavía no tiene foros configurados.
      </p>
    );
  }

  return (
    <>
      <div className={styles.moduleToolbar}>
        <div className={styles.moduleSelector}>
          <label htmlFor="teacher-forum-topic">
            Selecciona el tema
          </label>

          <select
            id="teacher-forum-topic"
            value={topicNumber}
            onChange={(event) =>
              setTopicNumber(event.target.value)
            }
          >
            <option value="">
              Selecciona un tema
            </option>

            {topics.map((topic) => (
              <option
                key={topic.id}
                value={topic.topicNumber}
              >
                Tema {topic.topicNumber}
                {' — '}
                {topic.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {topicNumber && (
        <ForumPosts
          key={`${courseId}-${topicNumber}`}
          courseId={courseId}
          topicNumber={topicNumber}
        />
      )}
    </>
  );
};

export const TeacherForums = () => {
  const source = useTeachingCourses();
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    setCourseId('');
  }, [source.identity]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              PARTICIPACIÓN Y RETROALIMENTACIÓN
            </span>
            <h1>Foros de mis cursos</h1>
            <p>
              Lee las propuestas de los participantes
              y comparte tus observaciones.
            </p>
          </div>
        </header>

        {source.loading ? (
          <p role="status">Consultando cursos…</p>
        ) : source.error ? (
          <Notice
            error={source.error}
            onRetry={source.reload}
          />
        ) : !source.courses.length ? (
          <p className={styles.empty}>
            Todavía no tienes cursos asignados.
          </p>
        ) : (
          <>
            <CourseSelector
              courses={source.courses}
              value={courseId}
              onChange={setCourseId}
            />

            {courseId && (
              <CourseForum
                key={`${source.identity}-${courseId}`}
                courseId={courseId}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};