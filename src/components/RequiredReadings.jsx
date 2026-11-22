import { Children, cloneElement, isValidElement, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './RequiredReadings.module.css';
import { api } from '../services/api';

const readRecord = (key) => {
  try {
    const record = JSON.parse(localStorage.getItem(key) || 'null');
    return {
      required: Array.isArray(record?.required) ? record.required.filter(x => typeof x === 'string') : [],
      visited: Array.isArray(record?.visited) ? record.visited.filter(x => typeof x === 'string') : [],
    };
  } catch {
    return { required: [], visited: [] };
  }
};

export const useRequiredReadings = (topic, moduleId) => {
  const { user } = useContext(AuthContext);
  const key = `smartcity:readings:v1:${user?.id ?? user?._id ?? user?.email ?? 'guest'}:${moduleId}:${topic}`;
  const [saved, setSaved] = useState(() => ({ key, ...readRecord(key) }));
  const record = saved.key === key ? saved : { key, ...readRecord(key) };
  const update = (transform) => {
    setSaved(previous => {
      const current = previous.key === key ? previous : { key, ...readRecord(key) };
      const next = { key, ...transform(current) };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Mantiene el avance durante la sesión. */ }
      return next;
    });
  };
  const [readyKey, setReadyKey] = useState('');
  const [syncError, setSyncError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setSyncError('');
    api.get(`/users/me/readings/${topic}`).then(data => {
      if (active) update(current => ({ ...current, visited: [...new Set([...current.visited, ...(data.urls || [])])] }));
    }).catch(() => {
      if (active) setSyncError('El registro está guardado en este navegador; falta sincronizarlo.');
    }).finally(() => { if (active) setReadyKey(key); });
    return () => { active = false; };
  }, [key, topic]);
  const visitedSignature = JSON.stringify(record.visited);
  useEffect(() => {
    if (readyKey !== key) return;
    let active = true;
    api.post(`/users/me/readings/${topic}`, { urls: JSON.parse(visitedSignature) })
      .then(() => { if (active) setSyncError(''); })
      .catch(() => { if (active) setSyncError('El registro está guardado en este navegador; falta sincronizarlo.'); });
    return () => { active = false; };
  }, [key, topic, readyKey, visitedSignature, retry]);
  return {
    key,
    syncError,
    retry: () => setRetry(value => value + 1),
    visited: record.visited,
    complete: record.required.length > 0 && record.required.every(url => record.visited.includes(url)),
    register: (urls) => update(current => ({ ...current, required: urls })),
    mark: (url) => update(current => ({ ...current, visited: [...new Set([...current.visited, url])] })),
  };
};

const visitElements = (children, visit) => {
  Children.forEach(children, child => {
    if (!isValidElement(child)) return;
    visit(child);
    visitElements(child.props.children, visit);
  });
};
const textOf = children => Children.toArray(children).map(child =>
  typeof child === 'string' ? child : isValidElement(child) ? textOf(child.props.children) : ''
).join(' ');

const RequiredReadings = ({ children, gate }) => {
  const links = [];
  visitElements(children, element => {
    if (element.type === 'a' && /^https?:\/\//i.test(element.props.href || '')) links.push(element.props.href);
  });
  const urls = [...new Set(links)];
  const signature = JSON.stringify(urls);
  useEffect(() => { gate.register(JSON.parse(signature)); }, [signature, gate.key]); // Registra los enlaces actuales de este tema.
  const complete = urls.length > 0 && urls.every(url => gate.visited.includes(url));
  const count = urls.filter(url => gate.visited.includes(url)).length;
  const decorate = nodes => Children.map(nodes, element => {
    if (!isValidElement(element)) return element;
    const props = {};
    let content = decorate(element.props.children);
    if (element.type === 'a' && urls.includes(element.props.href)) {
      const seen = gate.visited.includes(element.props.href);
      props.onClick = event => {
        element.props.onClick?.(event);
        if (!event.defaultPrevented) gate.mark(element.props.href);
      };
      props.onAuxClick = event => {
        element.props.onAuxClick?.(event);
        if (event.button === 1 && !event.defaultPrevented) gate.mark(element.props.href);
      };
      if (seen) content = <>{content}<span className={styles.seen}>✓ Visto</span></>;
    }
    if (element.type === 'button' && textOf(element.props.children).includes('Siguiente')) {
      props.disabled = !!element.props.disabled || !complete;
      props.title = complete ? element.props.title : 'Abre todos los artículos para continuar.';
      props.className = `${element.props.className || ''} ${styles.next}`;
    }
    return cloneElement(element, props, content);
  });
  return <div className={styles.readings}>
    <p className={styles.progress} role="status" aria-live="polite">
      {complete ? '✓ Lecturas completadas' : 'Abre todos los artículos para habilitar Siguiente.'}
      <strong>{count} / {urls.length}</strong>
    </p>
    {gate.syncError && <p role="status">{gate.syncError} <button type="button" onClick={gate.retry}>Reintentar</button></p>}
    {decorate(children)}
  </div>;
};
export default RequiredReadings;
