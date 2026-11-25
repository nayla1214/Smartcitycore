import { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  FiArrowLeft,
  FiArrowRight,
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';

import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

import logoSmartCity from '../assets/logo-smartcity-transparente.png';
import styles from './Register.module.css';

const NAME_PATTERN =
  /^[\p{L}\p{M}]+(?:[ '’\-][\p{L}\p{M}]+)*$/u;

const EMAIL_PATTERN =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

const isValidEmail = (email) => {
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return false;
  }

  const [local, domain] = email.split('@');

  return (
    local.length <= 64 &&
    !local.startsWith('.') &&
    !local.endsWith('.') &&
    !local.includes('..') &&
    domain.split('.').every((label) => label.length <= 63)
  );
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    const value = e.target.value;

    // También bloquea números al pegar texto.
    if (/[^\p{L}\p{M} '’\-]/u.test(value)) {
      setNameError(
        'Usa solamente letras, espacios, apóstrofos o guiones.'
      );
      return;
    }

    setName(value);
    setNameError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittingRef.current) return;

    setError('');

    const cleanName = name
      .normalize('NFC')
      .trim()
      .replace(/\s+/gu, ' ');

    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanName.length < 2 ||
      cleanName.length > 120 ||
      !NAME_PATTERN.test(cleanName)
    ) {
      setNameError(
        'Ingresa un nombre válido, sin números y de al menos 2 caracteres.'
      );
      nameRef.current?.focus();
      return;
    }

    setNameError('');

    if (!isValidEmail(cleanEmail)) {
      setError('Ingresa un correo electrónico válido.');
      emailRef.current?.focus();
      return;
    }

    if (password.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError(
        'La contraseña es demasiado larga. Usa una más corta.'
      );
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const data = await api.post('/auth/register', {
        name: cleanName,
        email: cleanEmail,
        password,
      });

      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.message || 'Error al crear la cuenta.'
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.registerPage}
      data-register-page
    >
      <div className={styles.pageContent}>
        <nav
          className={styles.topbar}
          aria-label="Navegación del registro"
        >
          <Link to="/" className={styles.backLink}>
            <FiArrowLeft aria-hidden="true" />
            Volver al inicio
          </Link>
        </nav>

        <div className={styles.registerLayout}>
          <section
            className={styles.presentation}
            aria-labelledby="register-title"
          >
            <span className={styles.welcomeLabel}>
              TU PRÓXIMO PASO COMIENZA AQUÍ
            </span>

            <h1 id="register-title">
              Nuevas ideas.
              <br />
              <span>Más posibilidades.</span>
            </h1>

            <p className={styles.welcomeText}>
              Fortalece tus conocimientos y sé parte
              de la transformación hacia ciudades más
              inteligentes.
            </p>

            <div className={styles.brandVisual}>
              <img
                src={logoSmartCity}
                alt="SMART CITY CORE"
                className={styles.brandLogo}
                width="210"
                height="210"
              />
            </div>

            <Link
              to="/plataforma"
              className={styles.discoverButton}
            >
              Conocer la plataforma
              <FiArrowRight aria-hidden="true" />
            </Link>
          </section>

          <section
            className={styles.formCard}
            aria-labelledby="create-account-title"
          >
            <header className={styles.formHeader}>
              <span className={styles.formBadge}>
                EMPIEZA HOY
              </span>

              <h2 id="create-account-title">
                Crea tu cuenta
              </h2>

              <p>Completa tus datos para comenzar.</p>
            </header>

            {error && (
              <div
                id="register-error"
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
                <label htmlFor="name">
                  Nombres completos
                </label>

                <div className={styles.inputContainer}>
                  <FiUser aria-hidden="true" />

                  <input
                    ref={nameRef}
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Escribe tus nombres completos"
                    value={name}
                    onChange={handleNameChange}
                    autoComplete="name"
                    maxLength={120}
                    aria-invalid={Boolean(nameError)}
                    aria-describedby="name-help"
                    disabled={submitting}
                    required
                  />
                </div>

                <p
                  id="name-help"
                  className={styles.fieldHelp}
                  aria-live="polite"
                >
                  {nameError ||
                    'Solo letras, espacios, apóstrofos o guiones.'}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">
                  Correo electrónico
                </label>

                <div className={styles.inputContainer}>
                  <FiMail aria-hidden="true" />

                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nombre@correo.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">
                  Contraseña
                </label>

                <div className={styles.inputContainer}>
                  <FiLock aria-hidden="true" />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword ? 'text' : 'password'
                    }
                    placeholder="Crea tu contraseña"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    aria-describedby="password-help"
                    minLength={6}
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

                <p
                  id="password-help"
                  className={styles.fieldHelp}
                >
                  Utiliza al menos 6 caracteres.
                </p>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className={styles.spinner}
                      aria-hidden="true"
                    />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <FiArrowRight aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className={styles.loginSection}>
              <p>¿Ya tienes una cuenta?</p>

              <Link
                to="/login"
                className={styles.loginLink}
              >
                Inicia sesión
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Register;