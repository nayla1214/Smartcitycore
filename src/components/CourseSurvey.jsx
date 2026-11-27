import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { api } from '../services/api';

import styles from './CourseSurvey.module.css';

const AGREEMENT_OPTIONS = [
  'Nada',
  'Poco',
  'Moderadamente',
  'Bastante',
  'Mucho',
];

const SATISFACTION_OPTIONS = [
  'Muy insatisfecho/a',
  'Insatisfecho/a',
  'Ni satisfecho/a ni insatisfecho/a',
  'Satisfecho/a',
  'Muy satisfecho/a',
];

const QUESTIONS = [
  {
    key: 'clarity',
    text: '¿Los contenidos del curso fueron claros y fáciles de comprender?',
    options: AGREEMENT_OPTIONS,
  },
  {
    key: 'activities',
    text: '¿Las actividades y evaluaciones estuvieron relacionadas con los contenidos del curso?',
    options: AGREEMENT_OPTIONS,
  },
  {
    key: 'usability',
    text: '¿La plataforma fue fácil de utilizar?',
    options: AGREEMENT_OPTIONS,
  },
  {
    key: 'satisfaction',
    text: '¿Qué tan satisfecho/a estás con el curso?',
    options: SATISFACTION_OPTIONS,
  },
];

function SurveyForm({ courseId }) {
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deferred, setDeferred] = useState(false);

  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState('');
  const [liked, setLiked] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const savingRef = useRef(false);
  const mountedRef = useRef(false);

  const endpoint = `/course-surveys/${courseId}/me`;

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

    const load = async () => {
      try {
        const data = await api.get(endpoint);

        if (!active) return;

        setEligible(data.eligible === true);
        setSubmitted(data.submitted === true);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudo consultar la encuesta.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [endpoint, retry]);

  const submit = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;

    const complete = QUESTIONS.every(
      ({ key }) =>
        Number.isInteger(answers[key]) &&
        answers[key] >= 1 &&
        answers[key] <= 5
    );

    if (!complete || !recommendation) {
      setError(
        'Responde las primeras cinco preguntas antes de enviar. El comentario final es opcional.'
      );

      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError('');

    try {
      await api.post(endpoint, {
        answers,
        recommendation,
        liked: liked.trim(),
      });

      if (mountedRef.current) {
        setSubmitted(true);
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          requestError.message ||
            'No se pudo enviar tu opinión. Intenta nuevamente.'
        );
      }
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <section className={styles.panel}>
        <p role="status">Consultando encuesta…</p>
      </section>
    );
  }

  if (submitted) {
    return (
      <section
        className={`${styles.panel} ${styles.success}`}
        role="status"
      >
        <span className={styles.eyebrow}>
          OPINIÓN REGISTRADA
        </span>

        <h2>¡Gracias por compartir tu experiencia!</h2>

        <p>
          Tu opinión nos ayudará a mejorar el curso y
          los recursos de SMARTCITYCORE.
        </p>

        <p>Puedes cerrar esta ventana para continuar.</p>
      </section>
    );
  }

  if (!eligible) {
    if (!error) return null;

    return (
      <section className={styles.panel}>
        <p className={styles.error} role="alert">
          {error}
        </p>

        <button
          type="button"
          className={styles.secondary}
          onClick={() => setRetry((value) => value + 1)}
        >
          Volver a consultar
        </button>
      </section>
    );
  }

  if (deferred) {
    return (
      <section className={styles.panel}>
        <h2>Tu opinión es importante</h2>

        <p>
          Puedes cerrar esta ventana y responder
          cuando vuelvas a la evaluación.
        </p>

        <button
          type="button"
          className={styles.primary}
          onClick={() => setDeferred(false)}
        >
          Responder encuesta
        </button>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>
          TU EXPERIENCIA CUENTA
        </span>

        <h2>Tu opinión sobre el curso</h2>

        <p>
          Selecciona la respuesta que mejor represente
          tu experiencia.
        </p>

     
      </header>

      <form onSubmit={submit}>
        <fieldset
          className={styles.fields}
          disabled={saving}
        >
          <legend className={styles.srOnly}>
            Encuesta de satisfacción del curso
          </legend>

          {QUESTIONS.map((question, index) => (
            <fieldset
              className={styles.question}
              key={question.key}
            >
              <legend>
                {index + 1}. {question.text}
              </legend>

              <div className={styles.recommendations}>
                {question.options.map((label, optionIndex) => {
                  const value = optionIndex + 1;

                  return (
                    <label
                      key={value}
                      className={styles.choice}
                    >
                      <input
                        type="radio"
                        name={`survey-${courseId}-${question.key}`}
                        required
                        value={value}
                        checked={
                          answers[question.key] === value
                        }
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.key]: value,
                          }))
                        }
                      />

                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <fieldset className={styles.question}>
            <legend>
              5. ¿Recomendarías este curso a otras personas?
            </legend>

            <div className={styles.recommendations}>
              {[
                ['YES', 'Sí'],
                ['MAYBE', 'Tal vez'],
                ['NO', 'No'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={styles.choice}
                >
                  <input
                    type="radio"
                    name={`survey-${courseId}-recommendation`}
                    required
                    value={value}
                    checked={recommendation === value}
                    onChange={() =>
                      setRecommendation(value)
                    }
                  />

                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.textField}>
            <span>
              6. ¿Qué fue lo que más te gustó del curso?
            </span>

            <small>Opcional · Hasta 2000 caracteres</small>

            <textarea
              rows={4}
              maxLength={2000}
              value={liked}
              onChange={(event) =>
                setLiked(event.target.value)
              }
              placeholder="Comparte lo que más valoraste…"
            />
          </label>
        </fieldset>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primary}
            disabled={saving}
          >
            {saving
              ? 'Enviando opinión…'
              : 'Enviar opinión'}
          </button>

          <button
            type="button"
            className={styles.secondary}
            disabled={saving}
            onClick={() => setDeferred(true)}
          >
            Responder después
          </button>
        </div>
      </form>
    </section>
  );
}

export default function CourseSurvey({ courseId = 1 }) {
  return (
    <SurveyForm
      key={courseId}
      courseId={courseId}
    />
  );
}