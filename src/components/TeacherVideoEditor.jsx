import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FiEdit2,
  FiSave,
  FiX,
} from 'react-icons/fi';

import { api } from '../services/api';

import styles from '../pages/TeacherDashboard.module.css';

const TeacherVideoEditor = ({ video }) => {
  const [current, setCurrent] = useState(video);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] =
    useState(video.title || '');

  const [description, setDescription] =
    useState(video.description || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const savingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startEditing = () => {
    setTitle(current.title || '');
    setDescription(current.description || '');
    setError('');
    setMessage('');
    setEditing(true);
  };

  const save = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;

    setError('');
    setMessage('');

    if (!title.trim()) {
      setError('Ingresa el título del video.');
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const updated = await api.put(
        `/videos/${current.id}/content`,
        {
          title: title.trim(),
          description: description.trim(),
        }
      );

      if (!mountedRef.current) return;

      setCurrent((previous) => ({
        ...previous,
        ...updated,
      }));

      setEditing(false);
      setMessage(
        'Información del video actualizada.'
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          requestError.message ||
            'No se pudo actualizar el video.'
        );
      }
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  return (
    <article className={styles.videoResource}>
      {message && (
        <p
          className={styles.success}
          role="status"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className={styles.error}
          role="alert"
        >
          {error}
        </p>
      )}

      {editing ? (
        <form
          className={styles.form}
          onSubmit={save}
          aria-busy={saving}
        >
          <label>
            Título del video

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              maxLength={255}
              disabled={saving}
              required
            />
          </label>

          <label>
            Descripción del video

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              maxLength={20000}
              disabled={saving}
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
                ? 'Guardando…'
                : 'Guardar cambios'}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setError('');
              }}
            >
              <FiX aria-hidden="true" />
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <h4 className={styles.resourceTitle}>
            {current.title}
          </h4>

          <p className={styles.description}>
            {current.description ||
              'Sin descripción registrada.'}
          </p>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={startEditing}
          >
            <FiEdit2 aria-hidden="true" />
            Editar video
          </button>
        </>
      )}
    </article>
  );
};

export default TeacherVideoEditor;