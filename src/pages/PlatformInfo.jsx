import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiMonitor,
  FiFileText,
  FiMessageSquare,
  FiCheckCircle,
  FiTrendingUp,
  FiGlobe,
  FiLayers,
  FiMapPin,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';

import { AuthContext } from '../context/AuthContext';
import logoSmartCity from '../assets/logo-smartcity.jpeg';

import styles from './PlatformInfo.module.css';

const resources = [
  {
    Icon: FiMonitor,
    title: 'Videos educativos',
    text: 'Explicaciones audiovisuales para comprender cada tema.',
  },
  {
    Icon: FiFileText,
    title: 'Lecturas y recursos',
    text: 'Material de consulta para ampliar tus conocimientos.',
  },
  {
    Icon: FiMessageSquare,
    title: 'Foros de participación',
    text: 'Comparte ideas y propuestas sobre los retos del territorio.',
  },
  {
    Icon: FiCheckCircle,
    title: 'Evaluaciones',
    text: 'Pon a prueba lo aprendido en cada tema.',
  },
  {
    Icon: FiTrendingUp,
    title: 'Seguimiento académico',
    text: 'Consulta tu avance y los resultados de tus actividades.',
  },
  {
    Icon: FiGlobe,
    title: 'Accesibilidad',
    text: 'Ajusta el texto, el contraste y la lectura en voz alta.',
  },
];

const modules = [
  {
    title: 'Fundamentos de ciudades inteligentes',
    topics: [
      'Concepto de ciudad inteligente',
      'Gobernanza inteligente y ciudadanía digital',
      'Evolución de las ciudades',
      'Plataforma web de urbanismo inteligente',
    ],
  },
  {
    title: 'Infraestructura sostenible y movilidad',
    topics: [
      'Infraestructura verde',
      'Transporte sostenible',
      'Espacios urbanos inteligentes',
    ],
  },
  {
    title: 'Inteligencia artificial y aplicaciones urbanas',
    topics: [
      'Inteligencia artificial en servicios urbanos',
      'Educación inteligente',
      'Gemelos digitales',
    ],
  },
];

const sections = [
  {
    id: 'presentation',
    Icon: FiGlobe,
    title: 'Sobre la plataforma',
    subtitle: 'Tecnología y conocimiento para transformar.',
  },
  {
    id: 'resources',
    Icon: FiMonitor,
    title: '¿Qué encontrarás?',
    subtitle: 'Descubre tu experiencia de aprendizaje.',
  },
  {
    id: 'modules',
    Icon: FiLayers,
    title: 'Nuestros módulos',
    subtitle: 'Tres áreas para ampliar tus conocimientos.',
  },
  {
    id: 'territory',
    Icon: FiMapPin,
    title: 'Vinculación con el territorio',
    subtitle: 'Un proyecto conectado con nuestros municipios.',
  },
];

