import { useEffect, useState } from 'react';
import {
  FiActivity,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiPlayCircle,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';
import { api } from '../services/api';
import styles from './Progress.module.css';

const initialProgress = {
  summary: {
    overallProgress: 0,
    coursesStarted: 0,
    coursesCompleted: 0,
    totalModules: 0,
    completedModules: 0,
    videosStarted: 0,
    videosCompleted: 0,
    totalWatchTime: 0,
    evaluationsTaken: 0,
    evaluationsPassed: 0,
    averageScore: 0,
    bestScore: 0,
  },
  courses: [],
  recentActivity: [],
};

const Progress = () => {
  const [progress, setProgress] = useState(initialProgress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProgress = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.get('/users/me/progress');

      setProgress({
        summary: {
          ...initialProgress.summary,
          ...data.summary,
        },
        courses: data.courses || [],
        recentActivity: data.recentActivity || [],
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo consultar tu avance.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const formatTime = (seconds) => {
    const totalSeconds = Number(seconds || 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }

    return `${minutes} min`;
  };

  const formatDate = (date) => {
    if (!date) {
      return 'Fecha no disponible';
    }

    return new Date(date).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const {
    summary,
    courses,
    recentActivity,
  } = progress;

  if (loading) {
    return (
      <main className={styles.progressPage}>
        <div className={styles.loading}>
          <FiRefreshCw />
          <span>Cargando tu avance...</span>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.progressPage}>
      <section className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            Mi aprendizaje
          </span>

          <h1>Actividad y rendimiento</h1>

          <p>
            Consulta el avance alcanzado durante tu capacitación
            y continúa trabajando para completar tus cursos.
          </p>
        </div>

        <div className={styles.generalProgress}>
          <div
            className={styles.progressCircle}
            style={{
              '--progress': `${summary.overallProgress * 3.6}deg`,
            }}
          >
            <div>
              <strong>{summary.overallProgress}%</strong>
              <span>Avance general</span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className={styles.errorMessage}>
          <span>{error}</span>

          <button type="button" onClick={loadProgress}>
            Intentar nuevamente
          </button>
        </div>
      )}

      {!error && (
        <>
          <section className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.blue}`}>
                <FiBookOpen />
              </div>

              <div>
                <strong>{summary.coursesStarted}</strong>
                <span>Cursos iniciados</span>
              </div>
            </article>

            <article className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.green}`}>
                <FiCheckCircle />
              </div>

              <div>
                <strong>{summary.coursesCompleted}</strong>
                <span>Cursos completados</span>
              </div>
            </article>

            <article className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.orange}`}>
                <FiPlayCircle />
              </div>

              <div>
                <strong>{summary.videosCompleted}</strong>
                <span>Videos completados</span>
              </div>
            </article>

            <article className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.purple}`}>
                <FiClock />
              </div>

              <div>
                <strong>
                  {formatTime(summary.totalWatchTime)}
                </strong>
                <span>Tiempo de aprendizaje</span>
              </div>
            </article>
          </section>

          <section className={styles.contentGrid}>
            <div className={styles.mainColumn}>
              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span className={styles.eyebrow}>
                      Cursos
                    </span>

                    <h2>Mi progreso académico</h2>
                  </div>

                  <FiTrendingUp />
                </div>

                {courses.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div>
                      <FiBookOpen />
                    </div>

                    <h3>Aún no has iniciado cursos</h3>

                    <p>
                      Cuando comiences una capacitación, podrás
                      consultar aquí todos tus avances.
                    </p>
                  </div>
                ) : (
                  <div className={styles.courseList}>
                    {courses.map((course) => (
                      <article
                        className={styles.courseCard}
                        key={course.id}
                      >
                        <div className={styles.courseTop}>
                          <div className={styles.courseIdentity}>
                            {course.imageUrl ? (
                              <img
                                src={course.imageUrl}
                                alt={course.name}
                              />
                            ) : (
                              <div className={styles.coursePlaceholder}>
                                <FiBookOpen />
                              </div>
                            )}

                            <div>
                              <span>
                                {course.isCompleted
                                  ? 'Curso completado'
                                  : 'Curso en progreso'}
                              </span>

                              <h3>{course.name}</h3>
                            </div>
                          </div>

                          <strong className={styles.coursePercentage}>
                            {course.progress}%
                          </strong>
                        </div>

                        <div className={styles.courseProgressBar}>
                          <span
                            style={{
                              width: `${course.progress}%`,
                            }}
                          />
                        </div>

                        <div className={styles.courseDetails}>
                          <span>
                            <FiBookOpen />
                            {course.completedModules} de{' '}
                            {course.totalModules} módulos
                          </span>

                          <span>
                            <FiPlayCircle />
                            {course.completedVideos} de{' '}
                            {course.totalVideos} videos
                          </span>

                          <span>
                            <FiAward />
                            Nota:{' '}
                            {course.finalScore ??
                              'Pendiente'}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span className={styles.eyebrow}>
                      Historial
                    </span>

                    <h2>Actividad reciente</h2>
                  </div>

                  <FiActivity />
                </div>

                {recentActivity.length === 0 ? (
                  <div className={styles.emptyActivity}>
                    Aún no se ha registrado actividad académica.
                  </div>
                ) : (
                  <div className={styles.activityList}>
                    {recentActivity.map((activity, index) => (
                      <div
                        className={styles.activityItem}
                        key={`${activity.type}-${activity.date}-${index}`}
                      >
                        <div className={styles.activityIcon}>
                          {activity.type.includes('evaluation') ? (
                            <FiTarget />
                          ) : (
                            <FiPlayCircle />
                          )}
                        </div>

                        <div className={styles.activityInformation}>
                          <strong>{activity.title}</strong>
                          <span>{activity.course}</span>
                          <p>{activity.detail}</p>
                        </div>

                        <time>
                          {formatDate(activity.date)}
                        </time>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>

            <aside className={styles.sideColumn}>
             <article className={styles.panel}>
  <div className={styles.panelHeader}>
    <div>
      <span className={styles.eyebrow}>
        Rendimiento
      </span>

      <h2>Evaluaciones</h2>
    </div>

    <FiAward />
  </div>
                <div className={styles.performance}>
                  <div className={styles.scoreMain}>
                    <strong>{summary.averageScore}</strong>
                    <span>Promedio general</span>
                  </div>

                  <div className={styles.performanceRow}>
                    <span>Realizadas</span>
                    <strong>{summary.evaluationsTaken}</strong>
                  </div>

                  <div className={styles.performanceRow}>
                    <span>Aprobadas</span>
                    <strong>{summary.evaluationsPassed}</strong>
                  </div>

                  <div className={styles.performanceRow}>
                    <span>Mejor calificación</span>
                    <strong>{summary.bestScore}</strong>
                  </div>
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span className={styles.eyebrow}>
                      Módulos
                    </span>

                    <h2>Contenido completado</h2>
                  </div>

                  <FiCheckCircle />
                </div>

                <div className={styles.moduleProgress}>
                  <div>
                    <strong>{summary.completedModules}</strong>
                    <span>Módulos completados</span>
                  </div>

                  <span className={styles.divider} />

                  <div>
                    <strong>{summary.totalModules}</strong>
                    <span>Módulos disponibles</span>
                  </div>
                </div>
              </article>
            </aside>
          </section>
        </>
      )}
    </main>
  );
};

export default Progress;