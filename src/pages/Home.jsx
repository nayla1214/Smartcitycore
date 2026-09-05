import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiAward,
  FiBarChart2,
  FiLayers,
  FiMonitor,
} from 'react-icons/fi';
import styles from './Home.module.css';

const Home = () => {
  const beneficios = [
    {
      Icon: FiBookOpen,
      titulo: 'Cursos especializados',
      descripcion:
        'Accede a contenidos organizados en módulos sobre ciudades inteligentes.',
    },
    {
      Icon: FiAward,
      titulo: 'Aprendizaje progresivo',
      descripcion:
        'Avanza a tu ritmo mediante videos, actividades y evaluaciones.',
    },
    {
      Icon: FiBarChart2,
      titulo: 'Seguimiento',
      descripcion:
        'Consulta tu progreso y los resultados obtenidos durante la capacitación.',
    },
  ];

  return (
    <main className={styles.home}>
      {/* Presentación principal */}
      <section className={styles.hero}>
        <Link to="/login" className={styles.loginButton}>
          Iniciar sesión
        </Link>

        <div className={styles.heroContent}>
          <span className={styles.badge}>
            Plataforma de formación virtual
          </span>

          <h1>
            Aprende sobre el desarrollo de{' '}
            <span>ciudades inteligentes</span>
          </h1>

          <p>
            Fortalece tus conocimientos mediante cursos, recursos educativos
            y actividades orientadas a la transformación de los municipios.
          </p>

          <div className={styles.heroButtons}>
            <a href="#informacion" className={styles.primaryButton}>
              Conocer la plataforma
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.educationCard}>
            <div className={styles.cardTop}>
              <div className={styles.bookIcon}>
                <FiBookOpen />
              </div>

              <div>
                <span>Capacitación virtual</span>
                <strong>Ciudades inteligentes</strong>
              </div>
            </div>

            <div className={styles.module}>
              <div className={styles.moduleIcon}>
                <FiLayers />
              </div>

              <div className={styles.moduleInformation}>
                <div>
                  <span>Contenido educativo</span>
                  <strong>Introducción a las Smart Cities</strong>
                </div>

                <div className={styles.progress}>
                  <span />
                </div>
              </div>
            </div>

            <div className={styles.learningData}>
              <div>
                <strong>3</strong>
                <span>Módulos</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Virtual</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Acceso</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Beneficios educativos */}
      <section
        id="informacion"
        className={styles.featuresSection}
      >
        <div className={styles.sectionHeading}>
          <span>Formación en línea</span>

          <h2>¿Qué encontrarás en la plataforma?</h2>

          <p>
            Herramientas educativas para desarrollar una experiencia de
            capacitación organizada, accesible y dinámica.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {beneficios.map((beneficio) => {
            const Icon = beneficio.Icon;

            return (
              <article
                className={styles.featureCard}
                key={beneficio.titulo}
              >
                <div className={styles.featureIcon}>
                  <Icon />
                </div>

                <h3>{beneficio.titulo}</h3>
                <p>{beneficio.descripcion}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Home;