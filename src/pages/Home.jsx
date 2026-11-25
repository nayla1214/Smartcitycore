import { useContext } from 'react';
import { Link } from 'react-router-dom';

import {
  FiBookOpen,
  FiMonitor,
  FiBarChart2,
  FiGlobe,
} from 'react-icons/fi';

import { AuthContext } from '../context/AuthContext';

import logoSmartCity from '../assets/logo-smartcity.jpeg';
import cityImage from '../assets/smart-city.png';

import styles from './Home.module.css';

const Home = () => {
  const { user } = useContext(AuthContext);

  const isManagement = [
    'ADMIN',
    'SUPERADMIN',
  ].includes(user?.role);

  const accessRoute = user
    ? isManagement
      ? '/admin'
      : '/dashboard'
    : '/login';

  const benefits = [
    {
      Icon: FiMonitor,
      title: 'Cursos',
      subtitle: 'virtuales',
    },
    {
      Icon: FiBookOpen,
      title: 'Aprendizaje',
      subtitle: 'por módulos',
    },
    {
      Icon: FiBarChart2,
      title: 'Seguimiento',
      subtitle: 'académico',
    },
    {
      Icon: FiGlobe,
      title: 'Acceso',
      subtitle: 'flexible',
    },
  ];

  return (
    <div className={styles.home} data-home-page>
      <section
        className={styles.hero}
        style={{
          '--hero-image': `url("${cityImage}")`,
        }}
        aria-labelledby="home-title"
      >
    

        <div className={styles.content}>
          <header className={styles.identity}>
            <img
              src={logoSmartCity}
              alt="SMART CITY CORE"
              className={styles.logo}
              width="220"
              height="220"
            />

            <div className={styles.heading}>
              <h1 id="home-title">
                Plataforma virtual
                <br />
                de capacitación
              </h1>

              <p>Ciudades inteligentes</p>

              <div
                className={styles.headingCurve}
                aria-hidden="true"
              />
            </div>
          </header>

          <p className={styles.motto}>
            Aprende <span>·</span> Innova{' '}
            <span>·</span> Transforma
          </p>

          <div className={styles.description}>
            <p>
              Formación en tecnologías y soluciones
              para el desarrollo de ciudades más{' '}
              <strong>
                conectadas, sostenibles e inclusivas.
              </strong>
            </p>
          </div>

          <ul
            className={styles.benefits}
            aria-label="Características de la plataforma"
          >
            {benefits.map(
              ({ Icon, title, subtitle }) => (
                <li key={title}>
                  <div className={styles.benefitIcon}>
                    <Icon aria-hidden="true" />
                  </div>

                  <span>
                    {title}
                    <br />
                    {subtitle}
                  </span>
                </li>
              )
            )}
          </ul>

          <div className={styles.actions}>
            <Link
              to={user ? accessRoute : '/register'}
              className={styles.primaryButton}
            >
              <FiBookOpen aria-hidden="true" />

              {user
                ? isManagement
                  ? 'Gestionar la plataforma'
                  : 'Continuar mi capacitación'
                : '¡Empieza tu capacitación ahora!'}
            </Link>

           <Link
  to="/plataforma"
  className={styles.informationLink}
>
  Conocer la plataforma
</Link>
          </div>
        </div>

        <p className={styles.screenReaderText}>
          Construyendo juntos ciudades inteligentes.
        </p>
      </section>
    </div>
  );
};

export default Home;