const PlatformInfo = () => {
  const { user } = useContext(AuthContext);
  const [openSection, setOpenSection] = useState(null);

  const isManagement = ['ADMIN', 'SUPERADMIN'].includes(
    user?.role
  );

  const destination = user
    ? isManagement
      ? '/admin'
      : '/dashboard'
    : '/register';

  const actionLabel = user
    ? isManagement
      ? 'Ir a mi panel'
      : 'Continuar mi capacitación'
    : 'Empieza tu capacitación';

  const toggleSection = (sectionId) => {
    setOpenSection((current) =>
      current === sectionId ? null : sectionId
    );
  };

  const renderContent = (sectionId) => {
    switch (sectionId) {
      case 'presentation':
        return (
          <>
            <p>
              SMART CITY CORE reúne recursos educativos
              sobre ciudades inteligentes para fortalecer
              conocimientos y explorar soluciones
              tecnológicas centradas en las personas.
            </p>

            <div className={styles.tags}>
              <span>Formación virtual</span>
              <span>Participación</span>
              <span>Seguimiento académico</span>
            </div>
          </>
        );

      case 'resources':
        return (
          <div className={styles.resourceGrid}>
            {resources.map(({ Icon, title, text }) => (
              <article
                key={title}
                className={styles.resource}
              >
                <Icon aria-hidden="true" />

                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        );

      case 'modules':
        return (
          <div className={styles.moduleList}>
            {modules.map((module, index) => (
              <details
                key={module.title}
                className={styles.module}
              >
                <summary>
                  <span className={styles.moduleNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className={styles.moduleTitle}>
                    <small>MÓDULO {index + 1}</small>
                    <strong>{module.title}</strong>
                  </span>

                  <FiPlus
                    className={styles.modulePlus}
                    aria-hidden="true"
                  />

                  <FiMinus
                    className={styles.moduleMinus}
                    aria-hidden="true"
                  />
                </summary>

                <ul>
                  {module.topics.map((topic) => (
                    <li key={topic}>
                      <FiCheckCircle aria-hidden="true" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        );

      case 'territory':
        return (
          <>
            <span className={styles.projectLabel}>
              VINCULACIÓN CON LA SOCIEDAD · UNESUM
            </span>

            <p>
              Desarrollado en el marco del proyecto
              «Plataforma web de urbanismo inteligente
              para el fortalecimiento de servicios
              tecnológicos aplicado a municipios del
              sur de Manabí, fase III».
            </p>

            <ul
              className={styles.municipalities}
              aria-label="Municipios"
            >
              <li>Paján</li>
              <li>Puerto López</li>
              <li>Jipijapa</li>
            </ul>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={styles.page}
      data-platform-info-page
    >
      <div className={styles.container}>
        <nav
          className={styles.topbar}
          aria-label="Volver"
        >
          <Link to="/" className={styles.backLink}>
            <FiArrowLeft aria-hidden="true" />
            Volver al inicio
          </Link>

        </nav>

        <div className={styles.layout}>
          <header className={styles.presentation}>
            <img
              src={logoSmartCity}
              alt="SMART CITY CORE"
              className={styles.logo}
              width="150"
              height="150"
            />

            <span className={styles.eyebrow}>
              CONOCE LA PLATAFORMA
            </span>

            <h1>
              Aprender hoy.
              <br />
              <span>Transformar mañana.</span>
            </h1>

            <p className={styles.intro}>
              Conocimiento para construir ciudades
              más conectadas, sostenibles e inclusivas.
            </p>

            <Link
              to={destination}
              className={styles.primaryButton}
            >
              <FiBookOpen aria-hidden="true" />
              {actionLabel}
              <FiArrowRight aria-hidden="true" />
            </Link>

            <div className={styles.signature}>
              <span className={styles.signatureLine} />

              <p>
                Construyendo juntos
                <strong>ciudades inteligentes.</strong>
              </p>
            </div>
          </header>

          <section
            className={styles.explore}
            aria-labelledby="explore-title"
          >
            <div className={styles.exploreHeading}>
             
              <h2 id="explore-title">
                Tú eliges qué explorar
              </h2>
              <p>
                Pulsa un apartado para conocer más.
              </p>
            </div>

            <div className={styles.accordion}>
              {sections.map(
                ({ id, Icon, title, subtitle }, index) => {
                  const isOpen = openSection === id;

                  return (
                    <section
                      key={id}
                      className={`${styles.item} ${
                        isOpen ? styles.itemOpen : ''
                      }`}
                    >
                      <h3 className={styles.itemHeading}>
                        <button
                          type="button"
                          id={`trigger-${id}`}
                          className={styles.trigger}
                          onClick={() => toggleSection(id)}
                          aria-expanded={isOpen}
                          aria-controls={`panel-${id}`}
                        >
                          <span className={styles.itemIcon}>
                            <Icon aria-hidden="true" />
                          </span>

                          <span className={styles.itemText}>
                            <span className={styles.itemNumber}>
                              EXPLORA 0{index + 1}
                            </span>

                            <strong>{title}</strong>
                            <span>{subtitle}</span>
                          </span>

                          <span className={styles.toggleIcon}>
                            {isOpen ? (
                              <FiMinus aria-hidden="true" />
                            ) : (
                              <FiPlus aria-hidden="true" />
                            )}
                          </span>
                        </button>
                      </h3>

                      <div
                        id={`panel-${id}`}
                        role="region"
                        aria-labelledby={`trigger-${id}`}
                        hidden={!isOpen}
                        className={styles.panel}
                      >
                        {renderContent(id)}
                      </div>
                    </section>
                  );
                }
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PlatformInfo;