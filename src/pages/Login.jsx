import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import styles from './Login.module.css';
// Cambia los nombres si tus imágenes se llaman diferente
import imagen1 from '../assets/ciudad1.jpg';
import imagen2 from '../assets/ciudad2.jpg';
import imagen3 from '../assets/ciudad3.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const images = [imagen1, imagen2, imagen3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((previous) =>
        previous === images.length - 1 ? 0 : previous + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImage((previous) =>
      previous === images.length - 1 ? 0 : previous + 1
    );
  };

  const previousImage = () => {
    setCurrentImage((previous) =>
      previous === 0 ? images.length - 1 : previous - 1
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await api.post('/auth/login', {
        email,
        password,
      });

      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginLayout}>
        {/* Inicio de sesión a la izquierda */}
        <section className={styles.formSection}>
          <div className={styles.loginCard}>
            <h2>Iniciar Sesión</h2>

            {error && (
              <div className={styles.alert}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Correo Electrónico</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Contraseña</label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.loginButton}>
                Ingresar
              </button>
              <div className={styles.loginOptions}>
  <p>
    ¿No tienes una cuenta?{' '}
    <Link to="/register">Regístrate</Link>
  </p>

  <Link to="/" className={styles.backHomeButton}>
    <span aria-hidden="true">←</span>
    Volver al inicio
  </Link>
</div>
            </form>
          </div>
        </section>

        {/* Carrusel a la derecha */}
        <section className={styles.carouselSection}>
          <img
            key={currentImage}
            src={images[currentImage]}
            alt={`Ciudad inteligente ${currentImage + 1}`}
            className={styles.carouselImage}
          />

          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.previous}`}
            onClick={previousImage}
            aria-label="Imagen anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.next}`}
            onClick={nextImage}
            aria-label="Imagen siguiente"
          >
            ›
          </button>

          <div className={styles.indicators}>
            {images.map((_, index) => (
              <button
                type="button"
                key={index}
                aria-label={`Mostrar imagen ${index + 1}`}
                className={`${styles.indicator} ${
                  index === currentImage ? styles.active : ''
                }`}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;