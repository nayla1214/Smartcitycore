import {
  useEffect,
  useState,
} from 'react';

import {
  FiPlayCircle,
  FiExternalLink,
  FiChevronDown,
} from 'react-icons/fi';

import { api } from '../services/api';

import styles from './ComplementaryVideos.module.css';

const ComplementaryVideos = ({
  moduleId,
  topicNumber,
}) => {
  const [open, setOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!open) return;

    let active = true;

    const loadVideos = async () => {
      setLoading(true);
      setError('');
      setVideos([]);

      try {
        if (
          !moduleId ||
          topicNumber === undefined ||
          topicNumber === null ||
          String(topicNumber).trim() === ''
        ) {
          throw new Error(
            'No se pudo identificar el tema de estos recursos.'
          );
        }

        const data = await api.get(
          `/complementary-videos/module/${encodeURIComponent(
            moduleId
          )}?topicNumber=${encodeURIComponent(
            topicNumber
          )}`
        );

        if (!Array.isArray(data)) {
          throw new Error(
            'La lista de recursos no es válida.'
          );
        }

        if (active) {
          setVideos(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar los videos complementarios.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadVideos();

    return () => {
      active = false;
    };
  }, [
    moduleId,
    topicNumber,
    open,
    retry,
  ]);

  const panelId =
    `complementary-videos-${moduleId}-${topicNumber}`;

  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <span
          className={styles.icon}
          aria-hidden="true"
        >
          <FiPlayCircle />
        </span>

        <span className={styles.heading}>
          <strong>
            Videos complementarios del tema{' '}
            {topicNumber}
          </strong>

          <span>
            Recursos opcionales para ampliar
            tus conocimientos.
          </span>
        </span>

        <FiChevronDown
          aria-hidden="true"
          className={`${styles.chevron} ${
            open ? styles.rotated : ''
          }`}
        />
      </button>

      <div
        id={panelId}
        className={styles.panel}
        hidden={!open}
        aria-busy={open && loading}
      >
        <p className={styles.notice}>
          Estos videos son opcionales. No modifican
          tu porcentaje de avance ni los requisitos
          del certificado.
        </p>

        {loading ? (
          <p role="status">
            Consultando recursos…
          </p>
        ) : error ? (
          <div
            className={styles.error}
            role="alert"
          >
            <p>{error}</p>

            <button
              type="button"
              className={styles.retry}
              onClick={() =>
                setRetry(
                  (current) => current + 1
                )
              }
            >
              Reintentar
            </button>
          </div>
        ) : videos.length ? (
          <div className={styles.grid}>
            {videos.map((video) => {
              const validYoutubeId =
                typeof video.youtubeId === 'string' &&
                /^[a-zA-Z0-9_-]{11}$/.test(
                  video.youtubeId
                );

              return (
                <article
                  key={video.id}
                  className={styles.card}
                >
                  <span className={styles.badge}>
                    Complementario · Opcional
                  </span>

                  <h3>{video.title}</h3>

                  {video.description && (
                    <p>{video.description}</p>
                  )}

                  {validYoutubeId ? (
                    <a
                      href={
                        `https://www.youtube.com/watch?v=${video.youtubeId}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.watchButton}
                      aria-label={
                        `Ver ${video.title} en YouTube; se abre en otra pestaña`
                      }
                    >
                      <FiPlayCircle aria-hidden="true" />
                      Ver en YouTube
                      <FiExternalLink aria-hidden="true" />
                    </a>
                  ) : (
                    <p>
                      El enlace de este video no está
                      disponible. Comunícate con el docente.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className={styles.empty}>
            Todavía no se han agregado videos
            complementarios al tema {topicNumber}.
          </p>
        )}
      </div>
    </section>
  );
};

export default ComplementaryVideos;