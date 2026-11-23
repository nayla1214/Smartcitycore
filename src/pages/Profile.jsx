import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiEdit2,
  FiMail,
  FiPlayCircle,
  FiSave,
  FiUser,
  FiX,
  FiLock,
} from 'react-icons/fi';

import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import {
  openCertificateExample,
} from '../services/certificateExample';

import styles from './Profile.module.css';

const hasCompletedCourse = (data) => {
  const course = data?.courses?.find(
    (item) => Number(item.id) === 1
  );

  const modules = course?.modules || [];

  return (
    Number(course?.progress) === 100 &&
    [1, 2, 3].every((order) => {
      const module = modules.find(
        (item) => Number(item.order) === order
      );

      return (
        module?.supported === true &&
        module?.completed === true
      );
    })
  );
};

const calculateGeneralGrade = (progress) => {
  const course = progress?.courses?.find(
    (item) => Number(item.id) === 1
  );

  if (!course) return null;

  const definitions = [
    {
      order: 1,
      topics: ['1.1', '1.2', '1.3', '1.4'],
      weight: 1.6,
    },
    {
      order: 2,
      topics: ['2.1', '2.2', '2.3'],
      weight: 1.2,
    },
    {
      order: 3,
      topics: ['3.1', '3.2', '3.3'],
      weight: 1.2,
    },
  ];

  const validScore = (value) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ''
    ) {
      return null;
    }

    const score = Number(value);

    return (
      Number.isFinite(score) &&
      score >= 0 &&
      score <= 100
    )
      ? score
      : null;
  };

  let graded = 0;
  let passed = 0;

  const modules = definitions.map((definition) => {
    const module = (course.modules || []).find(
      (item) => Number(item.order) === definition.order
    );

    let points = 0;

    for (const topicNumber of definition.topics) {
      const evaluation = (
        module?.evaluations || []
      ).find(
        (item) => String(item.topic) === topicNumber
      );

      const score = validScore(
        evaluation?.bestScore
      );

      if (score !== null) {
        points += (score / 100) * 0.6;
        graded += 1;

        if (score >= 70) {
          passed += 1;
        }
      }
    }

    const integrativeScore = validScore(
      module?.integrative?.bestScore
    );

    if (integrativeScore !== null) {
      points +=
        (integrativeScore / 100) *
        definition.weight;

      graded += 1;

      if (integrativeScore >= 70) {
        passed += 1;
      }
    }

    return {
      order: definition.order,
      points,
      maximum:
        definition.topics.length * 0.6 +
        definition.weight,
    };
  });

  const total = modules.reduce(
    (sum, module) => sum + module.points,
    0
  );

  return {
    courseName: course.name || course.title,
    score: Math.min(10, Math.max(0, total)),
    graded,
    passed,
    complete: graded === 13,
    allPassed: passed === 13,
    modules,
  };
};

