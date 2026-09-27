import { useEffect, useState } from 'react';
import { api } from '../services/api';
import styles from './Evaluation.module.css';

const EvaluationForm = ({ evaluationId, onSuccess }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setEvaluation(null);
    setAnswers({});
    setResult(null);
    setError('');
    setLoading(true);

    const loadEvaluation = async () => {
      try {
        const data = await api.get(
          `/evaluations/${evaluationId}`
        );

        if (!active) return;

        const questions =
          data?.Questions || data?.questions || [];

        if (questions.length === 0) {
          setError(
            'La API no devolvió preguntas para esta evaluación.'
          );
        }

        setEvaluation(data);
      } catch (err) {
        if (active) {
          setError(
            err.message || 'No se pudo cargar la evaluación.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEvaluation();

    return () => {
      active = false;
    };
  }, [evaluationId]);

  const questions =
    evaluation?.Questions || evaluation?.questions || [];

  const handleOptionChange = (questionId, optionId) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (questions.length === 0) {
      setError('No hay preguntas disponibles para enviar.');
      return;
    }

    if (
      questions.some(
        (question) => answers[question.id] === undefined
      )
    ) {
      setError('Responde todas las preguntas antes de enviar.');
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = questions.map((question) => ({
        questionId: question.id,
        optionId: answers[question.id],
      }));

      const response = await api.post(
        `/evaluations/${evaluationId}/submit`,
        { answers: formattedAnswers }
      );

      setResult(response);
    } catch (err) {
      setError(
        err.message || 'No se pudieron guardar tus respuestas.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando preguntas...</p>;
  }

  if (!evaluation) {
    return (
      <p role="alert">
        {error || 'Evaluación no disponible.'}
      </p>
    );
  }

  return (
    <div className={styles.evalContainer}>
      <h3>{evaluation.title}</h3>

      {error && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {result ? (
        <>
          <div
            role="status"
            style={{
              padding: '1.25rem',
              margin: '1rem 0 1.5rem',
              borderRadius: '0.8rem',
              background: result.passed
                ? '#edf9f1'
                : '#fff3f0',
              color: result.passed
                ? '#176342'
                : '#9a392b',
            }}
          >
            <strong>
              Nota: {Number(result.earnedScore).toFixed(0)}
              /{Number(result.maximumScore).toFixed(0)}
              {' '}puntos
              {' '}({Number(result.percentage).toFixed(0)}%).
            </strong>

            <p>
              {result.passed
                ? '¡Aprobaste!'
                : 'Aún no aprobaste. Revisa tus respuestas y vuelve a intentarlo.'}
            </p>
          </div>

          <section aria-label="Revisión de respuestas">
            <h4>Revisión de tus respuestas</h4>

            {(result.review || []).map((item, index) => (
              <div
                key={item.questionId}
                style={{
                  padding: '1rem 1.2rem',
                  marginBottom: '0.85rem',
                  borderRadius: '0.8rem',
                  border: item.correct
                    ? '1px solid #cce8d6'
                    : '1px solid #f2d5cd',
                  background: item.correct
                    ? '#f5fbf7'
                    : '#fff8f5',
                }}
              >
                <strong>
                  {index + 1}. {item.question}
                </strong>

                <p>
                  {item.correct ? '✓ ' : '✕ '}
                  Tu respuesta: {item.selectedAnswer}
                </p>

                {!item.correct && (
                  <p>
                    <strong>
                      Respuesta correcta: {item.correctAnswer}
                    </strong>
                  </p>
                )}

                <small>
                  {item.pointsEarned}/{item.pointsPossible}
                  {' '}puntos
                </small>
              </div>
            ))}
          </section>

          {result.passed ? (
            <button
              type="button"
              className="btn btn-primary mt-4"
              onClick={() => onSuccess?.(result)}
            >
              Terminar revisión →
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary mt-4"
              onClick={() => {
                setResult(null);
                setAnswers({});
                setError('');
              }}
            >
              Intentar nuevamente →
            </button>
          )}
        </>
      ) : (
        questions.length > 0 && (
          <form onSubmit={handleSubmit}>
            {questions.map((question, index) => {
              const options =
                question.Options || question.options || [];

              return (
                <fieldset
                  key={question.id}
                  className={styles.questionBlock}
                >
                  <legend className={styles.questionText}>
                    {index + 1}. {question.text}
                  </legend>

                  <div className={styles.optionsList}>
                    {options.map((option) => (
                      <label
                        key={option.id}
                        className={styles.optionLabel}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={
                            String(answers[question.id]) ===
                            String(option.id)
                          }
                          onChange={() =>
                            handleOptionChange(
                              question.id,
                              option.id
                            )
                          }
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={submitting}
            >
              {submitting
                ? 'Enviando...'
                : 'Enviar respuestas'}
            </button>
          </form>
        )
      )}
    </div>
  );
};

export default EvaluationForm;