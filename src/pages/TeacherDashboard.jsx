import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FiBookOpen,
  FiEdit2,
  FiSave,
  FiX,
  FiRefreshCw,
  FiArrowLeft,
  FiLayers,
} from 'react-icons/fi';

import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import TeacherEvaluationViewer from '../components/TeacherEvaluationViewer';
import TeacherVideoEditor from '../components/TeacherVideoEditor';
import TeacherComplementaryVideos from '../components/TeacherComplementaryVideos';

import styles from './TeacherDashboard.module.css';

const TeachingContent = ({ courseId, onBack }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);

  const [selectedModuleId, setSelectedModuleId] =
    useState('');

  const [editingId, setEditingId] = useState(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const savingRef = useRef(false);
  const mountedRef = useRef(false);
  const selectorRef = useRef(null);

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
      setMessage('');
      setContent(null);
      setSelectedModuleId('');
      setEditingId(null);

      try {
        const data = await api.get(
          `/teachers/me/courses/${courseId}/content`
        );

        if (
          !data?.course ||
          !Array.isArray(data.modules)
        ) {
          throw new Error(
            'El contenido recibido no es válido.'
          );
        }

        if (!active) return;

        const modules = [...data.modules].sort(
          (first, second) =>
            Number(first.order_number) -
            Number(second.order_number)
        );

        setContent({ ...data, modules });

      setSelectedModuleId('');
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar los contenidos.'
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
  }, [courseId, retry]);

  const modules = content?.modules || [];

  const selectedIndex = modules.findIndex(
    (module) =>
      String(module.id) === selectedModuleId
  );

  const changeModule = (index, scroll = false) => {
    if (
      saving ||
      editingId !== null ||
      !modules[index]
    ) {
      return;
    }

    setSelectedModuleId(String(modules[index].id));
    setError('');
    setMessage('');

    if (scroll) {
      selectorRef.current?.scrollIntoView({
        block: 'start',
      });

      selectorRef.current?.focus({
        preventScroll: true,
      });
    }
  };

  const editDescription = (module) => {
    setEditingId(module.id);
    setDescription(module.description || '');
    setError('');
    setMessage('');
  };

  const saveDescription = async (event) => {
    event.preventDefault();

    if (
      savingRef.current ||
      editingId === null
    ) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updated = await api.put(
        `/teachers/me/courses/${courseId}/modules/${editingId}/content`,
        { description }
      );

      if (!mountedRef.current) return;

      setContent((current) => ({
        ...current,
        modules: current.modules.map((module) =>
          Number(module.id) === Number(updated.id)
            ? { ...module, ...updated }
            : module
        ),
      }));

      setEditingId(null);
      setMessage(
        'Descripción del módulo actualizada correctamente.'
      );
    } catch (requestError) {
      if (mountedRef.current) {
        setError(
          requestError.message ||
            'No se pudo guardar la descripción.'
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
    <>
      <div className={styles.contentTopbar}>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={saving || editingId !== null}
          onClick={onBack}
        >
          <FiArrowLeft aria-hidden="true" />
          Volver a mis cursos
        </button>
      </div>

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            GESTIÓN DE CONTENIDOS
          </span>

          <h1>
            {content?.course?.name ||
              'Contenidos del curso'}
          </h1>

          <p>
            Escoge el módulo que quieres trabajar.
            Puedes editar sus descripciones y agregar
            videos complementarios por tema.
          </p>
        </div>

        <div
          className={styles.headerIcon}
          aria-hidden="true"
        >
          <FiLayers />
        </div>
      </header>

      {message && (
        <p className={styles.success} role="status">
          {message}
        </p>
      )}

      {error && (
        <div className={styles.error} role="alert">
          <p>{error}</p>

          {!content && (
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={loading}
              onClick={() =>
                setRetry((current) => current + 1)
              }
            >
              <FiRefreshCw aria-hidden="true" />
              Reintentar
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className={styles.empty} role="status">
          Consultando contenidos…
        </p>
      ) : content && modules.length ? (
        <>
          <section
            className={styles.moduleToolbar}
            aria-label="Selección del módulo"
            ref={selectorRef}
            tabIndex={-1}
          >
            <div className={styles.moduleSelector}>
              <label htmlFor="teaching-module">
                ¿Qué módulo quieres editar?
              </label>

              <select
                id="teaching-module"
                value={selectedModuleId}
                disabled={saving || editingId !== null}
                onChange={(event) => {
                  const index = modules.findIndex(
                    (module) =>
                      String(module.id) ===
                      event.target.value
                  );

                  changeModule(index);
                }}
              >
                <option value="" disabled>
  Selecciona un módulo
</option>
                {modules.map((module) => (
                  <option
                    key={module.id}
                    value={String(module.id)}
                  >
                    Módulo {module.order_number}
                    {' — '}
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

           {selectedModuleId && (
  <span
    className={styles.modulePosition}
    role="status"
  >
    Módulo {selectedIndex + 1}
    {' de '}
    {modules.length}
  </span>
)}
          </section>

          {editingId !== null && (
            <p className={styles.editorHint}>
              Guarda o cancela la descripción antes
              de cambiar de módulo.
            </p>
          )}

          {modules.map((module) => {
            const selected =
              String(module.id) === selectedModuleId;

            return (
              <section
                key={module.id}
                hidden={!selected}
                style={{
                  display: selected ? 'block' : 'none',
                }}
                className={styles.modulePanel}
                aria-labelledby={`module-title-${module.id}`}
              >
                <article
                  className={`${styles.card} ${styles.activeModuleCard}`}
                >
                  <div className={styles.moduleCardHeader}>
                    <div>
                      <span className={styles.badge}>
                        Módulo {module.order_number}
                      </span>

                      <h2 id={`module-title-${module.id}`}>
                        {module.title}
                      </h2>
                    </div>

                 
                  </div>

                  {editingId === module.id ? (
                    <form
                      className={styles.form}
                      onSubmit={saveDescription}
                      aria-busy={saving}
                    >
                      <label>
                        Descripción del módulo

                        <textarea
                          value={description}
                          onChange={(event) =>
                            setDescription(
                              event.target.value
                            )
                          }
                          rows={5}
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
                            : 'Guardar descripción'}
                        </button>

                        <button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={saving}
                          onClick={() => {
                            setEditingId(null);
                            setError('');
                          }}
                        >
                          <FiX aria-hidden="true" />
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      className={styles.moduleIntroduction}
                    >
                      <p className={styles.description}>
                        {module.description ||
                          'Este módulo todavía no tiene una descripción.'}
                      </p>

                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={saving}
                        onClick={() =>
                          editDescription(module)
                        }
                      >
                        <FiEdit2 aria-hidden="true" />
                        Editar descripción
                      </button>
                    </div>
                  )}

                  <section
                    className={styles.resourceSection}
                  >
                    <div
                      className={styles.resourceHeading}
                    >
                      <FiBookOpen aria-hidden="true" />
                      <h3>Videos obligatorios</h3>

                      <span>
                        {module.Videos?.length || 0}
                      </span>
                    </div>

                    {module.Videos?.length ? (
                      <div
                        className={styles.videoResources}
                      >
                        {module.Videos.map((video) => (
                          <TeacherVideoEditor
                            key={video.id}
                            video={video}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className={styles.description}>
                        Todavía no hay videos registrados.
                      </p>
                    )}
                  </section>

                  <TeacherComplementaryVideos
                    key={`complementary-${module.id}`}
                    moduleId={module.id}
                  />

                  <section
                    className={styles.resourceSection}
                  >
                    <div
                      className={styles.resourceHeading}
                    >
                      <FiLayers aria-hidden="true" />
                      <h3>Evaluaciones del módulo</h3>

                      <span>
                        {module.Evaluations?.length || 0}
                      </span>
                    </div>

                    {module.Evaluations?.length ? (
  <div className={styles.evaluationResources}>
    {module.Evaluations.map((evaluation) => (
      <TeacherEvaluationViewer
        key={evaluation.id}
        evaluation={evaluation}
      />
    ))}
  </div>
) : (
  <p className={styles.description}>
    Todavía no hay evaluaciones registradas.
  </p>
)}
                  </section>
                </article>
              </section>
            );
          })}

          {selectedModuleId && (
  <nav
    className={styles.moduleNavigation}
    aria-label="Navegación entre módulos"
  >
    <button
      type="button"
      className={styles.secondaryButton}
      disabled={
        selectedIndex <= 0 ||
        saving ||
        editingId !== null
      }
      onClick={() =>
        changeModule(selectedIndex - 1, true)
      }
    >
      <FiArrowLeft aria-hidden="true" />
      Módulo anterior
    </button>

    <span>
      {selectedIndex + 1} de {modules.length}
    </span>

    <button
      type="button"
      className={styles.primaryButton}
      disabled={
        selectedIndex >= modules.length - 1 ||
        saving ||
        editingId !== null
      }
      onClick={() =>
        changeModule(selectedIndex + 1, true)
      }
    >
      Siguiente módulo
      <span aria-hidden="true">→</span>
    </button>
  </nav>
)}
        </>
      ) : content ? (
        <section className={styles.empty}>
          <h2>El curso todavía no tiene módulos</h2>
          <p>
            El administrador tutor debe registrar
            la estructura del curso.
          </p>
        </section>
      ) : null}
    </>
  );
};

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const [selectedCourseId, setSelectedCourseId] =
    useState(null);

  const accountId = user?.id ?? user?._id;
  const contentRef = useRef(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      setCourses([]);
      setSelectedCourseId(null);

      try {
        const data = await api.get(
          '/teachers/me/courses'
        );

        if (!Array.isArray(data)) {
          throw new Error(
            'La lista de cursos no es válida.'
          );
        }

        if (active) setCourses(data);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar tus cursos.'
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
  }, [accountId, retry]);

  useEffect(() => {
    if (selectedCourseId !== null) {
      contentRef.current?.focus();

      contentRef.current?.scrollIntoView({
        block: 'start',
      });
    }
  }, [selectedCourseId]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {selectedCourseId !== null ? (
          <div ref={contentRef} tabIndex={-1}>
            <TeachingContent
              key={`${accountId}-${selectedCourseId}`}
              courseId={selectedCourseId}
              onBack={() =>
                setSelectedCourseId(null)
              }
            />
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <div>
                <span className={styles.eyebrow}>
                  ESPACIO DOCENTE
                </span>

                <h1>Mis cursos asignados</h1>

                <p>
                  Hola, {user?.name || 'docente'}.
                  Selecciona un curso para trabajar
                  con sus contenidos.
                </p>
              </div>

              <div
                className={styles.headerIcon}
                aria-hidden="true"
              >
                <FiBookOpen />
              </div>
            </header>

            {error && (
              <div className={styles.error} role="alert">
                <p>{error}</p>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={loading}
                  onClick={() =>
                    setRetry((current) => current + 1)
                  }
                >
                  <FiRefreshCw aria-hidden="true" />
                  Volver a consultar
                </button>
              </div>
            )}

            {loading ? (
              <p className={styles.empty} role="status">
                Consultando tus cursos…
              </p>
            ) : !courses.length && !error ? (
              <section className={styles.empty}>
                <FiBookOpen aria-hidden="true" />

                <h2>Aún no tienes cursos asignados</h2>

                <p>
                  El administrador tutor debe asignarte
                  un curso para que aparezca aquí.
                </p>
              </section>
            ) : (
              <section
                className={styles.grid}
                aria-label="Cursos asignados"
              >
                {courses.map((course) => (
                  <article
                    className={styles.card}
                    key={course.id}
                  >
                    <div className={styles.cardHeading}>
                      <span className={styles.badge}>
                        Curso asignado
                      </span>

                      <span className={styles.moduleCount}>
                        {course.Modules?.length || 0}
                        {' módulos'}
                      </span>
                    </div>

                    <h2>{course.name}</h2>

                    <p className={styles.description}>
                      {course.description ||
                        'Este curso todavía no tiene una descripción.'}
                    </p>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() =>
                          setSelectedCourseId(course.id)
                        }
                      >
                        <FiBookOpen aria-hidden="true" />
                        Gestionar contenidos
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export const TeacherAccount = () => {
  const { user, updateUser } =
    useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const savingRef = useRef(false);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user?.name, user?.email]);

  const saveProfile = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;

    setError('');
    setMessage('');

    if (
      !form.name.trim() ||
      !form.email.trim()
    ) {
      setError(
        'Completa tu nombre y correo electrónico.'
      );
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      await updateUser({
        name: form.name.trim(),
        email: form.email.trim(),
      });

      setMessage(
        'Tu información se actualizó correctamente.'
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo actualizar el perfil.'
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              MI CUENTA
            </span>

            <h1>Perfil docente</h1>

            <p>
              Consulta y actualiza tu información personal.
            </p>
          </div>
        </header>

        <section className={styles.card}>
          <h2>Información personal</h2>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className={styles.success} role="status">
              {message}
            </p>
          )}

          <form
            className={styles.form}
            onSubmit={saveProfile}
            aria-busy={saving}
          >
            <label>
              Nombres completos

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                autoComplete="name"
                disabled={saving}
                required
              />
            </label>

            <label>
              Correo electrónico

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                autoComplete="email"
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
                  ? 'Guardando…'
                  : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default TeacherDashboard;