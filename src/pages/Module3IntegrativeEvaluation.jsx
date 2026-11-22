import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import styles from './Module3IntegrativeEvaluation.module.css';

const ENDPOINT = '/evaluations/module/3/integrative';

const initialAnswers = (activities) => Object.fromEntries(activities.map((activity) => [activity.id, {}]));

function isComplete(activity, answer) {
  const config = activity.public_config;
  const items = config.statements || config.sentences || config.questions || [];
  return items.length > 0 && items.every((item) => Object.prototype.hasOwnProperty.call(answer || {}, item.id));
}

function answerText(activity, item, answer) {
  const config = activity.public_config;
  if (typeof answer === 'boolean') return answer ? 'Verdadero' : 'Falso';
  const choices = config.word_bank || config.questions?.find((entry) => entry.id === item.itemId)?.options || [];
  return choices.find((choice) => choice.id === answer)?.text || String(answer);
}

export default function Module3IntegrativeEvaluation() {
  const [evaluation, setEvaluation] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  const submittingRef = useRef(false);
  const resultRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.get(ENDPOINT).then((data) => {
      if (!active) return;
      if (!Array.isArray(data.activities) || data.activities.length !== 5 || data.activities.some(activity => !['true_false', 'fill_blanks', 'case_study'].includes(activity.type))) throw new Error('La evaluación no tiene las cinco actividades esperadas.');
      setEvaluation(data); setAnswers(initialAnswers(data.activities));
    }).catch((err) => { if (active) setError(err.message || 'No se pudo cargar la evaluación.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => { if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [result]);

  const updateItem = (id, itemId, value) => setAnswers((previous) => {
    const next = { ...previous[id] };
    if (value === '') delete next[itemId]; else next[itemId] = value;
    return { ...previous, [id]: next };
  });

  const submit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!evaluation.activities.every((activity) => isComplete(activity, answers[activity.id]))) {
      setError('Completa todos los elementos de las cinco actividades antes de enviar.'); return;
    }
    submittingRef.current = true; setSubmitting(true); setError('');
    try {
      const data = await api.post(`${ENDPOINT}/submit`, {
        answers: evaluation.activities.map((activity) => ({ activityId: activity.id, answer: answers[activity.id] })),
      });
      if (!Array.isArray(data.review) || !Number.isFinite(Number(data.percentage))) throw new Error('No se recibió un resultado válido. Consulta tu avance antes de reenviar.');
      setResult(data);
    } catch (err) { setError(err.message || 'No se pudo guardar tu resultado. Inténtalo nuevamente.'); }
    finally { submittingRef.current = false; setSubmitting(false); }
  };

  return <main className={styles.page}><div className={styles.container}>
    <Link to="/course/1" className={styles.backLink}>← Volver al curso</Link>
    <header className={styles.hero}>
      <span className={styles.eyebrow}>EVALUACIÓN INTEGRADORA · MÓDULO 3</span>
      <h1>Integra <span>lo que aprendiste</span></h1>
      <p>Aplica lo aprendido sobre inteligencia artificial, educación inteligente y gemelos digitales.</p>
      <div className={styles.tags}><span>5 actividades</span><span>10 puntos</span><span>Aprobación desde 70 %</span></div>
    </header>
    {loading ? <section className={styles.card} role="status">Cargando evaluación…</section>
      : !evaluation ? <section className={styles.card}><p role="alert">{error}</p><p>Para ingresar debes haber aprobado los temas 3.1, 3.2 y 3.3.</p><button className={styles.secondary} onClick={() => setRetry((value) => value + 1)}>Volver a consultar</button></section>
      : evaluation.passed && !result ? <section className={styles.card}>
        <h2>¡Felicidades!</h2><p>Ya aprobaste la evaluación integradora del módulo 3.</p>
        <p>Calificación: {Number(evaluation.percentage)} %. Tu resultado quedó guardado.</p>
        <div className={styles.actions}><Link className={styles.primary} to="/course/1">Volver al curso →</Link></div>
      </section>
      : result ? <section className={styles.card} ref={resultRef}>
        <div className={result.passed ? styles.success : styles.notice} role="status">
          <h2>{result.passed ? '¡Felicidades! Completaste el módulo 3' : 'Revisa tus respuestas y vuelve a intentarlo'}</h2>
          <p>Calificación: <strong>{result.earnedScore}/{result.maximumScore} puntos · {result.percentage} %</strong></p>
          <p>Tu resultado quedó guardado.</p>
        </div>
        <h2>Revisión de las actividades</h2>
        {result.review.map((review) => {
          const activity = evaluation.activities.find((entry) => entry.id === review.activityId);
          return <article className={styles.reviewCard} key={review.activityId}>
            <h3>{review.title}</h3><p>{Number(review.pointsEarned).toFixed(2)} de {review.pointsPossible} puntos</p>
            {review.items.map((item, index) => {
              const config = activity.public_config;
              const entries = config.statements || config.sentences || config.left_items || config.questions || [];
              const prompt = entries.find((entry) => entry.id === item.itemId);
              return <div className={styles.reviewItem} key={item.itemId || item.position}>
                <strong>{item.correct ? '✓ Correcto' : '✕ Por corregir'} · {prompt?.text || (prompt ? `${prompt.before} ___ ${prompt.after}` : `Posición ${index + 1}`)}</strong>
                <p>Tu respuesta: {answerText(activity, item, item.selectedAnswer)}</p>
                {!item.correct && <p>Respuesta correcta: {answerText(activity, item, item.correctAnswer)}</p>}
              </div>;
            })}
          </article>;
        })}
        <div className={styles.actions}>
          {!result.passed && <button className={styles.primary} onClick={() => { setAnswers(initialAnswers(evaluation.activities)); setResult(null); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Intentar nuevamente</button>}
          <Link className={result.passed ? styles.primary : styles.secondary} to="/course/1">Volver al curso →</Link>
        </div>
      </section>
      : <form onSubmit={submit}>
        <p className={styles.hint}>Las respuestas correctas se mostrarán después de enviar. Cada actividad vale 2 puntos y permite obtener puntos parciales.</p>
        {evaluation.activities.map((activity, index) => {
          const config = activity.public_config;
          const value = answers[activity.id] || {};
          return <section className={styles.card} key={activity.id}>
            <header className={styles.activityHeader}><span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><div><h2>{activity.title}</h2><p>{activity.instructions}</p></div><span className={styles.points}>{activity.score} puntos</span></header>
            <fieldset disabled={submitting} className={styles.fieldset}>
              <legend className={styles.srOnly}>{activity.title}</legend>
              {activity.type === 'true_false' && config.statements.map((item) => <fieldset className={styles.question} key={item.id}><legend>{item.text}</legend><div className={styles.options}>{[true, false].map((choice) => <label key={String(choice)} className={styles.option}><input required type="radio" name={`${activity.id}-${item.id}`} checked={value[item.id] === choice} onChange={() => updateItem(activity.id, item.id, choice)} />{choice ? 'Verdadero' : 'Falso'}</label>)}</div></fieldset>)}
              {activity.type === 'fill_blanks' && <><div className={styles.tags}>{config.word_bank.map((word) => <span key={word.id}>{word.text}</span>)}</div>{config.sentences.map((item) => <label className={styles.sentence} key={item.id}><span>{item.before}</span><select required value={value[item.id] || ''} onChange={(event) => updateItem(activity.id, item.id, event.target.value)}><option value="">Selecciona…</option>{config.word_bank.map((word) => <option key={word.id} value={word.id}>{word.text}</option>)}</select><span>{item.after}</span></label>)}</>}
              {activity.type === 'case_study' && <><aside className={styles.scenario}>{config.scenario}</aside>{config.questions.map((item) => <fieldset className={styles.question} key={item.id}><legend>{item.text}</legend><div className={styles.caseOptions}>{item.options.map((option) => <label className={styles.option} key={option.id}><input required type="radio" name={`${activity.id}-${item.id}`} checked={value[item.id] === option.id} onChange={() => updateItem(activity.id, item.id, option.id)} />{option.text}</label>)}</div></fieldset>)}</>}
            </fieldset>
          </section>;
        })}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}><button className={styles.primary} type="submit" disabled={submitting}>{submitting ? 'Guardando resultado…' : 'Ver resultado →'}</button><Link className={styles.secondary} to="/course/1">Volver al curso</Link></div>
      </form>}
  </div></main>;
}
