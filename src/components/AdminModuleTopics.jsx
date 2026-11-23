import {
  useContext,
  useEffect,
  useState,
} from 'react';

import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import styles from './AdminModuleTopics.module.css';

const AdminModuleTopics = ({ module }) => {
  const { user } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const accountKey =
    user?.id ?? user?._id ?? user?.email;

  const originalCourse =
    Number(module.courseId) === 1;

  useEffect(() => {
    let active = true;

    if (!open || user?.role !== 'ADMIN') {
      return undefined;
    }

    setTopics([]);
    setForm(null);
    setError('');
    setMessage('');
    setLoading(true);

    const load = async () => {
      try {
        const data = await api.get(
          `/modules/${module.id}/topics`
        );

        if (!Array.isArray(data)) {
          throw new Error(
            'No se recibió una lista válida de temas.'
          );
        }

        if (active) {
          setTopics(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar los temas.'
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
    open,
    module.id,
    accountKey,
    user?.role,
    retry,
  ]);

  const createForm = () => {
    setError('');
    setMessage('');

    setForm({
      id: null,
      title: '',
      introduction: '',
    });
  };

  const editTopic = (topic) => {
    setError('');
    setMessage('');

    setForm({
      id: topic.id,
      topicNumber: topic.topicNumber,
      title: topic.title || '',
      introduction: topic.introduction || '',
    });
  };

  const saveTopic = async (event) => {
    event.preventDefault();

    if (!form || saving) return;

    if (!form.title.trim()) {
      setError('Escribe el título del tema.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const editing = Boolean(form.id);

      const payload = {
        title: form.title.trim(),
        introduction: form.introduction.trim(),
      };

      const response = editing
        ? await api.put(
            `/modules/${module.id}/topics/${form.id}`,
            payload
          )
        : await api.post(
            `/modules/${module.id}/topics`,
            payload
          );

      if (!response?.topic) {
        throw new Error(
          'El servidor no devolvió el tema guardado.'
        );
      }

      setTopics((current) => {
        const updated = editing
          ? current.map((topic) =>
              topic.id === response.topic.id
                ? response.topic
                : topic
            )
          : [...current, response.topic];

        return updated.sort(
          (first, second) =>
            Number(first.order_number) -
            Number(second.order_number)
        );
      });

      setForm(null);

      setMessage(
        response.message ||
          'Tema guardado correctamente.'
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo guardar el tema.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') return null;

  return (
    <section className={styles.container}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={`module-topics-${module.id}`}
        disabled={saving}
        onClick={() => setOpen((current) => !current)}
      >
        {open
          ? 'Cerrar gestión de temas'
          : 'Gestionar temas'}
      </button>

      {open && (
        <div
          id={`module-topics-${module.id}`}
          className={styles.panel}
        >
          <header className={styles.header}>
            <span>TEMAS DEL MÓDULO</span>
            <h3>{module.title}</h3>
          </header>

          {!loading && !originalCourse && (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primary}
                disabled={saving}
                onClick={createForm}
              >
                Agregar tema
              </button>
            </div>
          )}

          {loading && (
            <p role="status">Consultando temas…</p>
          )}

          {error && (
            <div className={styles.error} role="alert">
              <p>{error}</p>

              {!form && (
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() =>
                    setRetry((current) => current + 1)
                  }
                >
                  Reintentar
                </button>
              )}
            </div>
          )}

          {message && (
            <p className={styles.success} role="status">
              {message}
            </p>
          )}

          {form && (
            <form
              className={styles.form}
              onSubmit={saveTopic}
            >
              <h4>
                {form.id
                  ? `Editar tema ${form.topicNumber}`
                  : 'Agregar tema'}
              </h4>

              <fieldset disabled={saving}>
                <label>
                  Título del tema

                  <input
                    autoFocus
                    value={form.title}
                    maxLength={255}
                    required
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  {originalCourse
                    ? 'Presentación del tutor'
                    : 'Contenido inicial del tema'}

                  <textarea
                    rows={8}
                    maxLength={20000}
                    value={form.introduction}
                    placeholder="Escribe la explicación o introducción del tema."
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        introduction: event.target.value,
                      }))
                    }
                  />
                </label>

                <p className={styles.help}>
                  La numeración se asigna automáticamente
                  al crear el tema.
                </p>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.primary}
                  >
                    {saving
                      ? 'Guardando…'
                      : 'Guardar tema'}
                  </button>

                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => {
                      setForm(null);
                      setError('');
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </fieldset>
            </form>
          )}

          {!loading && !error && topics.length === 0 && (
            <p className={styles.help}>
              Este módulo todavía no tiene temas.
              Pulsa «Agregar tema» para crear el primero.
            </p>
          )}

          {!loading && (
            <div className={styles.list}>
              {topics.map((topic) => (
                <article
                  key={topic.id}
                  className={styles.topic}
                >
                  <div>
                    <span>
                      TEMA {topic.topicNumber}
                    </span>

                    <h4>{topic.title}</h4>

                    <p>
                      {topic.introduction ||
                        'Sin contenido inicial.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={saving}
                    onClick={() => editTopic(topic)}
                    aria-label={`Editar tema ${topic.topicNumber}: ${topic.title}`}
                  >
                    Editar tema
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AdminModuleTopics;