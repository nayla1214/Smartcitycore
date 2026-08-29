import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { COURSES } from '../data/courseData';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
const isAdmin = user?.role === 'ADMIN';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setError('');

        if (COURSES?.length > 0) {
          setCourses(COURSES);
          return;
        }

        const data = await api.get('/courses');
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar los cursos:', error);
        setError('No fue posible cargar los cursos disponibles.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const courseStatistics = useMemo(() => {
    const completed = courses.filter(
      (course) => Number(course.progress) >= 100
    ).length;

    const inProgress = courses.filter((course) => {
      const progress = Number(course.progress) || 0;
      return progress > 0 && progress < 100;
    }).length;

    return {
      available: courses.length,
      inProgress,
    completed,
    };
  }, [courses]);

  const getRoleName = (role) => {
    if (role === 'ADMIN') return 'Administrador';
    return 'Usuario';
  };

  const getCourseProgress = (course) => {
    const progress = Number(course.progress) || 0;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Cargando cursos disponibles...</p>
      </main>
    );
  }

  return (
    <main className={styles.dashboardPage}>
      <div className={styles.dashboardContainer}>
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <span className={styles.welcomeLabel}>
              PLATAFORMA DE CAPACITACIÓN
            </span>

            <h1>
              Bienvenido, <span>{user?.name || 'Usuario'}</span>
            </h1>

            <p>
              Continúa fortaleciendo tus conocimientos sobre ciudades
              inteligentes y transformación digital.
            </p>

            <div className={styles.userRole}>
              <span className={styles.roleDot}></span>
              {getRoleName(user?.role)}
            </div>
          </div>

          <div className={styles.welcomeIllustration}>
            <div className={styles.iconCircle}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 1.8 8.2 12 13.4l8-4.1v6h2V8.2L12 3Zm-6 9.1v4.2c0 1.7 2.7 3.7 6 3.7s6-2 6-3.7v-4.2l-6 3.1-6-3.1Z" />
              </svg>
            </div>
          </div>

          <div className={styles.circleOne}></div>
          <div className={styles.circleTwo}></div>
        </section>
{isAdmin && (
  <section className={styles.statistics}>
    <article className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles.availableIcon}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h6v7H4V4Zm10 0h6v7h-6V4ZM4 15h6v5H4v-5Zm10 0h6v5h-6v-5Z" />
        </svg>
      </div>

      <div>
        <span>Cursos disponibles</span>
        <strong>{courseStatistics.available}</strong>
      </div>
    </article>

    <article className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles.progressIcon}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2Zm2 0v10h10A10 10 0 0 0 14 2Z" />
        </svg>
      </div>

      <div>
        <span>Cursos en progreso</span>
        <strong>{courseStatistics.inProgress}</strong>
      </div>
    </article>

    <article className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles.completedIcon}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 16.2-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
        </svg>
      </div>

      <div>
        <span>Cursos completados</span>
        <strong>{courseStatistics.completed}</strong>
      </div>
    </article>
  </section>
)}
        <section className={styles.coursesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionLabel}>FORMACIÓN</span>
              <h2>Cursos disponibles</h2>
              <p>
  {isAdmin
    ? 'Selecciona un curso para gestionar sus módulos y contenidos.'
    : 'Selecciona un curso para consultar sus módulos y contenidos.'}
</p>
            </div>

            <span className={styles.courseCount}>
              {courses.length} {courses.length === 1 ? 'curso' : 'cursos'}
            </span>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {courses.length > 0 ? (
            <div className={styles.courseGrid}>
              {courses.map((course, index) => {
                const progress = getCourseProgress(course);

                return (
                  <article key={course.id} className={styles.courseCard}>
                    <div
                      className={`${styles.courseCover} ${
                        styles[`cover${(index % 3) + 1}`]
                      }`}
                    >
                      <span className={styles.courseNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className={styles.courseIcon}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4 5a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2V5Zm3 1v2h9V6H7Zm0 5v2h9v-2H7Z" />
                        </svg>
                      </div>

                      <span className={styles.courseCategory}>
                        CIUDADES INTELIGENTES
                      </span>
                    </div>

                    <div className={styles.courseContent}>
                      <h3>{course.name}</h3>
                      <p>
                        {course.description ||
                          'Consulta los contenidos disponibles en este curso.'}
                      </p>

    {!isAdmin && (
  <div className={styles.progressInformation}>
    <div className={styles.progressText}>
      <span>Progreso</span>
      <strong>{progress}%</strong>
    </div>

    <div className={styles.progressBar}>
      <span style={{ width: `${progress}%` }}></span>
    </div>
  </div>
)}

<Link
  to={`/course/${course.id}`}
  className={styles.courseButton}
>
  {isAdmin
    ? 'Gestionar curso'
    : progress > 0
      ? 'Continuar curso'
      : 'Comenzar curso'}

  <span aria-hidden="true">→</span>
</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyCourses}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 4h16v16H4V4Zm2 2v12h12V6H6Zm2 2h8v2H8V8Zm0 4h6v2H8v-2Z" />
                </svg>
              </div>

              <h3>No hay cursos disponibles</h3>
              <p>En este momento no existen cursos publicados.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Dashboard;