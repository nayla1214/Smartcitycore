import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FiBarChart2,
  FiRefreshCw,
  FiUsers,
  FiStar,
  FiThumbsUp,
  FiDownload,
} from 'react-icons/fi';

import { api } from '../services/api';

import styles from './AdminSurveys.module.css';

const RECOMMENDATION_LABELS = {
  YES: 'Sí',
  MAYBE: 'Tal vez',
  NO: 'No',
};

const dateLabel = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const averageLabel = (value) =>
  value === null || value === undefined
    ? 'Sin respuestas'
    : `${Number(value).toFixed(2)} / 5`;

const answerLabel = (question, answers) => {
  const value = answers?.[question.key];

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 5
  ) {
    return 'Sin respuesta';
  }

  const label = question.labels?.[value - 1];

  return label
    ? `${label} (${value}/5)`
    : `${value}/5`;
};

export default function AdminSurveys() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');

  const [coursesLoading, setCoursesLoading] =
    useState(true);

  const [coursesError, setCoursesError] =
    useState('');

  const [coursesRetry, setCoursesRetry] =
    useState(0);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [opened, setOpened] = useState(null);

  const [downloading, setDownloading] =
    useState(null);

  const [downloadError, setDownloadError] =
    useState('');

  const [downloadNotice, setDownloadNotice] =
    useState('');

  const downloadLock = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setCoursesLoading(true);
    setCoursesError('');

    const load = async () => {
      try {
        const result = await api.get('/courses/admin');

        if (!Array.isArray(result)) {
          throw new Error(
            'No se recibió una lista válida de cursos.'
          );
        }

        if (active) {
          setCourses(
  result.filter(
    (course) => course.status === true
  )
);
        }
      } catch (requestError) {
        if (active) {
          setCoursesError(
            requestError.message ||
              'No se pudieron consultar los cursos.'
          );
        }
      } finally {
        if (active) {
          setCoursesLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [coursesRetry]);

  useEffect(() => {
    if (!courseId) {
      setData(null);
      setLoading(false);
      setError('');
      return undefined;
    }

    let active = true;

    setLoading(true);
    setError('');
    setData(null);
    setOpened(null);

    const load = async () => {
      try {
        const result = await api.get(
          `/course-surveys/${courseId}/results?page=${page}`
        );

        if (
          !result.course ||
          !Array.isArray(result.questions) ||
          !Array.isArray(result.responses) ||
          !Array.isArray(result.recommendations)
        ) {
          throw new Error(
            'No se recibieron resultados válidos.'
          );
        }

        if (active) {
          setData(result);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar los resultados.'
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
  }, [courseId, page, retry]);

  const changeCourse = (event) => {
    setCourseId(event.target.value);
    setPage(1);
    setOpened(null);
    setData(null);
    setError('');
    setDownloadError('');
    setDownloadNotice('');
  };

  const downloadReport = async (response = null) => {
    if (
      downloadLock.current ||
      !courseId ||
      !data
    ) {
      return;
    }

    downloadLock.current = true;

    const key = response
      ? `individual-${response.id}`
      : 'general';

    const endpoint = response
      ? `/course-surveys/${courseId}/responses/${response.id}/report`
      : `/course-surveys/${courseId}/report`;

    const filename = response
      ? `encuesta-curso-${courseId}-participante-${response.participant.id}.pdf`
      : `encuestas-curso-${courseId}-general.pdf`;

    setDownloading(key);
    setDownloadError('');
    setDownloadNotice('');

    try {
      await api.download(endpoint, filename);

      if (mountedRef.current) {
        setDownloadNotice(
          'Se inició la descarga del reporte PDF.'
        );
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setDownloadError(
          requestError.message ||
            'No se pudo descargar el reporte.'
        );
      }
    } finally {
      downloadLock.current = false;

      if (mountedRef.current) {
        setDownloading(null);
      }
    }
  };

  const recommendation =
    data?.recommendations.find(
      (item) => item.value === 'YES'
    );

  const totalIncludingLegacy = data
    ? Number(data.total || 0) +
      Number(data.legacyTotal || 0)
    : 0;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>
              ADMINISTRADOR TUTOR
            </span>

            <h1>Encuestas del curso</h1>

            <p>
              Consulta las opiniones de los
              participantes y descarga los reportes
              individuales o el reporte general del curso.
            </p>
          </div>

          <FiBarChart2
            className={styles.heroIcon}
            aria-hidden="true"
          />
        </header>

        <section className={styles.panel}>
          <label
            className={styles.selector}
            htmlFor="survey-course"
          >
            <span>Selecciona el curso</span>

            <select
              id="survey-course"
              value={courseId}
              onChange={changeCourse}
              disabled={
                coursesLoading ||
                downloading !== null
              }
            >
              <option value="">
                {coursesLoading
                  ? 'Consultando cursos…'
                  : 'Escoge un curso'}
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.name}

                  {course.status === false
                    ? ' — Inactivo'
                    : ''}
                </option>
              ))}
            </select>
          </label>

          {coursesError && (
            <div
              className={styles.error}
              role="alert"
            >
              <p>{coursesError}</p>

              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  setCoursesRetry(
                    (current) => current + 1
                  )
                }
              >
                Reintentar
              </button>
            </div>
          )}
        </section>

        {downloadError && (
          <p
            className={styles.error}
            role="alert"
          >
            {downloadError}
          </p>
        )}

        {downloadNotice && (
          <p
            className={styles.description}
            role="status"
          >
            {downloadNotice}
          </p>
        )}

        {!courseId && !coursesLoading && (
          <section className={styles.empty}>
            <FiBarChart2 aria-hidden="true" />

            <h2>
              Consulta la opinión de los participantes
            </h2>

            <p>
              Selecciona un curso para ver sus resultados.
            </p>
          </section>
        )}

        {loading && (
          <section
            className={styles.panel}
            role="status"
          >
            Consultando resultados…
          </section>
        )}

        {error && (
          <section className={styles.panel}>
            <p
              className={styles.error}
              role="alert"
            >
              {error}
            </p>

            <button
              type="button"
              className={styles.primary}
              onClick={() =>
                setRetry((current) => current + 1)
              }
            >
              Reintentar
            </button>
          </section>
        )}

        {data && !loading && (
          <>
            <div className={styles.toolbar}>
              <h2>{data.course.name}</h2>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={downloading !== null}
                  onClick={() => {
                    setDownloadError('');
                    setDownloadNotice('');
                    setRetry((current) => current + 1);
                  }}
                >
                  <FiRefreshCw aria-hidden="true" />
                  Actualizar
                </button>

                <button
                  type="button"
                  className={styles.primary}
                  disabled={
                    downloading !== null ||
                    totalIncludingLegacy === 0
                  }
                  onClick={() => downloadReport()}
                >
                  <FiDownload aria-hidden="true" />

                  {downloading === 'general'
                    ? 'Generando reporte…'
                    : 'Descargar reporte general'}
                </button>
              </div>
            </div>

            <p className={styles.description}>
              El reporte general incluye todas las
              respuestas del curso, no solamente las
              que aparecen en esta página.
            </p>

            {data.legacyTotal > 0 && (
              <section className={styles.panel}>
                <p className={styles.description}>
                  Hay {data.legacyTotal} respuestas
                  del formulario anterior conservadas.
                  Se incluyen en una sección separada
                  del reporte general.
                </p>
              </section>
            )}

            <div className={styles.stats}>
              <article className={styles.stat}>
                <FiUsers aria-hidden="true" />

                <div>
                  <span>
                    Participantes que respondieron
                    esta versión
                  </span>

                  <strong>{data.total}</strong>
                </div>
              </article>

              <article className={styles.stat}>
                <FiStar aria-hidden="true" />

                <div>
                  <span>
                    Satisfacción general · Pregunta 4
                  </span>

                  <strong>
                    {averageLabel(
                      data.satisfactionAverage
                    )}
                  </strong>
                </div>
              </article>

              <article className={styles.stat}>
                <FiThumbsUp aria-hidden="true" />

                <div>
                  <span>Recomendarían el curso</span>

                  <strong>
                    {data.total > 0
                      ? `${recommendation?.percentage ?? 0} %`
                      : 'Sin respuestas'}
                  </strong>
                </div>
              </article>
            </div>

            {data.total === 0 ? (
              <section className={styles.empty}>
                <h2>
                  Todavía no hay respuestas de esta versión
                </h2>

                <p>
                  Aquí aparecerán las opiniones cuando
                  los participantes envíen la encuesta
                  actualizada.
                </p>
              </section>
            ) : (
              <>
                <section className={styles.panel}>
                  <h2>Valoración por pregunta</h2>

                  <p className={styles.description}>
                    Preguntas 1 a 3: 1 = Nada;
                    2 = Poco; 3 = Moderadamente;
                    4 = Bastante; 5 = Mucho.
                  </p>

                  <p className={styles.description}>
                    Pregunta 4: 1 = Muy insatisfecho/a;
                    2 = Insatisfecho/a;
                    3 = Ni satisfecho/a ni insatisfecho/a;
                    4 = Satisfecho/a;
                    5 = Muy satisfecho/a.
                  </p>

                  <div className={styles.questions}>
                    {data.questions.map(
                      (question, index) => (
                        <article
                          className={styles.question}
                          key={question.key}
                        >
                          <div
                            className={styles.questionHeader}
                          >
                            <h3>
                              {index + 1}. {question.text}
                            </h3>

                            <strong
                              className={styles.average}
                            >
                              {averageLabel(
                                question.average
                              )}
                            </strong>
                          </div>

                          <div
                            className={styles.distribution}
                          >
                            {question.distribution.map(
                              (item) => (
                                <div
                                  className={styles.barRow}
                                  key={item.value}
                                >
                                  <span
                                    title={item.label}
                                    aria-label={
                                      `${item.value}: ${item.label}`
                                    }
                                  >
                                    Valor {item.value}
                                  </span>

                                  <div
                                    className={styles.track}
                                    aria-hidden="true"
                                  >
                                    <div
                                      className={styles.fill}
                                      style={{
                                        width: `${item.percentage}%`,
                                      }}
                                    />
                                  </div>

                                  <span>
                                    {item.count}
                                    {' · '}
                                    {item.percentage} %
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </section>

                <section className={styles.panel}>
                  <h2>
                    5. ¿Recomendarías este curso a
                    otras personas?
                  </h2>

                  <div
                    className={styles.recommendations}
                  >
                    {data.recommendations.map((item) => (
                      <article
                        className={styles.recommendation}
                        key={item.value}
                      >
                        <span>{item.label}</span>

                        <strong>
                          {item.percentage} %
                        </strong>

                        <small>
                          {item.count}
                          {' '}
                          {item.count === 1
                            ? 'respuesta'
                            : 'respuestas'}
                        </small>
                      </article>
                    ))}
                  </div>
                </section>

                <section className={styles.panel}>
                  <h2>Respuestas individuales</h2>

                  <p className={styles.description}>
                    Consulta las respuestas de cada
                    participante o descarga su reporte PDF.
                  </p>

                  <div className={styles.responses}>
                    {data.responses.map((response) => (
                      <article
                        className={styles.response}
                        key={response.id}
                      >
                        <div
                          className={styles.responseHeader}
                        >
                          <div>
                            <h3>
                              {response.participant.name}
                            </h3>

                            <p>
                              {response.participant.email}
                            </p>

                            <time
                              dateTime={response.createdAt}
                            >
                              {dateLabel(
                                response.createdAt
                              )}
                            </time>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '10px',
                            }}
                          >
                            <button
                              type="button"
                              className={styles.secondary}
                              aria-expanded={
                                opened === response.id
                              }
                              aria-controls={
                                `survey-response-${response.id}`
                              }
                              onClick={() =>
                                setOpened((current) =>
                                  current === response.id
                                    ? null
                                    : response.id
                                )
                              }
                            >
                              {opened === response.id
                                ? 'Ocultar respuesta'
                                : 'Ver respuesta'}
                            </button>

                            <button
                              type="button"
                              className={styles.primary}
                              disabled={downloading !== null}
                              onClick={() =>
                                downloadReport(response)
                              }
                            >
                              <FiDownload
                                aria-hidden="true"
                              />

                              {downloading ===
                              `individual-${response.id}`
                                ? 'Generando PDF…'
                                : 'Descargar reporte individual'}
                            </button>
                          </div>
                        </div>

                        {opened === response.id && (
                          <div
                            id={
                              `survey-response-${response.id}`
                            }
                            className={styles.detail}
                          >
                            <dl className={styles.answerList}>
                              {data.questions.map(
                                (question, index) => (
                                  <div key={question.key}>
                                    <dt>
                                      {index + 1}.
                                      {' '}
                                      {question.text}
                                    </dt>

                                    <dd
                                      style={{
                                        whiteSpace: 'normal',
                                        flexShrink: 1,
                                        maxWidth: '45%',
                                        textAlign: 'right',
                                        overflowWrap: 'anywhere',
                                      }}
                                    >
                                      {answerLabel(
                                        question,
                                        response.answers
                                      )}
                                    </dd>
                                  </div>
                                )
                              )}

                              <div>
                                <dt>
                                  5. ¿Recomendarías este
                                  curso a otras personas?
                                </dt>

                                <dd>
                                  {RECOMMENDATION_LABELS[
                                    response.recommendation
                                  ] || 'Sin respuesta'}
                                </dd>
                              </div>
                            </dl>

                            <div className={styles.comment}>
                              <h4>
                                6. ¿Qué fue lo que más
                                te gustó del curso?
                              </h4>

                              <p>
                                {response.liked ||
                                  'No escribió un comentario.'}
                              </p>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>

                  <nav
                    className={styles.pagination}
                    aria-label="Páginas de respuestas"
                  >
                    <button
                      type="button"
                      className={styles.secondary}
                      disabled={
                        page <= 1 ||
                        downloading !== null
                      }
                      onClick={() =>
                        setPage((current) => current - 1)
                      }
                    >
                      Anterior
                    </button>

                    <span>
                      Página {data.page} de
                      {' '}
                      {data.totalPages}
                    </span>

                    <button
                      type="button"
                      className={styles.secondary}
                      disabled={
                        page >= data.totalPages ||
                        downloading !== null
                      }
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                    >
                      Siguiente
                    </button>
                  </nav>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}