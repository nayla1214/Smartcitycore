import {
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
} from 'react-icons/fi';

import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

import imagen1 from '../assets/ciudad1.jpg';
import imagen2 from '../assets/ciudad2.jpg';
import imagen3 from '../assets/ciudad3.jpg';

import styles from './Login.module.css';

const images = [
  imagen1,
  imagen2,
  imagen3,
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] =
    useState(false);

  const [currentImage, setCurrentImage] =
    useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] =
    useState(false);
  const [reduceMotion, setReduceMotion] =
    useState(false);

  const submittingRef = useRef(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const updateMotion = () => {
      setReduceMotion(
        media.matches ||
          document.documentElement.classList.contains(
            'a11y-reduce-motion'
          )
      );
    };

    updateMotion();

    media.addEventListener(
      'change',
      updateMotion
    );

    const observer =
      new MutationObserver(updateMotion);

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ['class'],
      }
    );

    return () => {
      media.removeEventListener(
        'change',
        updateMotion
      );

      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      paused ||
      interacting ||
      reduceMotion
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentImage(
        (previous) =>
          (previous + 1) % images.length
      );
    }, 5000);

    return () =>
      window.clearInterval(interval);
  }, [
    paused,
    interacting,
    reduceMotion,
  ]);

  const nextImage = () => {
    setCurrentImage(
      (previous) =>
        (previous + 1) % images.length
    );
  };

  const previousImage = () => {
    setCurrentImage(
      (previous) =>
        (
          previous -
          1 +
          images.length
        ) % images.length
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    setError('');
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const data = await api.post(
        '/auth/login',
        {
          email: email.trim(),
          password,
        }
      );

      login(data);

      const role =
        data.user?.role ?? data.role;

      const destination =
        ['ADMIN', 'SUPERADMIN'].includes(role)
          ? '/admin'
          : role === 'DOCENTE'
            ? '/docente'
            : '/dashboard';

      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          'Error al iniciar sesión.'
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.loginPage}
      data-login-page
    >
      <div className={styles.pageContent}>
        <nav
          className={styles.topbar}
          aria-label="Navegación de inicio de sesión"
        >
          <Link
            to="/"
            className={styles.backHomeButton}
          >
            <FiArrowLeft aria-hidden="true" />
            Volver al inicio
          </Link>
        </nav>

        <div className={styles.loginLayout}>
          <section
            className={styles.formSection}
            aria-labelledby="login-title"
          >
            <div className={styles.loginCard}>
              <header className={styles.formHeader}>
                <div className={styles.headingRow}>
                  <div>
                    <span className={styles.badge}>
                      QUÉ BUENO TENERTE AQUÍ
                    </span>

                    <h1 id="login-title">
                      Iniciar sesión
                    </h1>
                  </div>
                </div>

                <p>
                  Ingresa y continúa tu experiencia.
                </p>
              </header>

              {error && (
                <div
                  className={styles.alert}
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                aria-busy={submitting}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    Correo electrónico
                  </label>

                  <div
                    className={styles.inputContainer}
                  >
                    <FiMail aria-hidden="true" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nombre@correo.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">
                    Contraseña
                  </label>

                  <div
                    className={styles.inputContainer}
                  >
                    <FiLock aria-hidden="true" />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      disabled={submitting}
                      required
                    />

                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      aria-controls="password"
                      disabled={submitting}
                    >
                      {showPassword ? (
                        <FiEyeOff aria-hidden="true" />
                      ) : (
                        <FiEye aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Ingresando...'
                    : 'Ingresar'}

                  {!submitting && (
                    <FiArrowRight aria-hidden="true" />
                  )}
                </button>
              </form>

              <div className={styles.loginOptions}>
                <p>
                  ¿Todavía no tienes una cuenta?
                </p>

                <Link
                  to="/register"
                  className={styles.registerLink}
                >
                  Regístrate
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          <section
            className={styles.carouselSection}
            aria-label="Imágenes de ciudades inteligentes"
            aria-roledescription="carrusel"
            onMouseEnter={() =>
              setInteracting(true)
            }
            onMouseLeave={() =>
              setInteracting(false)
            }
            onFocusCapture={() =>
              setInteracting(true)
            }
            onBlurCapture={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget
                )
              ) {
                setInteracting(false);
              }
            }}
          >
            <img
              key={currentImage}
              src={images[currentImage]}
              alt={`Ciudad inteligente ${
                currentImage + 1
              } de ${images.length}`}
              className={styles.carouselImage}
            />

            <div
              className={styles.imageOverlay}
              aria-hidden="true"
            />

            <div className={styles.imageCaption}>
              <span>SMART CITY CORE</span>

              <h2>
                Ideas que conectan.
                <br />
                Ciudades que avanzan.
              </h2>

              <p>
                Construyendo juntos ciudades
                inteligentes.
              </p>
            </div>

            <button
              type="button"
              className={`${styles.carouselArrow} ${styles.previous}`}
              onClick={previousImage}
              aria-label="Imagen anterior"
            >
              <FiChevronLeft aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`${styles.carouselArrow} ${styles.next}`}
              onClick={nextImage}
              aria-label="Imagen siguiente"
            >
              <FiChevronRight aria-hidden="true" />
            </button>

            <div
              className={styles.carouselFooter}
            >
              <span
                className={styles.imageCounter}
              >
                0{currentImage + 1} / 0
                {images.length}
              </span>

              <div className={styles.indicators}>
                {images.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    aria-label={
                      `Mostrar imagen ${index + 1}`
                    }
                    aria-current={
                      index === currentImage
                        ? 'true'
                        : undefined
                    }
                    className={`${styles.indicator} ${
                      index === currentImage
                        ? styles.active
                        : ''
                    }`}
                    onClick={() =>
                      setCurrentImage(index)
                    }
                  />
                ))}
              </div>

              {!reduceMotion && (
                <button
                  type="button"
                  className={styles.pauseButton}
                  onClick={() =>
                    setPaused(
                      (current) => !current
                    )
                  }
                  aria-label={
                    paused
                      ? 'Reanudar carrusel'
                      : 'Pausar carrusel'
                  }
                >
                  {paused ? (
                    <FiPlay aria-hidden="true" />
                  ) : (
                    <FiPause aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;