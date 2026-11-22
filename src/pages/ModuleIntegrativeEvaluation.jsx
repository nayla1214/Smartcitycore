import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import styles from './ModuleIntegrativeEvaluation.module.css';

const ENDPOINT = '/evaluations/module/1/integrative';
const colors = ['#3875ce', '#8c67bd', '#239378', '#cd8734'];

function MatchingActivity({ activity, value, onChange, disabled }) {
  const board = useRef(null);
  const elements = useRef({});
  const [selected, setSelected] = useState(null);
  const [lines, setLines] = useState([]);
  const { left_items: left, right_items: right } = activity.public_config;

  useLayoutEffect(() => {
    const measure = () => {
      if (!board.current) return;
      const bounds = board.current.getBoundingClientRect();
      setLines(left.flatMap((item, index) => {
        const from = elements.current[`left-${item.id}`];
        const to = elements.current[`right-${value[item.id]}`];
        if (!from || !to) return [];
        const a = from.getBoundingClientRect();
        const b = to.getBoundingClientRect();
        return [{ id: item.id, color: colors[index % colors.length],
          x1: a.right - bounds.left, y1: a.top + a.height / 2 - bounds.top,
          x2: b.left - bounds.left, y2: b.top + b.height / 2 - bounds.top }];
      }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (board.current) observer.observe(board.current);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [left, value]);

  const connect = (rightId) => {
    if (!selected || disabled) return;
    const next = { ...value };
    Object.keys(next).forEach((key) => { if (next[key] === rightId) delete next[key]; });
    next[selected] = rightId;
    onChange(next);
    setSelected(null);
  };

  return <>
    <p className={styles.hint}>Selecciona un concepto a la izquierda y su definición a la derecha. Puedes cambiar cualquier relación.</p>
    <div className={styles.matchBoard} ref={board}>
      <svg className={styles.connections} aria-hidden="true">
        {lines.map((line) => <line key={line.id} {...Object.fromEntries(['x1','x2','y1','y2'].map((key) => [key,line[key]]))} stroke={line.color} strokeWidth="3" />)}
      </svg>
      <div className={styles.matchColumn}>
        {left.map((item, index) => <button key={item.id} type="button" disabled={disabled}
          ref={(element) => { elements.current[`left-${item.id}`] = element; }}
          aria-pressed={selected === item.id}
          className={`${styles.matchItem} ${selected === item.id ? styles.selected : ''}`}
          style={value[item.id] ? { borderColor: colors[index % colors.length] } : undefined}
          onClick={() => setSelected(selected === item.id ? null : item.id)}>
          <strong>{index + 1}.</strong> {item.text}
          {value[item.id] && <small>Conectado con {right.findIndex((definition) => definition.id === value[item.id]) + 1}</small>}
        </button>)}
      </div>
      <div className={styles.matchColumn}>
        {right.map((item, index) => <button key={item.id} type="button" disabled={disabled || !selected}
          ref={(element) => { elements.current[`right-${item.id}`] = element; }}
          className={styles.matchItem} onClick={() => connect(item.id)}>
          <strong>{index + 1}.</strong> {item.text}
        </button>)}
      </div>
    </div>
    <div className={styles.mobileMatching}>
      {left.map((item) => <label key={item.id} className={styles.field}>{item.text}
        <select disabled={disabled} value={value[item.id] || ''} onChange={(event) => {
          const next = { ...value }; if (event.target.value) next[item.id] = event.target.value; else delete next[item.id]; onChange(next);
        }}>
          <option value="">Selecciona una definición</option>
          {right.map((definition) => <option key={definition.id} value={definition.id}
            disabled={Object.entries(value).some(([key, val]) => key !== item.id && val === definition.id)}>{definition.text}</option>)}
        </select>
      </label>)}
    </div>
    <span className={styles.hint} role="status">{Object.keys(value).length} de {left.length} relaciones completadas.</span>
  </>;
}

const initialAnswers = (activities) => Object.fromEntries(activities.map((activity) => [activity.id,
  activity.type === 'ordering' ? activity.public_config.items.map((item) => item.id) : {}]));

function isComplete(activity, answer) {
  const config = activity.public_config;
  if (activity.type === 'ordering') return Array.isArray(answer) && answer.length === config.items.length && new Set(answer).size === answer.length;
  const items = config.statements || config.sentences || config.left_items || config.questions || [];
  return items.length > 0 && items.every((item) => Object.prototype.hasOwnProperty.call(answer || {}, item.id)) &&
    (activity.type !== 'matching' || new Set(Object.values(answer)).size === items.length);
}

function answerText(activity, item, answer) {
  const config = activity.public_config;
  if (typeof answer === 'boolean') return answer ? 'Verdadero' : 'Falso';
  if (activity.type === 'ordering') return config.items.find((entry) => entry.id === answer)?.text || String(answer);
  const choices = config.word_bank || config.right_items || config.questions?.find((entry) => entry.id === item.itemId)?.options || [];
  return choices.find((choice) => choice.id === answer)?.text || String(answer);
}

export default function ModuleIntegrativeEvaluation() {
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
      if (!Array.isArray(data.activities) || data.activities.length !== 5) throw new Error('La evaluación no tiene las cinco actividades esperadas.');
      setEvaluation(data); setAnswers(initialAnswers(data.activities));
    }).catch((err) => { if (active) setError(err.message || 'No se pudo cargar la evaluación.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => { if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [result]);

  const update = (id, answer) => setAnswers((previous) => ({ ...previous, [id]: answer }));
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
      <span className={styles.eyebrow}>EVALUACIÓN INTEGRADORA · MÓDULO 1</span>
      <h1>Integra <span>lo que aprendiste</span></h1>
      <p>Aplica los fundamentos de las ciudades inteligentes, la gobernanza, la transformación urbana y las plataformas web.</p>
      <div className={styles.tags}><span>5 actividades</span><span>10 puntos</span><span>Aprobación desde 70 %</span></div>
    </header>
    {loading ? <section className={styles.card} role="status">Cargando evaluación…</section>
      : !evaluation ? <section className={styles.card}><p role="alert">{error}</p><p>Para ingresar debes haber aprobado los temas 1.1, 1.2, 1.3 y 1.4.</p><button className={styles.secondary} onClick={() => setRetry((value) => value + 1)}>Volver a consultar</button></section>
      : evaluation.passed && !result ? <section className={styles.card}>
        <h2>¡Felicidades!</h2><p>Ya aprobaste la evaluación integradora del módulo 1.</p>
        <p>Calificación: {Number(evaluation.percentage)} %. Tu resultado quedó guardado.</p>
        <div className={styles.actions}><Link className={styles.primary} to="/module/2/topic/2.1">Continuar al tema 2.1 →</Link></div>
      </section>
      : result ? <section className={styles.card} ref={resultRef}>
        <div className={result.passed ? styles.success : styles.notice} role="status">
          <h2>{result.passed ? '¡Felicidades! Completaste el módulo 1' : 'Revisa tus respuestas y vuelve a intentarlo'}</h2>
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
          {result.passed && <Link className={styles.primary} to="/module/2/topic/2.1">Continuar al tema 2.1 →</Link>}
          <Link className={styles.secondary} to="/course/1">Volver al curso</Link>
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
              {activity.type === 'matching' && <MatchingActivity activity={activity} value={value} disabled={submitting} onChange={(answer) => update(activity.id, answer)} />}
              {activity.type === 'ordering' && <ol className={styles.orderList}>{value.map((id, position) => <li className={styles.orderItem} key={id}><span className={styles.orderPosition}>{position + 1}</span><span>{config.items.find((item) => item.id === id)?.text}</span><div className={styles.moveButtons}>{[-1, 1].map((direction) => <button key={direction} type="button" disabled={submitting || position + direction < 0 || position + direction >= value.length} aria-label={`${direction === -1 ? 'Subir' : 'Bajar'} paso ${position + 1}`} onClick={() => { const next = [...value]; [next[position], next[position + direction]] = [next[position + direction], next[position]]; update(activity.id, next); }}>{direction === -1 ? '↑' : '↓'}</button>)}</div></li>)}</ol>}
              {activity.type === 'case_study' && <><aside className={styles.scenario}>{config.scenario}</aside>{config.questions.map((item) => <fieldset className={styles.question} key={item.id}><legend>{item.text}</legend><div className={styles.caseOptions}>{item.options.map((option) => <label className={styles.option} key={option.id}><input required type="radio" name={`${activity.id}-${item.id}`} checked={value[item.id] === option.id} onChange={() => updateItem(activity.id, item.id, option.id)} />{option.text}</label>)}</div></fieldset>)}</>}
            </fieldset>
          </section>;
        })}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}><button className={styles.primary} type="submit" disabled={submitting}>{submitting ? 'Guardando resultado…' : 'Ver resultado →'}</button><Link className={styles.secondary} to="/course/1">Volver al curso</Link></div>
      </form>}
  </div></main>;
}
