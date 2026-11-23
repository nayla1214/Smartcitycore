import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './ModuleProgressCards.module.css';

const Score = ({ value }) =>
  value === null || value === undefined ? '—' : `${Number(value) / 10}/10`;
const colors = ['#2563eb', '#168467', '#7854c5'];

const ModuleProgressCards = ({ modules = [] }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const accountKey = String(user?.id ?? user?._id ?? user?.email ?? '');
  const [selection, setSelection] = useState(null);
  const titleRef = useRef(null);
  const triggerRef = useRef(null);
  const restoreFocus = useRef(false);
  const supported = modules.filter(module => module.supported);
  const selected = selection?.accountKey === accountKey
    ? supported.find(module => String(module.id) === selection.id)
    : null;

  useEffect(() => {
    if (selected) titleRef.current?.focus();
    else if (restoreFocus.current) {
      triggerRef.current?.focus();
      restoreFocus.current = false;
    }
  }, [selected?.id, accountKey]);

  const openModule = (module, event) => {
    triggerRef.current = event.currentTarget;
    setSelection({ accountKey, id: String(module.id) });
  };
  const returnToModules = () => {
    restoreFocus.current = true;
    setSelection(null);
  };

  if (!supported.length) return null;

  if (!selected) {
    return (
      <div className={styles.modules}>
        <div className={styles.selectorHeading}>
          <h4>Avance por módulo</h4>
          <p>Selecciona un módulo para consultar sus videos, lecturas y evaluaciones.</p>
        </div>
        <div className={styles.selectorGrid}>
          {supported.map(module => (
            <section key={module.id} className={styles.overview}
              style={{ '--accent': colors[module.order - 1] || colors[0] }}>
              <div className={styles.overviewTop}>
                <span>MÓDULO {module.order}</span>
                <strong>{module.progress} %</strong>
              </div>
              <h4>{module.title}</h4>
              <div className={styles.bar} role="progressbar"
                aria-label={`Avance del módulo ${module.order}`}
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={module.progress}>
                <span style={{ width: `${module.progress}%` }} />
              </div>
              <button type="button" className={styles.openButton}
                onClick={event => openModule(module, event)}>
                Avance del módulo {module.order}
              </button>
            </section>
          ))}
        </div>
      </div>
    );
  }

  const module = selected;
  return (
    <div className={styles.modules}>
      <div className={styles.detailNavigation}>
        <button type="button" className={styles.backButton} onClick={returnToModules}>
          ← Regresar
        </button>
        <span>Avance del módulo {module.order}</span>
      </div>
      <section className={styles.module}
        style={{ '--accent': colors[module.order - 1] || colors[0] }}>
        <header className={styles.header}>
          <div>
            <span>MÓDULO {module.order}</span>
            <h4 ref={titleRef} tabIndex={-1}>{module.title}</h4>
          </div>
          <strong>{module.progress} %</strong>
        </header>
        <div className={styles.bar} role="progressbar"
          aria-label={`Avance del módulo ${module.order}`}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={module.progress}>
          <span style={{ width: `${module.progress}%` }} />
        </div>
        <div className={styles.metrics}>
          <div><strong>{module.completedVideos} / {module.totalVideos}</strong><span>Videos completados</span></div>
          <div><strong>{module.readings.viewed} / {module.readings.total}</strong><span>Enlaces revisados</span></div>
          <div><strong>{module.passedEvaluations} / {module.evaluations.length}</strong><span>Evaluaciones aprobadas</span></div>
        </div>
        <h5>Evaluaciones de los temas</h5>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th scope="col">Tema</th>{isAdmin && <th scope="col">Intentos</th>}<th scope="col">Mejor nota</th><th scope="col">Estado</th></tr></thead>
            <tbody>
              {module.evaluations.map(evaluation => (
                <tr key={evaluation.topic}>
                  <th scope="row">{evaluation.topic}</th>
                  {isAdmin && <td>{evaluation.attempts}</td>}
                  <td><Score value={evaluation.bestScore} /></td>
                  <td><span className={evaluation.passed ? styles.passed : styles.pending}>
                    {evaluation.passed ? 'Aprobada' : evaluation.bestScore != null ? 'Por aprobar' : 'Pendiente'}
                  </span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isAdmin && <p className={styles.total}>Intentos en evaluaciones de los temas: <strong>{module.evaluationAttempts}</strong></p>}
        <div className={styles.integrative}>
          <h5>Evaluación integradora</h5>
          <dl style={{ gridTemplateColumns: isAdmin ? undefined : 'repeat(2, minmax(0, 1fr))' }}>
            {isAdmin && <div><dt>Intentos</dt><dd>{module.integrative.attempts}</dd></div>}
            <div><dt>Mejor nota</dt><dd><Score value={module.integrative.bestScore} /></dd></div>
            <div><dt>Estado</dt><dd className={module.integrative.passed ? styles.passed : styles.pending}>
              {module.integrative.passed ? 'Aprobada' : module.integrative.bestScore != null ? 'Por aprobar' : 'Pendiente'}
            </dd></div>
          </dl>
        </div>
        <details key={module.id} className={styles.readings}>
          <summary>Lecturas por tema</summary>
          <ul>{module.readings.topics.map(topic => (
            <li key={topic.topic}><span>Tema {topic.topic}</span><strong>{topic.viewed} de {topic.total} enlaces</strong></li>
          ))}</ul>
        </details>
        <p className={styles.note}>Avance: videos 25 %, lecturas 25 %, evaluaciones de los temas 25 % e integradora 25 %. El porcentaje de avance es independiente de la nota.</p>
      </section>
    </div>
  );
};

export default ModuleProgressCards;
