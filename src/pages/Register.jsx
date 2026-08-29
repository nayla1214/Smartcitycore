import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import styles from './Register.module.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta');
    }
  };

  return (
    <main className={styles.registerPage}>
      <section className={styles.registerContainer}>
        <div className={styles.informationPanel}>
          <div className={styles.circleTop}></div>
          <div className={styles.circleBottom}></div>

          <div className={styles.informationContent}>
            <div className={styles.iconBox}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={styles.graduationIcon}
              >
                <path d="M12 3 1.8 8.2 12 13.4l8-4.1v6h2V8.2L12 3Zm-6 9.1v4.2c0 1.7 2.7 3.7 6 3.7s6-2 6-3.7v-4.2l-6 3.1-6-3.1Z" />
              </svg>
            </div>


            <h1>Plataforma de Capacitación SMARTCITYCORE</h1>

            <p>
              Accede a cursos y recursos educativos sobre ciudades inteligentes
              para fortalecer tus conocimientos y capacidades profesionales.
            </p>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formContent}>
            <h2>Registrarse</h2>
            <p className={styles.description}>
              Completa tus datos para acceder a la plataforma.
            </p>

            {error && <div className={styles.alert}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nombres completos</label>

                <div className={styles.inputContainer}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
                  </svg>

                  <input
                    id="name"
                    type="text"
                    placeholder="Ingresa tus nombres completos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Correo electrónico</label>

                <div className={styles.inputContainer}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 5h18v14H3V5Zm9 7 7-5H5l7 5Zm0 2.5L5 9.6V17h14V9.6l-7 4.9Z" />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Contraseña</label>

                <div className={styles.inputContainer}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9h14v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4V7Zm3 8.7V18h-2v-2.3a2 2 0 1 1 2 0Z" />
                  </svg>

                  <input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                Crear cuenta
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className={styles.loginLink}>
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;