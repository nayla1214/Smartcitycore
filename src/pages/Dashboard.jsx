import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { COURSES } from '../data/courseData';
import defaultCourseImage from '../assets/ciudad1.jpg';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const gradingDialog = useRef(null);
  const courseTrigger = useRef(null);

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
      } catch (requestError) {
        console.error('Error al cargar los cursos:', requestError);
        setError('No fue posible cargar los cursos disponibles.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse || !gradingDialog.current) return undefined;
    const dialog = gradingDialog.current;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      courseTrigger.current?.focus();
    };
  }, [selectedCourse]);

  const courseStatistics = useMemo(() => {
    const completed = courses.filter(course => Number(course.progress) >= 100).length;
    const inProgress = courses.filter(course => {
      const progress = Number(course.progress) || 0;
      return progress > 0 && progress < 100;
    }).length;
    return { available: courses.length, inProgress, completed };
  }, [courses]);

  const getRoleName = (role) => role === 'ADMIN' ? 'Administrador' : 'Usuario';
  const getCourseImage = (course) =>
    course.image_url || course.imageUrl || course.image || defaultCourseImage;

  const beginCourse = (course, event) => {
    courseTrigger.current = event.currentTarget;
    setSelectedCourse(course);
  };
  const closeGrading = () => setSelectedCourse(null);
  const acceptGrading = () => {
    if (!selectedCourse) return;
    const courseId = selectedCourse.id;
    setSelectedCourse(null);
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.spinner} />
        <p>Cargando cursos disponibles...</p>
      </main>
    );
  }

  return (
    <main className={styles.dashboardPage}>
      <div className={styles.dashboardContainer}>
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1>Bienvenido,{' '}<span>{user?.name || 'Usuario'}</span></h1>
            <div className={styles.userRole}>
              <span className={styles.roleDot} aria-hidden="true" />
              {getRoleName(user?.role)}
            </div>
          </div>
          <div className={styles.welcomeIllustration} aria-hidden="true">
            <div className={styles.iconCircle}>
              <svg viewBox="0 0 24 24"><path d="M12 3 1.8 8.2 12 13.4l8-4.1v6h2V8.2L12 3Zm-6 9.1v4.2c0 1.7 2.7 3.7 6 3.7s6-2 6-3.7v-4.2l-6 3.1-6-3.1Z" /></svg>
            </div>
          </div>
        </section>

        {isAdmin && (
          <section className={styles.statistics}>
            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.availableIcon}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v7H4V4Zm10 0h6v7h-6V4ZM4 15h6v5H4v-5Zm10 0h6v5h-6v-5Z" /></svg>
              </div>
              <div><span>Cursos disponibles</span><strong>{courseStatistics.available}</strong></div>
            </article>
            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.progressIcon}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2Zm2 0v10h10A10 10 0 0 0 14 2Z" /></svg>
              </div>
              <div><span>Cursos en progreso</span><strong>{courseStatistics.inProgress}</strong></div>
            </article>
            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.completedIcon}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 16.2-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" /></svg>
              </div>
              <div><span>Cursos completados</span><strong>{courseStatistics.completed}</strong></div>
            </article>
          </section>
        )}

        <section className={styles.coursesSection}>
          <div className={styles.sectionHeader}>
            <div><span className={styles.sectionLabel}>FORMACIÓN</span><h2>Cursos disponibles</h2></div>
            <span className={styles.courseCount}>{courses.length}{' '}{courses.length === 1 ? 'curso' : 'cursos'}</span>
          </div>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {courses.length > 0 ? (
            <div className={styles.courseGrid}>
              {courses.map(course => (
                <article key={course.id} className={styles.courseCard}>
                  <div className={styles.courseImageContainer}>
                    <img src={getCourseImage(course)} alt="Introducción a Ciudades Inteligentes" className={styles.courseImage} />
                  </div>
                  <div className={styles.courseContent}>
                    <h3>Introducción a Ciudades Inteligentes</h3>
                    <p>{course.description || 'Conoce los fundamentos, características y tecnologías para mejorar la gestión y los servicios para la ciudadanía.'}</p>
                    {isAdmin ? (
                      <Link to={`/course/${course.id}`} className={styles.courseButton}>Gestionar curso<span aria-hidden="true">→</span></Link>
                    ) : (
                      <button type="button" className={styles.courseButton} aria-haspopup="dialog" onClick={event => beginCourse(course, event)}>
                        Comenzar curso<span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyCourses}>
              <div className={styles.emptyIcon}><FiBookOpen /></div>
              <h3>No hay cursos disponibles</h3>
              <p>En este momento no existen cursos publicados.</p>
            </div>
          )}
        </section>
      </div>

      <dialog ref={gradingDialog} className={styles.gradingDialog} aria-labelledby="grading-title" onCancel={event => { event.preventDefault(); closeGrading(); }}>
        <header className={styles.gradingHeader}>
          <div><span className={styles.sectionLabel}>ANTES DE COMENZAR</span><h2 id="grading-title">Así se calcula tu nota</h2></div>
          <button type="button" className={styles.gradingClose} onClick={closeGrading} aria-label="Cerrar información de calificaciones">×</button>
        </header>
        <div className={styles.gradingBody}>
          <p className={styles.gradingLead}>El curso tiene 3 módulos, 10 evaluaciones de temas y 3 evaluaciones integradoras. Tu nota final se calcula sobre <strong>10 puntos</strong>.</p>
          <div className={styles.gradingSummary}><span><strong>6 puntos</strong>Evaluaciones de temas</span><span><strong>4 puntos</strong>Evaluaciones integradoras</span></div>
          <h3>Distribución de la nota final</h3>
          <div className={styles.gradingTableWrap}>
            <table className={styles.gradingTable}>
              <caption className={styles.visuallyHidden}>Aporte de cada componente a la nota final sobre 10 puntos</caption>
              <thead><tr><th scope="col">Componente</th><th scope="col">Cantidad</th><th scope="col">Valor de cada evaluación</th><th scope="col">Aporte total</th></tr></thead>
              <tbody>
                <tr><th scope="row">Evaluaciones de los temas</th><td>10</td><td>0,60 puntos</td><td>6 puntos</td></tr>
                <tr><th scope="row">Integradora del módulo 1</th><td>1</td><td>1,60 puntos</td><td>1,60 puntos</td></tr>
                <tr><th scope="row">Integradora del módulo 2</th><td>1</td><td>1,20 puntos</td><td>1,20 puntos</td></tr>
                <tr><th scope="row">Integradora del módulo 3</th><td>1</td><td>1,20 puntos</td><td>1,20 puntos</td></tr>
              </tbody>
              <tfoot><tr><th scope="row">Total</th><td>13</td><td></td><td>10 puntos</td></tr></tfoot>
            </table>
          </div>
          <div className={styles.gradingModules}>
            <div><span>Módulo 1 · 4 temas</span><strong>4 puntos</strong><small>2,40 de temas + 1,60 de integradora</small></div>
            <div><span>Módulo 2 · 3 temas</span><strong>3 puntos</strong><small>1,80 de temas + 1,20 de integradora</small></div>
            <div><span>Módulo 3 · 3 temas</span><strong>3 puntos</strong><small>1,80 de temas + 1,20 de integradora</small></div>
          </div>
          <section className={styles.gradingExample}>
            <h3>¿Cómo se convierte tu calificación?</h3>
            <p>Cada evaluación se califica sobre 10. Su aporte se calcula así: <strong>calificación ÷ 10 × valor de la evaluación</strong>.</p>
            <ul><li>Un 8/10 en un tema aporta <strong>0,48 puntos</strong>.</li><li>Un 8/10 en la integradora del módulo 1 aporta <strong>1,28 puntos</strong>.</li><li>Un 8/10 en las integradoras del módulo 2 o 3 aporta <strong>0,96 puntos cada una</strong>.</li></ul>
            <p>Si obtienes 8 en todas las evaluaciones, tu nota final será <strong>8/10</strong>.</p>
          </section>
          <section className={styles.gradingRules}>
            <h3>¿Qué necesitas para aprobar?</h3>
            <p>Debes aprobar las 10 evaluaciones de temas y las 3 integradoras, con un mínimo de <strong>7/10 (70 %) en cada una</strong>, para completar el curso. No necesitas obtener 10/10.</p>
            <p>En las evaluaciones de 5 preguntas, cada respuesta correcta vale 2 puntos: necesitas 4 respuestas correctas, que equivalen a 8/10. Las integradoras permiten obtener puntos parciales.</p>
          </section>
        </div>
        <footer className={styles.gradingFooter}>
          <button type="button" className={styles.gradingAccept} onClick={acceptGrading}>Estoy de acuerdo<span aria-hidden="true"></span></button>
        </footer>
      </dialog>
    </main>
  );
};

export default Dashboard;
