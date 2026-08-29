import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiAward,
  FiBarChart2,
  FiMapPin,
  FiHome,
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

  const gads = [
    {
      nombre: 'GAD Paján',
      ubicacion: 'Paján',
      Icon: FiHome,
      descripcion:
        'Conoce la información, proyectos y actividades desarrolladas en el cantón Paján.',
    },
    {
      nombre: 'GAD Puerto López',
      ubicacion: 'Puerto López',
      Icon: FiMapPin,
      descripcion:
        'Descubre la información institucional y los avances realizados en Puerto López.',
    },
    {
      nombre: 'GAD Jipijapa',
      ubicacion: 'Jipijapa',
      Icon: FiHome,
      descripcion:
        'Infórmate sobre las actividades y la gestión institucional del GAD Jipijapa.',
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
                  <strong>
                    Introducción a las Smart Cities
                  </strong>
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

          <span
            className={`${styles.decorativeIcon} ${styles.iconOne}`}
          >
            💡
          </span>

          <span
            className={`${styles.decorativeIcon} ${styles.iconTwo}`}
          >
            <FiMonitor />
          </span>
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

      {/* Información institucional */}

      <section className={styles.gadsSection}>
        <div className={styles.sectionHeading}>
          <span>Instituciones participantes</span>

          <h2>Información de los GAD</h2>

          <p>
            Consulta la información institucional de los municipios
            participantes.
          </p>
        </div>

        <div className={styles.gadsGrid}>
          {gads.map((gad) => {
            const Icon = gad.Icon;

            return (
              <article
                className={styles.gadCard}
                key={gad.nombre}
              >
                <div className={styles.gadHeader}>
                  <div className={styles.gadIcon}>
                    <Icon />
                  </div>

                  <span>Información institucional</span>
                </div>

                <div className={styles.gadContent}>
                  <h3>{gad.nombre}</h3>
                  <p>{gad.descripcion}</p>

                  <Link
                    to={`/gad/${gad.ubicacion}`}
                    className={styles.detailsButton}
                  >
                    Ver información
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Home;