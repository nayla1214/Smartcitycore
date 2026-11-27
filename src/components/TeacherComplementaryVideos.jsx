import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FiPlus,
  FiSave,
  FiX,
  FiExternalLink,
} from 'react-icons/fi';

import { api } from '../services/api';

import styles from '../pages/TeacherDashboard.module.css';

const TeacherComplementaryVideos = ({
  moduleId,
}) => {
  const [videos, setVideos] = useState([]);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);

  const [form, setForm] = useState({
    topicNumber: '',
    title: '',
    description: '',
    url: '',
  });

  const [editingVideoId, setEditingVideoId] =
    useState(null);

  const [targetTopic, setTargetTopic] =
    useState('');

  const savingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [
          videoData,
          topicData,
        ] = await Promise.all([
          api.get(
            `/complementary-videos/module/${moduleId}`
          ),
          api.get(
            `/modules/${moduleId}/topics`
          ),
        ]);

        if (
          !Array.isArray(videoData) ||
          !Array.isArray(topicData)
        ) {
          throw new Error(
            'No se pudieron consultar los recursos y temas.'
          );
        }

        if (!active) return;

        setVideos(videoData);

        setTopics(
          [...topicData].sort((first, second) =>
            String(first.topicNumber).localeCompare(
              String(second.topicNumber),
              'es',
              { numeric: true }
            )
          )
        );
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar los recursos.'
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
  }, [moduleId, retry]);

  const changeField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const save = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;

    setError('');
    setMessage('');

    if (
      !form.topicNumber ||
      !form.title.trim() ||
      !form.url.trim()
    ) {
      setError(
        'Selecciona el tema y completa el título y el enlace.'
      );
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const created = await api.post(
        `/complementary-videos/module/${moduleId}`,
        {
          topicNumber: form.topicNumber,
          title: form.title.trim(),
          description:
            form.description.trim(),
          url: form.url.trim(),
        }
      );

      if (!mountedRef.current) return;

      setVideos((current) => [
        ...current,
        created,
      ]);

      setForm({
        topicNumber: '',
        title: '',
        description: '',
        url: '',
      });

      setAdding(false);

      setMessage(
        `Video agregado al tema ${created.topicNumber}.`
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          requestError.message ||
            'No se pudo agregar el video.'
        );
      }
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  const saveTopic = async (event) => {
    event.preventDefault();

    if (
      savingRef.current ||
      !editingVideoId ||
      !targetTopic
    ) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updated = await api.put(
        `/complementary-videos/${editingVideoId}/topic`,
        { topicNumber: targetTopic }
      );

      if (!mountedRef.current) return;

      setVideos((current) =>
        current.map((video) =>
          Number(video.id) === Number(updated.id)
            ? updated
            : video
        )
      );

      setEditingVideoId(null);
      setTargetTopic('');

      setMessage(
        `El video ahora pertenece al tema ${updated.topicNumber}.`
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          requestError.message ||
            'No se pudo cambiar el tema.'
        );
      }
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  const topicOptions = topics.map((topic) => (
    <option
      key={topic.id ?? topic.topicNumber}
      value={String(topic.topicNumber)}
    >
      Tema {topic.topicNumber}
      {' — '}
      {topic.title}
    </option>
  ));

  return (
    <section className={styles.resourceSection}>
      <div className={styles.resourceHeading}>
        <h3>Videos complementarios</h3>
        <span>{videos.length}</span>
      </div>

      <p className={styles.description}>
        Selecciona el tema al que pertenece cada
        video. Son recursos opcionales y no cambian
        el avance ni el certificado.
      </p>

      {message && (
        <p
          className={styles.success}
          role="status"
        >
          {message}
        </p>
      )}

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          <p>{error}</p>

          <button
            type="button"
            className={styles.secondaryButton}
            disabled={loading || saving}
            onClick={() =>
              setRetry((current) => current + 1)
            }
          >
            Actualizar lista
          </button>
        </div>
      )}

      {loading ? (
        <p role="status">
          Consultando recursos y temas…
        </p>
      ) : (
        <>
          {!topics.length && (
            <p className={styles.editorHint}>
              El administrador debe registrar los
              temas del módulo antes de agregar
              videos complementarios.
            </p>
          )}

          {adding ? (
            <form
              className={`${styles.form} ${styles.complementaryForm}`}
              onSubmit={save}
              aria-busy={saving}
            >
              <h4>Nuevo video complementario</h4>

              <label>
                Tema del video

                <select
                  name="topicNumber"
                  value={form.topicNumber}
                  onChange={changeField}
                  disabled={saving}
                  required
                >
                  <option value="">
                    Selecciona un tema
                  </option>

                  {topicOptions}
                </select>
              </label>

              <label>
                Título

                <input
                  name="title"
                  value={form.title}
                  onChange={changeField}
                  maxLength={255}
                  disabled={saving}
                  required
                />
              </label>

              <label>
                Descripción

                <textarea
                  name="description"
                  value={form.description}
                  onChange={changeField}
                  rows={4}
                  maxLength={20000}
                  disabled={saving}
                />
              </label>

              <label>
                Enlace de YouTube

                <input
                  name="url"
                  type="url"
                  value={form.url}
                  onChange={changeField}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={saving}
                  required
                />
              </label>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving}
                >
                  <FiSave aria-hidden="true" />
                  {saving
                    ? 'Agregando…'
                    : 'Guardar video'}
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={saving}
                  onClick={() => {
                    setAdding(false);
                    setError('');
                  }}
                >
                  <FiX aria-hidden="true" />
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={
                  saving ||
                  !topics.length ||
                  editingVideoId !== null
                }
                onClick={() => {
                  setAdding(true);
                  setError('');
                  setMessage('');
                }}
              >
                <FiPlus aria-hidden="true" />
                Agregar video complementario
              </button>
            </div>
          )}

          <div className={styles.complementaryList}>
            {videos.map((video) => (
              <article
                key={video.id}
                className={styles.videoResource}
              >
                <span className={styles.badge}>
                  {video.topicNumber
                    ? `Tema ${video.topicNumber} · Opcional`
                    : 'Pendiente de asignar tema'}
                </span>

                <h4 className={styles.resourceTitle}>
                  {video.title}
                </h4>

                {video.description && (
                  <p className={styles.description}>
                    {video.description}
                  </p>
                )}

                {editingVideoId === video.id ? (
                  <form
                    className={styles.form}
                    onSubmit={saveTopic}
                    aria-busy={saving}
                  >
                    <label>
                      Tema de destino

                      <select
                        value={targetTopic}
                        onChange={(event) =>
                          setTargetTopic(
                            event.target.value
                          )
                        }
                        disabled={saving}
                        required
                      >
                        <option value="">
                          Selecciona un tema
                        </option>

                        {topicOptions}
                      </select>
                    </label>

                    <div className={styles.actions}>
                      <button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={saving}
                      >
                        {saving
                          ? 'Guardando…'
                          : 'Guardar tema'}
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={saving}
                        onClick={() =>
                          setEditingVideoId(null)
                        }
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.actions}>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.primaryButton}
                    >
                      <FiExternalLink aria-hidden="true" />
                      Ver video
                    </a>

                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled={
                        saving ||
                        adding ||
                        !topics.length ||
                        editingVideoId !== null
                      }
                      onClick={() => {
                        setEditingVideoId(video.id);
                        setTargetTopic(
                          video.topicNumber || ''
                        );
                        setError('');
                        setMessage('');
                      }}
                    >
                      {video.topicNumber
                        ? 'Cambiar tema'
                        : 'Asignar tema'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {!videos.length && (
            <p className={styles.description}>
              Todavía no hay videos complementarios.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default TeacherComplementaryVideos;