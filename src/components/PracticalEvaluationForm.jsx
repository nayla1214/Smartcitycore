import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const fields = [
  [
    'space',
    'Espacio elegido',
    'Nombre o descripción del lugar.',
  ],
  [
    'problem',
    'Problema observado',
    'Una dificultad de acceso, seguridad, uso o conexión.',
  ],
  [
    'people',
    'Personas afectadas',
    '¿Quiénes encuentran esa dificultad?',
  ],
  [
    'proposal',
    'Propuesta',
    'Dos cambios concretos para mejorar el espacio.',
  ],
  [
    'participation',
    'Participación',
    '¿Cómo consultarías a quienes lo utilizan?',
  ],
  [
    'result',
    'Resultado',
    '¿Cómo comprobarías si los cambios funcionaron?',
  ],
];

const emptyAnswers = () =>
  Object.fromEntries(
    fields.map(([key]) => [key, ''])
  );

const endpoint = '/evaluations/practical/2.3';

const box = {
  padding: '1.25rem',
  border: '1px solid #dbe5f5',
  borderRadius: '16px',
  marginTop: '1rem',
};

const imageStyle = {
  display: 'block',
  maxWidth: '100%',
  maxHeight: '360px',
  objectFit: 'contain',
  borderRadius: '12px',
  marginTop: '1rem',
};

const PracticalEvaluationForm = ({
  courseId = 1,
  onSuccess,
}) => {
  const [answers, setAnswers] = useState(emptyAnswers);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [readingImage, setReadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const fileVersion = useRef(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    api
      .get(endpoint)
      .then((data) => {
        if (active) {
          setResult(data?.passed ? data : null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.message ||
              'No se pudo consultar la actividad.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [retry]);

  const selectImage = async (event) => {
    const file = event.target.files?.[0];
    const version = ++fileVersion.current;

    setImageDataUrl('');
    setError('');
    setReadingImage(false);

    if (!file) return;

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (
      !validTypes.includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError(
        'Elige una imagen JPG, PNG o WEBP de hasta 2 MB.'
      );

      event.target.value = '';
      return;
    }

    setReadingImage(true);

    try {
      const data = await new Promise(
        (resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            resolve(reader.result);
          };

          reader.onerror = () => {
            reject(
              new Error('No se pudo leer la imagen.')
            );
          };

          reader.readAsDataURL(file);
        }
      );

      if (version === fileVersion.current) {
        setImageDataUrl(data);
      }
    } catch (err) {
      if (version === fileVersion.current) {
        setError(err.message);
      }
    } finally {
      if (version === fileVersion.current) {
        setReadingImage(false);
      }
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    if (submitting || readingImage) return;

    setError('');

    const hasEmptyAnswers = fields.some(
      ([key]) => !answers[key].trim()
    );

    if (hasEmptyAnswers || !imageDataUrl) {
      setError(
        'Completa las seis respuestas y adjunta una imagen del lugar.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const data = await api.post(endpoint, {
        answers,
        imageDataUrl,
      });

      if (
        data?.passed !== true ||
        !data?.submission
      ) {
        throw new Error(
          'No se confirmó el guardado de la actividad.'
        );
      }

      setResult(data);

      if (onSuccess) {
        try {
          await onSuccess(data);
        } catch (err) {
          console.error(
            'Error actualizando el estado del tema:',
            err
          );
        }
      }
    } catch (err) {
      setError(
        err.message ||
          'No se pudo guardar. Tus respuestas permanecen en el formulario.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando tu actividad...</p>;
  }

  return (
    <div>
      {error && (
        <p
          role="alert"
          style={{ color: '#b91c1c' }}
        >
          {error}
        </p>
      )}

      {!result && error && (
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() =>
            setRetry((value) => value + 1)
          }
        >
          Volver a consultar mi entrega
        </button>
      )}

      {result?.passed ? (
        <>
          <div
            role="status"
            style={{
              ...box,
              background: '#f0f5ff',
            }}
          >
            <strong>
              ✓ Aprobaste el tema 2.3 — 10/10 puntos
              (100 %)
            </strong>

            <p>
              Tu actividad y la imagen quedaron guardadas.
            </p>

           <div
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1rem',
  }}
>
  <Link
    className="btn btn-primary"
    to="/module/3/topic/3.1"
  >
    Tema 3.1 →
  </Link>

  <Link
    className="btn btn-outline-primary"
    to={`/course/${courseId}`}
  >
    Volver al curso
  </Link>
</div>
          </div>

          <h3 style={{ marginTop: '1.5rem' }}>
            Tu entrega
          </h3>

          {fields.map(([key, label]) => (
            <div key={key} style={box}>
              <strong>{label}</strong>

              <p
                style={{
                  whiteSpace: 'pre-wrap',
                }}
              >
                {result.submission.answers[key]}
              </p>
            </div>
          ))}

          <img
            src={result.submission.imageDataUrl}
            alt="Lugar elegido en tu evaluación práctica"
            style={imageStyle}
          />
        </>
      ) : (
        <form onSubmit={submit}>
          <p>
            Elige un espacio público de tu localidad.
            Explica cómo hacerlo más accesible, seguro
            e inclusivo.
          </p>

          <p>
            <strong>
              Completa los seis apartados y adjunta una
              imagen para obtener 10/10 puntos (100 %).
            </strong>
          </p>

          <fieldset
            disabled={submitting}
            style={{
              border: 0,
              padding: 0,
              minWidth: 0,
            }}
          >
            {fields.map(([key, label, hint]) => (
              <div key={key} style={box}>
                <label
                  htmlFor={`practical23-${key}`}
                >
                  <strong>{label}</strong>
                </label>

                <p id={`hint23-${key}`}>
                  {hint}
                </p>

                <textarea
                  id={`practical23-${key}`}
                  required
                  maxLength={2000}
                  rows={3}
                  aria-describedby={`hint23-${key}`}
                  value={answers[key]}
                  onChange={(event) =>
                    setAnswers((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }))
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    font: 'inherit',
                  }}
                />
              </div>
            ))}

            <div style={box}>
              <label htmlFor="practical23-image">
                <strong>
                  Imagen del lugar elegido — obligatoria
                </strong>
              </label>

              <p>
                Selecciona una fotografía JPG, PNG
                o WEBP de hasta 2 MB.
              </p>

              <input
                id="practical23-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectImage}
                required
              />

              {readingImage && (
                <p>Preparando imagen...</p>
              )}

              {imageDataUrl && (
                <img
                  src={imageDataUrl}
                  alt="Vista previa del lugar elegido"
                  style={imageStyle}
                />
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={readingImage || submitting}
            >
              {submitting
                ? 'Guardando actividad...'
                : 'Enviar actividad →'}
            </button>
          </fieldset>
        </form>
      )}
    </div>
  );
};

export default PracticalEvaluationForm;