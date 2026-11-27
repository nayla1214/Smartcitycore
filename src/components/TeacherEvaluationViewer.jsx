import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { api } from '../services/api';

import styles from '../pages/TeacherDashboard.module.css';

const FORMAT_NAMES = {
  multiple_choice: 'Opción múltiple',
  mixed: 'Actividades mixtas',
  practical: 'Actividad práctica',
  empty: 'Sin preguntas registradas',
};

const ACTIVITY_NAMES = {
  true_false: 'Verdadero o falso',
  fill_blanks: 'Completar espacios',
  matching: 'Relacionar elementos',
  ordering: 'Ordenar elementos',
  case_study: 'Caso de estudio',
};

const formatScore = (score) =>
  (Number(score) / 10).toLocaleString(
    'es-EC',
    { maximumFractionDigits: 2 }
  );

const formatDate = (value) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : date.toLocaleString('es-EC');
};

const TeacherEvaluationViewer = ({
  evaluation,
}) => {
  const [view, setView] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const headingRef = useRef(null);

  useEffect(() => {
    if (!view) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      setData(null);

      try {
        const path =
          view === 'results'
            ? `/teacher-evaluations/${evaluation.id}/results?page=${page}`
            : `/teacher-evaluations/${evaluation.id}`;

        const response = await api.get(path);

        if (active) {
          setData(response);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudo consultar la evaluación.'
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
  }, [
    evaluation.id,
    view,
    page,
    retry,
  ]);

  useEffect(() => {
    if (view) {
      headingRef.current?.focus();
    }
  }, [view]);

  const openView = (nextView) => {
    setPage(1);
    setView(nextView);
  };

  return (
    <article className={styles.evaluationResource}>
      <h4 className={styles.resourceTitle}>
        {evaluation.title}
      </h4>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => openView('content')}
          aria-pressed={view === 'content'}
        >
          Consultar evaluación
        </button>

        <button
          type="button"
          className={styles.resultsButton}
          onClick={() => openView('results')}
          aria-pressed={view === 'results'}
        >
          Ver resultados
        </button>

        {view && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setView('')}
          >
            Cerrar
          </button>
        )}
      </div>

      {view && (
        <div className={styles.evaluationDetail}>
          <h5
            ref={headingRef}
            tabIndex={-1}
          >
            {view === 'content'
              ? 'Contenido de la evaluación'
              : 'Resultados de participantes'}
          </h5>

          {loading ? (
            <p role="status">
              Consultando información…
            </p>
          ) : error ? (
            <div
              className={styles.error}
              role="alert"
            >
              <p>{error}</p>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  setRetry(
                    (current) => current + 1
                  )
                }
              >
                Reintentar
              </button>
            </div>
          ) : data && view === 'content' ? (
            <>
              <span className={styles.badge}>
                {FORMAT_NAMES[data.format] ||
                  'Evaluación'}
              </span>

              <p className={styles.description}>
                {data.attemptsCount} intentos
                registrados.
              </p>

              {data.hasAttempts && (
                <p className={styles.editorHint}>
                  Esta evaluación ya tiene intentos.
                  Sus preguntas y puntuaciones deben
                  conservarse para mantener el historial
                  de los participantes.
                </p>
              )}

              {(data.questions || []).map(
                (question, index) => (
                  <section
                    key={question.id}
                    className={styles.questionPreview}
                  >
                    <h5>
                      {index + 1}. {question.text}
                    </h5>

                    <p className={styles.description}>
                      Valor: {question.score} puntos
                    </p>

                    <ul className={styles.optionList}>
                      {question.options.map((option) => (
                        <li
                          key={option.id}
                          className={
                            option.isCorrect
                              ? styles.correctOption
                              : undefined
                          }
                        >
                          {option.text}

                          {option.isCorrect && (
                            <strong>
                              {' — Respuesta correcta'}
                            </strong>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              )}

              {(data.activities || []).map(
                (activity, index) => (
                  <section
                    key={activity.id}
                    className={styles.questionPreview}
                  >
                    <span className={styles.badge}>
                      {ACTIVITY_NAMES[activity.type] ||
                        activity.type}
                    </span>

                    <h5>
                      {index + 1}. {activity.title}
                    </h5>

                    <p className={styles.description}>
                      {activity.instructions}
                    </p>

                    <p className={styles.description}>
                      Valor: {activity.score} puntos
                    </p>
                  </section>
                )
              )}

              {data.format === 'practical' && (
                <section
                  className={styles.questionPreview}
                >
                  <p className={styles.description}>
                    La actividad solicita seis respuestas
                    y una fotografía del espacio urbano.
                  </p>

                  <ol className={styles.optionList}>
                    {data.practicalFields.map(
                      (field) => (
                        <li key={field}>{field}</li>
                      )
                    )}
                  </ol>
                </section>
              )}

              {data.format === 'empty' && (
                <p className={styles.description}>
                  No hay preguntas ni actividades
                  registradas para consultar.
                </p>
              )}
            </>
          ) : data && view === 'results' ? (
            <>
              <p className={styles.description}>
                {data.total} intentos registrados.
                Las notas se muestran sobre 10.
              </p>

              {data.attempts.length ? (
                <div className={styles.resultsTable}>
                  <table>
                    <caption>
                      Intentos de la evaluación
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">
                          Participante
                        </th>
                        <th scope="col">Nota</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Fecha</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.attempts.map((attempt) => (
                        <tr key={attempt.id}>
                          <th scope="row">
                            {attempt.participantName}
                          </th>

                          <td>
                            {formatScore(attempt.score)}
                            /10
                          </td>

                          <td>
                            {attempt.passed
                              ? 'Aprobada'
                              : 'No aprobada'}
                          </td>

                          <td>
                            {formatDate(
                              attempt.attemptedAt
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.description}>
                  Todavía no hay intentos registrados.
                </p>
              )}

              {data.totalPages > 1 && (
                <nav
                  className={styles.actions}
                  aria-label="Páginas de resultados"
                >
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={page <= 1}
                    onClick={() =>
                      setPage(
                        (current) => current - 1
                      )
                    }
                  >
                    Anterior
                  </button>

                  <span>
                    Página {page} de{' '}
                    {data.totalPages}
                  </span>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={
                      page >= data.totalPages
                    }
                    onClick={() =>
                      setPage(
                        (current) => current + 1
                      )
                    }
                  >
                    Siguiente
                  </button>
                </nav>
              )}
            </>
          ) : null}
        </div>
      )}
    </article>
  );
};

export default TeacherEvaluationViewer;