const formatGrade = (value) =>
  Number(value).toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const accountKey = String(
    user?.id || user?._id || user?.email || ''
  );

  const [certificateStatus, setCertificateStatus] =
    useState({
      accountKey: '',
      loading: true,
      available: false,
      progress: null,
      error: '',
    });

  const [certificateRetry, setCertificateRetry] =
    useState(0);

  useEffect(() => {
    let active = true;

    const checkCertificate = async () => {
      setCertificateStatus({
        accountKey,
        loading: true,
        available: false,
        progress: null,
        error: '',
      });

      if (!accountKey) {
        setCertificateStatus({
          accountKey,
          loading: false,
          available: false,
          progress: null,
          error: '',
        });

        return;
      }

      try {
        const data = await api.get(
          '/users/me/progress'
        );

        if (!active) return;

        setCertificateStatus({
          accountKey,
          loading: false,
          available: hasCompletedCourse(data),
          progress: data,
          error: '',
        });
      } catch (requestError) {
        if (!active) return;

        setCertificateStatus({
          accountKey,
          loading: false,
          available: false,
          progress: null,
          error:
            'No se pudo consultar el avance y las calificaciones.',
        });
      }
    };

    checkCertificate();

    return () => {
      active = false;
    };
  }, [accountKey, certificateRetry]);

  const checkingCertificate =
    certificateStatus.accountKey !== accountKey ||
    certificateStatus.loading;

  const progressError =
    certificateStatus.accountKey === accountKey
      ? certificateStatus.error
      : '';

  const progressData =
    certificateStatus.accountKey === accountKey &&
    !checkingCertificate &&
    !certificateStatus.error
      ? certificateStatus.progress
      : null;

  const generalGrade = useMemo(
    () => calculateGeneralGrade(progressData),
    [progressData]
  );

  const certificateAvailable =
    certificateStatus.accountKey === accountKey &&
    !checkingCertificate &&
    !progressError &&
    certificateStatus.available &&
    generalGrade?.complete === true &&
    generalGrade?.allPassed === true;

  const statistics = {
    coursesStarted:
      Number(
        progressData?.summary?.coursesStarted
      ) || 0,

    videosCompleted:
      Number(
        progressData?.summary?.videosCompleted
      ) || 0,

    coursesCompleted: (
      progressData?.courses || []
    ).filter((course) =>
      Number(course.id) === 1
        ? hasCompletedCourse({
            courses: [course],
          })
        : course.isCompleted === true &&
          Number(course.progress) === 100
    ).length,
  };

  const achievements = [
    {
      id: 'first-step',
      title: 'Primer paso',
      description: 'Inicia tu primer curso',
      unlocked: statistics.coursesStarted > 0,
      pendingText: 'Por conseguir',
      Icon: FiBookOpen,
      color: '#3478ec',
      background: '#eaf2ff',
      border: '#bdd3fa',
    },
    {
      id: 'constant-learner',
      title: 'Aprendiz constante',
      description: 'Completa cinco videos',
      unlocked: statistics.videosCompleted >= 5,
      pendingText: `${statistics.videosCompleted} de 5 videos`,
      Icon: FiPlayCircle,
      color: '#7854c5',
      background: '#f2edff',
      border: '#d5c5f5',
    },
    {
      id: 'goal-reached',
      title: 'Meta alcanzada',
      description: 'Completa tu primer curso',
      unlocked: statistics.coursesCompleted > 0,
      pendingText: 'Por conseguir',
      Icon: FiAward,
      color: '#b77912',
      background: '#fff6df',
      border: '#efd18b',
    },
  ];

  const initial = useMemo(
    () =>
      user?.name
        ?.trim()
        .charAt(0)
        .toUpperCase() || 'U',
    [user?.name]
  );

  const registrationDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        'es-EC',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )
    : 'No disponible';

  const roleLabel =
    {
      USER: 'Participante',
      ADMIN: 'Administrador',
      SUPERADMIN: 'Superadministrador',
    }[user?.role] || 'Usuario';

  const courseName =
    generalGrade?.courseName ||
    'Ciudades Inteligentes y Gobierno Digital';

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    if (
      !formData.name.trim() ||
      !formData.email.trim()
    ) {
      setError(
        'Completa tu nombre y correo electrónico.'
      );
      return;
    }

    setSaving(true);

    try {
      await updateUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      setEditing(false);
      setMessage(
        'Tu información se actualizó correctamente.'
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo actualizar el perfil.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });

    setEditing(false);
    setError('');
  };

  const handleCertificate = (print) => {
    if (!certificateAvailable) return;

    setError('');

    try {
      openCertificateExample(
        user?.name || 'Nombre del participante',
        {
          print,
          finalScore: generalGrade.score,
          courseName,
        }
      );
    } catch (certificateError) {
      setError(
        certificateError.message ||
          'No se pudo abrir el certificado.'
      );
    }
  };

  const retryProgress = () => {
    setCertificateRetry(
      (current) => current + 1
    );
  };

  const lockedMessage =
    'Completa los videos, las lecturas, las 10 evaluaciones de temas y las tres evaluaciones integradoras. Necesitas al menos 7/10 en cada evaluación para habilitar el certificado.';

  return (
    <main className={styles.profilePage}>
      <section className={styles.profileHeader}>
        <div className={styles.identity}>
          <div
            className={styles.avatar}
            aria-hidden="true"
          >
            {initial}
          </div>

          <div>
            <span className={styles.headerLabel}>
              Mi cuenta
            </span>

            <h1>{user?.name || 'Usuario'}</h1>

            <p>
              Consulta tu información personal y el
              progreso alcanzado en la plataforma.
            </p>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            className={styles.editButton}
            onClick={() => {
              setFormData({
                name: user?.name || '',
                email: user?.email || '',
              });

              setMessage('');
              setError('');
              setEditing(true);
            }}
          >
            <FiEdit2 aria-hidden="true" />
            Editar perfil
          </button>
        )}
      </section>

      {message && (
        <div
          className={styles.successMessage}
          role="status"
        >
          <FiCheckCircle aria-hidden="true" />
          {message}
        </div>
      )}

      {error && (
        <div
          className={styles.errorMessage}
          role="alert"
        >
          <FiX aria-hidden="true" />
          {error}
        </div>
      )}

      <section className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Datos personales
                </span>

                <h2>Información del perfil</h2>
              </div>

              <FiUser
                className={styles.headerIcon}
                aria-hidden="true"
              />
            </header>

            {editing ? (
              <form
                className={styles.profileForm}
                onSubmit={handleSave}
              >
                <label>
                  Nombres completos

                  <div className={styles.inputContainer}>
                    <FiUser aria-hidden="true" />

                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ingresa tus nombres"
                      disabled={saving}
                      required
                    />
                  </div>
                </label>

                <label>
                  Correo electrónico

                  <div className={styles.inputContainer}>
                    <FiMail aria-hidden="true" />

                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      disabled={saving}
                      required
                    />
                  </div>
                </label>

                <div className={styles.formButtons}>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={saving}
                  >
                    <FiSave aria-hidden="true" />

                    {saving
                      ? 'Guardando...'
                      : 'Guardar cambios'}
                  </button>

                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <FiX aria-hidden="true" />
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div
                className={styles.personalInformation}
              >
                <div className={styles.informationRow}>
                  <div
                    className={styles.informationIcon}
                  >
                    <FiUser aria-hidden="true" />
                  </div>

                  <div>
                    <span>Nombre completo</span>
                    <strong>
                      {user?.name || 'No registrado'}
                    </strong>
                  </div>
                </div>

                <div className={styles.informationRow}>
                  <div
                    className={styles.informationIcon}
                  >
                    <FiMail aria-hidden="true" />
                  </div>

                  <div>
                    <span>Correo electrónico</span>
                    <strong>
                      {user?.email || 'No registrado'}
                    </strong>
                  </div>
                </div>

                <div className={styles.accountDetails}>
                  <div>
                    <span>Tipo de cuenta</span>
                    <strong>{roleLabel}</strong>
                  </div>

                  <div>
                    <span>Fecha de ingreso</span>
                    <strong>{registrationDate}</strong>
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Reconocimientos
                </span>

                <h2>Mis logros</h2>
              </div>

              <FiAward
                className={styles.headerIcon}
                aria-hidden="true"
              />
            </header>

            <div
              className={styles.achievements}
              aria-busy={checkingCertificate}
            >
              {checkingCertificate ? (
                <p
                  className={styles.achievementMessage}
                  role="status"
                >
                  Consultando tus logros…
                </p>
              ) : progressError ? (
                <p
                  className={styles.achievementMessage}
                  role="alert"
                >
                  No se pudieron consultar tus logros.
                  Usa «Volver a comprobar» en la sección
                  del certificado.
                </p>
              ) : (
                achievements.map((achievement) => {
                  const Icon = achievement.Icon;

                  return (
                    <div
                      key={achievement.id}
                      className={`${styles.achievement} ${
                        achievement.unlocked
                          ? styles.unlocked
                          : ''
                      }`}
                      style={{
                        '--medal-color':
                          achievement.color,
                        '--medal-background':
                          achievement.background,
                        '--medal-border':
                          achievement.border,
                      }}
                    >
                      <div className={styles.medal}>
                        <Icon aria-hidden="true" />

                        <span
                          className={styles.medalStatus}
                          aria-hidden="true"
                        >
                          {achievement.unlocked ? (
                            <FiCheckCircle />
                          ) : (
                            <FiLock />
                          )}
                        </span>
                      </div>

                      <strong>
                        {achievement.title}
                      </strong>

                      <span>
                        {achievement.description}
                      </span>

                      <small
                        className={styles.achievementState}
                      >
                        {achievement.unlocked
                          ? 'Conseguido'
                          : achievement.pendingText}
                      </small>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </div>

        <div className={styles.rightColumn}>
          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Certificación
                </span>

                <h2>Mi certificado</h2>
              </div>

              <FiAward
                className={styles.headerIcon}
                aria-hidden="true"
              />
            </header>

            <div
              className={styles.certificateInformation}
            >
              <span className={styles.exampleBadge}>
                {checkingCertificate
                  ? 'Comprobando curso...'
                  : progressError
                    ? 'Consulta pendiente'
                    : certificateAvailable
                      ? 'Curso completado'
                      : 'Certificado bloqueado'}
              </span>

              <h3>{courseName}</h3>

              <p
                id="certificate-status"
                role="status"
                aria-live="polite"
              >
                {checkingCertificate
                  ? 'Estamos consultando tu avance.'
                  : progressError
                    ? 'No se pudo comprobar la disponibilidad del certificado.'
                    : certificateAvailable
                      ? 'Completaste los requisitos del curso. Puedes previsualizar y guardar el modelo de certificado con tu nota general.'
                      : lockedMessage}
              </p>

              <div className={styles.certificateActions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={() =>
                    handleCertificate(false)
                  }
                  disabled={!certificateAvailable}
                  aria-describedby="certificate-status"
                >
                  {!certificateAvailable && (
                    <FiLock aria-hidden="true" />
                  )}

                  Previsualizar
                </button>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() =>
                    handleCertificate(true)
                  }
                  disabled={!certificateAvailable}
                  aria-describedby="certificate-status"
                  title="Guardar como PDF desde la ventana de impresión"
                >
                  {!certificateAvailable && (
                    <FiLock aria-hidden="true" />
                  )}

                  Descargar
                </button>
              </div>

              {progressError && (
                <div>
                  <p role="alert">{progressError}</p>

                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={retryProgress}
                  >
                    Volver a comprobar
                  </button>
                </div>
              )}

              <p className={styles.certificateNote}>
                El diseño actual es una vista previa
                sin validez de emisión. La firma
                autorizada, la fecha y el código se
                conectarán con la emisión definitiva.
              </p>
            </div>
          </article>

          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Rendimiento académico
                </span>

                <h2>
                  {generalGrade?.complete
                    ? 'Nota general'
                    : 'Nota acumulada'}
                </h2>
              </div>

              <FiCheckCircle
                className={styles.headerIcon}
                aria-hidden="true"
              />
            </header>

            <div
              className={styles.generalGrade}
              aria-busy={checkingCertificate}
            >
              {checkingCertificate ? (
                <p role="status">
                  Consultando tus calificaciones…
                </p>
              ) : progressError ? (
                <p role="alert">
                  No se pudieron consultar tus
                  calificaciones. Usa «Volver a
                  comprobar» en el certificado.
                </p>
              ) : !generalGrade ? (
                <p>
                  Tu calificación aparecerá cuando
                  inicies el curso de Ciudades
                  Inteligentes y Gobierno Digital.
                </p>
              ) : (
                <>
                  <div className={styles.gradeResult}>
                    <span>
                      {generalGrade.complete
                        ? 'Calificación general del curso'
                        : 'Puntos obtenidos hasta el momento'}
                    </span>

                    <strong>
                      {formatGrade(generalGrade.score)}
                      <small> / 10</small>
                    </strong>

                    <p>
                      {generalGrade.graded} de 13
                      evaluaciones calificadas
                    </p>
                  </div>

                  <dl className={styles.gradeBreakdown}>
                    {generalGrade.modules.map(
                      (module) => (
                        <div key={module.order}>
                          <dt>
                            Módulo {module.order}
                          </dt>

                          <dd>
                            {formatGrade(module.points)}

                            <span>
                              {' / '}
                              {formatGrade(
                                module.maximum
                              )}
                            </span>
                          </dd>
                        </div>
                      )
                    )}
                  </dl>

                  <p
                    className={styles.gradeExplanation}
                  >
                    Las evaluaciones de temas aportan
                    6 puntos y las integradoras
                    4 puntos. Se utiliza tu mejor
                    calificación en cada evaluación.
                  </p>

                  <p
                    className={styles.gradeExplanation}
                  >
                    {generalGrade.allPassed
                      ? certificateAvailable
                        ? 'Completaste las evaluaciones, los videos y las lecturas requeridas.'
                        : 'Todas las evaluaciones están aprobadas. Para habilitar el certificado también debes completar los videos y las lecturas.'
                      : `${generalGrade.passed} de 13 evaluaciones aprobadas. Necesitas al menos 7/10 en cada una.`}
                  </p>
                </>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
};

export default Profile;