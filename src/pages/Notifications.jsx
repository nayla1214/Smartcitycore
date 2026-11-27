import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCheckCircle, FiMessageSquare, FiRefreshCw } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { notifyNotificationsChanged } from '../hooks/useNotificationCount';
import styles from './Notifications.module.css';

const dateLabel = date => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleString('es-EC', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};
const Notifications = () => {
  const { user } = useContext(AuthContext);
  const identity = String(user?.id ?? user?._id ?? user?.email ?? '');
  const generation = useRef(0);
  const lock = useRef(false);
  const actionLock = useRef(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(null);

  const load = async (append = false, ticket = generation.current) => {
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/foro/notifications?offset=${append ? items.length : 0}`);
      if (generation.current !== ticket) return;
      setItems(current => append ? [...new Map([...current, ...data.notifications].map(item => [item.id, item])).values()] : data.notifications);
      setTotal(data.total);
      setUnread(data.unreadCount);
      setHasMore(data.hasMore);
    } catch (requestError) {
      if (generation.current === ticket) setError(requestError.message || 'No se pudieron cargar las notificaciones.');
    } finally {
      if (generation.current === ticket) { lock.current = false; setLoading(false); }
    }
  };
  useEffect(() => {
    const ticket = ++generation.current;
    lock.current = false;
    actionLock.current = false;
    setBusy(false);
    setItems([]); setTotal(0); setUnread(0); setOpened(null); setHasMore(false);
    load(false, ticket);
    return () => { generation.current += 1; };
  }, [identity]);

  const openComment = async item => {
    if (actionLock.current) return;
    setOpened(current => current === item.id ? null : item.id);
    if (item.read) return;
    const ticket = generation.current;
    actionLock.current = true;
    setBusy(true); setError('');
    try {
      await api.post(`/foro/notifications/${item.id}/read`, {});
      if (ticket !== generation.current) return;
      setItems(current => current.map(row => row.id === item.id ? { ...row, read: true } : row));
      setUnread(current => Math.max(0, current - 1));
      notifyNotificationsChanged();
    } catch (requestError) {
      if (ticket === generation.current) setError(requestError.message || 'No se pudo marcar el aviso como leído.');
    } finally { if (ticket === generation.current) { actionLock.current = false; setBusy(false); } }
  };
  const markAll = async () => {
    if (actionLock.current || loading) return;
    const ticket = generation.current;
    actionLock.current = true;
    setBusy(true); setError('');
    try {
      await api.post('/foro/notifications/read-all', {});
      if (ticket !== generation.current) return;
      notifyNotificationsChanged();
      await load(false, ticket);
    } catch (requestError) {
      if (ticket === generation.current) setError(requestError.message || 'No se pudieron marcar los avisos como leídos.');
    } finally { if (ticket === generation.current) { actionLock.current = false; setBusy(false); } }
  };

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>MI CUENTA</span><h1>Notificaciones</h1><h3>
 <h3>
  {item.actorRole === 'DOCENTE'
    ? `Tu docente ${item.actorName} dejó una observación en tu respuesta del tema ${item.topicNumber}.`
    : `${item.actorName} comentó tu respuesta del tema ${item.topicNumber}.`}
</h3>
</h3></div>
      <div className={styles.bell}><FiBell /><strong>{unread}</strong><span>Sin leer</span></div>
    </header>
    <section className={styles.panel}>
      <div className={styles.toolbar}><h2>Comentarios en mis respuestas <span>{total}</span></h2><div>
        <button type="button" className={styles.secondary} onClick={() => load(false)} disabled={loading || busy}><FiRefreshCw /> Actualizar</button>
        <button type="button" className={styles.primary} onClick={markAll} disabled={loading || busy || unread === 0}><FiCheckCircle /> Marcar todas como leídas</button>
      </div></div>
      {error && <div className={styles.error} role="alert">{error} <button type="button" onClick={() => load(false)} disabled={loading || busy}>Reintentar</button></div>}
      {loading && items.length === 0 && <p className={styles.empty} role="status">Cargando notificaciones...</p>}
      {!loading && !error && items.length === 0 && <div className={styles.empty}><FiBell /><h3>No tienes notificaciones</h3><p>Cuando alguien comente una respuesta tuya, el aviso aparecerá aquí.</p></div>}
      <div className={styles.list}>{items.map(item => <article key={item.id} className={`${styles.item} ${!item.read ? styles.unread : ''}`}>
        <div className={styles.avatar}>{item.actorName?.trim().charAt(0).toUpperCase() || <FiMessageSquare />}</div>
        <div className={styles.content}>
          <div className={styles.titleRow}><h3>{item.actorName} comentó tu respuesta del tema {item.topicNumber}.</h3>{!item.read && <span className={styles.new}>Sin leer</span>}</div>
          <time dateTime={item.createdAt}>{dateLabel(item.createdAt)}</time>
          <p className={styles.excerpt}>{item.content}</p>
          <button type="button" className={styles.view} onClick={() => openComment(item)} disabled={busy} aria-expanded={opened === item.id} aria-controls={`comment-${item.id}`}>{opened === item.id ? 'Ocultar comentario' : 'Ver comentario'} →</button>
          {opened === item.id && <div id={`comment-${item.id}`} className={styles.detail}>
            <h4>Tu respuesta · Tema {item.topicNumber}</h4><p>{item.postContent}</p>
            <h4>
  {item.actorRole === 'DOCENTE'
    ? `Comentario del docente ${item.actorName}`
    : `Comentario de ${item.actorName}`}
</h4><p>{item.content}</p>
            <Link to={`/module/${item.topicNumber.split('.')[0]}/topic/${item.topicNumber}`}>Ir al tema {item.topicNumber} →</Link>
          </div>}
        </div>
      </article>)}</div>
      {hasMore && <div className={styles.more}><button type="button" className={styles.secondary} disabled={loading || busy} onClick={() => load(true)}>{loading ? 'Cargando...' : 'Cargar más'}</button></div>}
    </section>
  </main>;
};
export default Notifications;
