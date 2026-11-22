import { openCertificateExample } from '../services/certificateExample';
import { useContext, useMemo, useState } from 'react';
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiEdit2,
  FiMail,
  FiPlayCircle,
  FiSave,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
const [error, setError] = useState('');
const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const statistics = {
    coursesStarted: user?.statistics?.coursesStarted || 0,
    coursesCompleted: user?.statistics?.coursesCompleted || 0,
    videosCompleted: user?.statistics?.videosCompleted || 0,
    progress: user?.statistics?.progress || 0,
  };

const initial = useMemo(() => {
  return user?.name?.trim().charAt(0).toUpperCase() || 'U';
}, [user?.name]);

  const registrationDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'No disponible';

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

const handleSave = async (event) => {
  event.preventDefault();

  setMessage('');
  setError('');
  setSaving(true);

  try {
    await updateUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
    });

    setEditing(false);
    setMessage(
      'Tu información se actualizó correctamente.',
    );

    window.setTimeout(() => {
      setMessage('');
    }, 3000);
  } catch (requestError) {
    setError(
      requestError.message ||
        'No se pudo actualizar el perfil.',
    );
  } finally {
    setSaving(false);
  }
};

  const handleCertificate = (print) => {
    setError('');
    try { openCertificateExample(user?.name || 'Nombre del participante', { print }); }
    catch (certificateError) { setError(certificateError.message); }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });

    setEditing(false);
  };

  return (
    <main className={styles.profilePage}>
      <section className={styles.profileHeader}>
        <div className={styles.identity}>
          <div className={styles.avatar}>
  {initial}
</div>

          <div>
            <span className={styles.headerLabel}>
              Mi cuenta
            </span>

            <h1>{user?.name || 'Usuario'}</h1>

            <p>
              Consulta tu información personal y el progreso alcanzado
              en la plataforma.
            </p>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            className={styles.editButton}
            onClick={() => setEditing(true)}
          >
            <FiEdit2 />
            Editar perfil
          </button>
        )}
      </section>

      {message && (
        <div className={styles.successMessage}>
          <FiCheckCircle />
          {message}
        </div>
      )}
      {error && (
  <div className={styles.errorMessage}>
    <FiX />
    {error}
  </div>
)}

      <section className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Datos personales
                </span>

                <h2>Información del perfil</h2>
              </div>

              <FiUser className={styles.headerIcon} />
            </div>

            {editing ? (
              <form
                className={styles.profileForm}
                onSubmit={handleSave}
              >
                <label>
                  Nombres completos

                  <div className={styles.inputContainer}>
                    <FiUser />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ingresa tus nombres"
                      required
                    />
                  </div>
                </label>

                <label>
                  Correo electrónico

                  <div className={styles.inputContainer}>
                    <FiMail />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                </label>

                <div className={styles.formButtons}>
                  <button
  type="submit"
  className={styles.saveButton}
  disabled={saving}
>
  <FiSave />

  {saving
    ? 'Guardando...'
    : 'Guardar cambios'}
</button>

                  <button
  type="button"
  className={styles.cancelButton}
  onClick={handleCancel}
  disabled={saving}
>
  <FiX />
  Cancelar
</button>
                </div>
              </form>
            ) : (
              <div className={styles.personalInformation}>
                <div className={styles.informationRow}>
                  <div className={styles.informationIcon}>
                    <FiUser />
                  </div>

                  <div>
                    <span>Nombre completo</span>
                    <strong>{user?.name || 'No registrado'}</strong>
                  </div>
                </div>

                <div className={styles.informationRow}>
                  <div className={styles.informationIcon}>
                    <FiMail />
                  </div>

                  <div>
                    <span>Correo electrónico</span>
                    <strong>{user?.email || 'No registrado'}</strong>
                  </div>
                </div>

                <div className={styles.accountDetails}>
                  <div>
                    <span>Tipo de cuenta</span>
                    <strong>
                      {user?.role === 'ADMIN'
                        ? 'Administrador'
                        : 'Usuario'}
                    </strong>
                  </div>

                  <div>
                    <span>Fecha de ingreso</span>
                    <strong>{registrationDate}</strong>
                  </div>
                </div>
              </div>
            )}
          </article>

          
        </div>

        <div className={styles.rightColumn}>
          <article className={styles.card}>
            <div className={styles.cardHeader}><div><span className={styles.cardEyebrow}>Certificación</span><h2>Mi certificado</h2></div><FiAward className={styles.headerIcon} /></div>
            <div className={styles.certificateInformation}>
              <div className={styles.certificateThumbnail} aria-hidden="true"><span>SMARTCITYCORE · UNESUM</span><strong>CERTIFICADO</strong><div /><small>{user?.name || 'Nombre del participante'}</small><i>EJEMPLO</i></div>
              <span className={styles.exampleBadge}>Ejemplo de diseño</span>
              <h3>Introducción a Ciudades Inteligentes</h3>
              <p>Revisa cómo se verá tu certificado con tu nombre y los datos del curso.</p>
              <div className={styles.certificateActions}>
                <button type="button" className={styles.saveButton} onClick={() => handleCertificate(false)}>Ver ejemplo <span aria-hidden="true">↗</span></button>
                <button type="button" className={styles.cancelButton} onClick={() => handleCertificate(true)}>Guardar ejemplo PDF</button>
              </div>
              <p className={styles.certificateNote}>Esta es una muestra de diseño, sin validez. El certificado definitivo se habilitará cuando se conecte la validación de aprobación del curso.</p>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Reconocimientos
                </span>

                <h2>Mis logros</h2>
              </div>

              <FiAward className={styles.headerIcon} />
            </div>

            <div className={styles.achievements}>
              <div
                className={`${styles.achievement} ${
                  statistics.coursesStarted > 0
                    ? styles.unlocked
                    : ''
                }`}
              >
                <FiBookOpen />
                <div>
                  <strong>Primer paso</strong>
                  <span>Inicia tu primer curso</span>
                </div>
              </div>

              <div
                className={`${styles.achievement} ${
                  statistics.videosCompleted >= 5
                    ? styles.unlocked
                    : ''
                }`}
              >
                <FiPlayCircle />
                <div>
                  <strong>Aprendiz constante</strong>
                  <span>Completa cinco videos</span>
                </div>
              </div>

              <div
                className={`${styles.achievement} ${
                  statistics.coursesCompleted > 0
                    ? styles.unlocked
                    : ''
                }`}
              >
                <FiAward />
                <div>
                  <strong>Meta alcanzada</strong>
                  <span>Completa tu primer curso</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
};

export default Profile;