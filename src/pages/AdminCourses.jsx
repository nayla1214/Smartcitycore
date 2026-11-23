import {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  FiBookOpen,
  FiEdit2,
  FiPlus,
  FiArrowLeft,
} from 'react-icons/fi';
import AdminModuleTopics from '../components/AdminModuleTopics';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import styles from './AdminCourses.module.css';

const emptyCourse = () => ({
  name: '',
  description: '',
  image_url: '',
  status: false,
});

const AdminCourses = () => {
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [courseForm, setCourseForm] = useState(null);
  const [moduleForm, setModuleForm] = useState(null);

  const accountKey =
    user?.id ?? user?._id ?? user?.email;

  const selectedCourse = courses.find(
    (course) => String(course.id) === String(selectedId)
  );

  useEffect(() => {
    let active = true;

    setCourses([]);
    setSelectedId(null);
    setCourseForm(null);
    setModuleForm(null);
    setError('');
    setMessage('');
    setLoading(true);

    const load = async () => {
      if (user?.role !== 'ADMIN') {
        if (active) setLoading(false);
        return;
      }

      try {
        const data = await api.get('/courses/admin');

        if (!Array.isArray(data)) {
          throw new Error(
            'No se recibió una lista válida de cursos.'
          );
        }

        if (active) {
          setCourses(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              'No se pudieron consultar los cursos.'
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
  }, [accountKey, user?.role, retry]);

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  const openCourseForm = (course = null) => {
    clearMessages();
    setModuleForm(null);

    setCourseForm(
      course
        ? {
            id: course.id,
            name: course.name || '',
            description: course.description || '',
            image_url: course.image_url || '',
            status: course.status === true,
          }
        : emptyCourse()
    );
  };

  const openModuleForm = (module = null) => {
    if (!selectedCourse) return;

    clearMessages();
    setCourseForm(null);

    const nextOrder =
      Math.max(
        0,
        ...(selectedCourse.Modules || []).map(
          (item) => Number(item.order_number) || 0
        )
      ) + 1;

    setModuleForm({
      id: module?.id ?? null,
      courseId: selectedCourse.id,
      title: module?.title || '',
      description: module?.description || '',
      order_number: module?.order_number ?? nextOrder,
      status: module
        ? module.status === true
        : false,
    });
  };

  const saveCourse = async (event) => {
    event.preventDefault();

    if (saving || !courseForm) return;

    setSaving(true);
    clearMessages();

    try {
      const payload = {
        name: courseForm.name.trim(),
        description: courseForm.description.trim(),
        image_url: courseForm.image_url.trim(),
        status: courseForm.status,
      };

      const editing = Boolean(courseForm.id);

      const saved = editing
        ? await api.put(
            `/courses/${courseForm.id}`,
            payload
          )
        : await api.post('/courses', payload);

      setCourses((current) =>
        editing
          ? current.map((course) =>
              String(course.id) === String(saved.id)
                ? {
                    ...course,
                    ...saved,
                    Modules: course.Modules || [],
                  }
                : course
            )
          : [
              ...current,
              {
                ...saved,
                Modules: [],
              },
            ]
      );

      setCourseForm(null);

      setMessage(
        editing
          ? 'Curso actualizado correctamente.'
          : 'Curso creado correctamente.'
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo guardar el curso.'
      );
    } finally {
      setSaving(false);
    }
  };

  const saveModule = async (event) => {
    event.preventDefault();

    if (saving || !moduleForm) return;

    const title = moduleForm.title.trim();

    if (!title) {
      setError('Escribe el título del módulo.');
      return;
    }

    const course = courses.find(
      (item) =>
        String(item.id) === String(moduleForm.courseId)
    );

    const duplicateOrder = (course?.Modules || []).some(
      (item) =>
        String(item.id) !== String(moduleForm.id) &&
        Number(item.order_number) ===
          Number(moduleForm.order_number)
    );

    if (duplicateOrder) {
      setError(
        'Ya existe un módulo con ese número en este curso.'
      );
      return;
    }

    setSaving(true);
    clearMessages();

    try {
      const editing = Boolean(moduleForm.id);

      const payload = {
        title,
        description: moduleForm.description.trim(),
        status: moduleForm.status,
      };

      // Se conserva el orden de los módulos existentes.
      if (!editing) {
        payload.courseId = moduleForm.courseId;
        payload.order_number = Number(
          moduleForm.order_number
        );
      }

      const saved = editing
        ? await api.put(
            `/modules/${moduleForm.id}`,
            payload
          )
        : await api.post('/modules', payload);

      setCourses((current) =>
        current.map((item) => {
          if (
            String(item.id) !== String(moduleForm.courseId)
          ) {
            return item;
          }

          const modules = item.Modules || [];

          return {
            ...item,
            Modules: editing
              ? modules.map((module) =>
                  String(module.id) === String(saved.id)
                    ? { ...module, ...saved }
                    : module
                )
              : [...modules, saved],
          };
        })
      );

      setModuleForm(null);

      setMessage(
        editing
          ? 'Módulo actualizado correctamente.'
          : 'Módulo creado correctamente.'
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo guardar el módulo.'
      );
    } finally {
      setSaving(false);
    }
  };

  // La función está al nivel del componente,
  // para que ambos botones puedan utilizarla.
  const deleteCourse = async (course) => {
    if (saving || !course) return;

    const confirmed = window.confirm(
      `¿Eliminar definitivamente el curso "${course.name}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setSaving(true);
    clearMessages();

    try {
      const response = await api.post(
        `/courses/${course.id}/delete`,
        {}
      );

      setCourses((current) =>
        current.filter(
          (item) => String(item.id) !== String(course.id)
        )
      );

      if (String(selectedId) === String(course.id)) {
        setSelectedId(null);
        setModuleForm(null);
      }

      if (
        courseForm?.id &&
        String(courseForm.id) === String(course.id)
      ) {
        setCourseForm(null);
      }

      setMessage(
        response?.message ||
          'Curso eliminado correctamente.'
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo eliminar el curso.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className={styles.page}>
        <section className={styles.panel}>
          <h1>Acceso restringido</h1>

          <p>
            Esta sección corresponde al administrador tutor.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              ADMINISTRACIÓN ACADÉMICA
            </span>

            <h1>Gestión de cursos</h1>

            <p>
              Administra los datos de los cursos y sus módulos.
            </p>
          </div>

          {!selectedCourse && (
            <button
              type="button"
              className={styles.primary}
              disabled={saving || loading}
              onClick={() => openCourseForm()}
            >
              <FiPlus aria-hidden="true" />
              Crear curso
            </button>
          )}
        </header>

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

        {courseForm && (
          <section className={styles.panel}>
            <h2>
              {courseForm.id
                ? 'Editar curso'
                : 'Crear curso'}
            </h2>

            <form
              className={styles.form}
              onSubmit={saveCourse}
            >
              <fieldset disabled={saving}>
                <label>
                  Nombre del curso

                  <input
                    autoFocus
                    value={courseForm.name}
                    maxLength={255}
                    required
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Descripción

                  <textarea
                    rows={4}
                    value={courseForm.description}
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Dirección de la imagen

                  <input
                    type="url"
                    maxLength={255}
                    placeholder="https://..."
                    value={courseForm.image_url}
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        image_url: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={courseForm.status}
                    onChange={(event) =>
                      setCourseForm((current) => ({
                        ...current,
                        status: event.target.checked,
                      }))
                    }
                  />

                  Curso activo en el catálogo
                </label>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.primary}
                  >
                    {saving
                      ? 'Guardando…'
                      : 'Guardar curso'}
                  </button>

                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => setCourseForm(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </fieldset>
            </form>
          </section>
        )}

        {loading ? (
          <p role="status">Consultando cursos…</p>
        ) : selectedCourse ? (
          <>
            <section className={styles.panel}>
              <button
                type="button"
                className={styles.secondary}
                disabled={saving}
                onClick={() => {
                  setSelectedId(null);
                  setCourseForm(null);
                  setModuleForm(null);
                  clearMessages();
                }}
              >
                <FiArrowLeft aria-hidden="true" />
                Regresar a cursos
              </button>

              <div className={styles.courseHeading}>
                <span className={styles.eyebrow}>
                  MÓDULOS DEL CURSO
                </span>

                <h2>{selectedCourse.name}</h2>

                <p>{selectedCourse.description}</p>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={saving}
                  onClick={() => openModuleForm()}
                >
                  <FiPlus aria-hidden="true" />
                  Agregar módulo
                </button>

                <button
                  type="button"
                  className={styles.secondary}
                  disabled={saving}
                  onClick={() =>
                    openCourseForm(selectedCourse)
                  }
                >
                  <FiEdit2 aria-hidden="true" />
                  Editar curso
                </button>

                <button
                  type="button"
                  className={styles.danger}
                  disabled={saving}
                  onClick={() =>
                    deleteCourse(selectedCourse)
                  }
                  aria-label={`Eliminar curso ${selectedCourse.name}`}
                >
                  Eliminar curso
                </button>
              </div>
            </section>

            {moduleForm && (
              <section className={styles.panel}>
                <h2>
                  {moduleForm.id
                    ? 'Editar módulo'
                    : 'Agregar módulo'}
                </h2>

                <form
                  className={styles.form}
                  onSubmit={saveModule}
                >
                  <fieldset disabled={saving}>
                    <label>
                      Título

                      <input
                        autoFocus
                        maxLength={255}
                        required
                        value={moduleForm.title}
                        onChange={(event) =>
                          setModuleForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label>
                      Descripción

                      <textarea
                        rows={4}
                        value={moduleForm.description}
                        onChange={(event) =>
                          setModuleForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                      />
                    </label>

                    {!moduleForm.id && (
                      <label>
                        Número del módulo

                        <input
                          type="number"
                          min={1}
                          step={1}
                          required
                          value={moduleForm.order_number}
                          onChange={(event) =>
                            setModuleForm((current) => ({
                              ...current,
                              order_number: event.target.value,
                            }))
                          }
                        />
                      </label>
                    )}

                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={moduleForm.status}
                        onChange={(event) =>
                          setModuleForm((current) => ({
                            ...current,
                            status: event.target.checked,
                          }))
                        }
                      />

                      Módulo activo
                    </label>

                    <div className={styles.actions}>
                      <button
                        type="submit"
                        className={styles.primary}
                      >
                        {saving
                          ? 'Guardando…'
                          : 'Guardar módulo'}
                      </button>

                      <button
                        type="button"
                        className={styles.secondary}
                        onClick={() => setModuleForm(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </fieldset>
                </form>
              </section>
            )}

           <section className={styles.moduleList}>
  {[...(selectedCourse.Modules || [])]
    .sort(
      (first, second) =>
        first.order_number - second.order_number
    )
    .map((module) => (
      <div key={module.id}>
        <article className={styles.moduleCard}>
          <div>
            <span className={styles.eyebrow}>
              MÓDULO {module.order_number}
            </span>

            <h3>{module.title}</h3>

            <p>
              {module.description ||
                'Sin descripción registrada.'}
            </p>

            <span
              className={
                module.status
                  ? styles.active
                  : styles.inactive
              }
            >
              {module.status ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <button
            type="button"
            className={styles.secondary}
            disabled={saving}
            onClick={() => openModuleForm(module)}
            aria-label={`Editar módulo ${module.order_number}: ${module.title}`}
          >
            <FiEdit2 aria-hidden="true" />
            Editar módulo
          </button>
        </article>

        <AdminModuleTopics module={module} />
      </div>
    ))}

  {!selectedCourse.Modules?.length && (
    <p className={styles.empty}>
      Este curso todavía no tiene módulos.
    </p>
  )}
</section>
          </>
        ) : (
          <section
            className={styles.grid}
            aria-label="Cursos registrados"
          >
            {courses.map((course) => (
              <article
                key={course.id}
                className={styles.courseCard}
              >
                <div className={styles.courseIcon}>
                  <FiBookOpen aria-hidden="true" />
                </div>

                <span
                  className={
                    course.status
                      ? styles.active
                      : styles.inactive
                  }
                >
                  {course.status
                    ? 'Activo'
                    : 'Inactivo'}
                </span>

                <h2>{course.name}</h2>

                <p>
                  {course.description ||
                    'Sin descripción registrada.'}
                </p>

                <small>
                  {course.Modules?.length || 0} módulos
                </small>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={saving}
                    onClick={() => {
                      setSelectedId(course.id);
                      setCourseForm(null);
                      setModuleForm(null);
                      clearMessages();
                    }}
                  >
                    Gestionar módulos
                  </button>

                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={saving}
                    onClick={() =>
                      openCourseForm(course)
                    }
                  >
                    Editar curso
                  </button>

                  <button
                    type="button"
                    className={styles.danger}
                    disabled={saving}
                    onClick={() =>
                      deleteCourse(course)
                    }
                    aria-label={`Eliminar curso ${course.name}`}
                  >
                    Eliminar curso
                  </button>
                </div>
              </article>
            ))}

            {courses.length === 0 && (
              <div className={styles.panel}>
                <p>No hay cursos para mostrar.</p>

                {error && (
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() =>
                      setRetry(
                        (current) => current + 1
                      )
                    }
                  >
                    Reintentar
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;