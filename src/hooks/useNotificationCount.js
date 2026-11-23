import {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  AuthContext,
} from '../context/AuthContext';

import { api } from '../services/api';

export const notifyNotificationsChanged = () => {
  window.dispatchEvent(
    new Event('smartcity:notifications-changed')
  );
};

export default function useNotificationCount() {
  const { user } = useContext(AuthContext);

  const identity = String(
    user?.id ??
    user?._id ??
    user?.email ??
    ''
  );

  const [state, setState] = useState({
    identity: '',
    count: null,
  });

  useEffect(() => {
    if (!identity) {
      return undefined;
    }

    let active = true;
    let pending = false;

    const refresh = async () => {
      if (
        !active ||
        pending ||
        document.visibilityState === 'hidden'
      ) {
        return;
      }

      pending = true;

      try {
        const data = await api.get(
          '/foro/notifications'
        );

        if (active) {
          setState({
            identity,
            count:
              Number(data.unreadCount) || 0,
          });
        }
      } catch {
        // La página de notificaciones permite
        // consultar el error y volver a intentar.
        if (active) {
          setState({
            identity,
            count: null,
          });
        }
      } finally {
        pending = false;
      }
    };

    refresh();

    const interval = window.setInterval(
      refresh,
      30000
    );

    window.addEventListener(
      'focus',
      refresh
    );

    document.addEventListener(
      'visibilitychange',
      refresh
    );

    window.addEventListener(
      'smartcity:notifications-changed',
      refresh
    );

    return () => {
      active = false;

      window.clearInterval(interval);

      window.removeEventListener(
        'focus',
        refresh
      );

      document.removeEventListener(
        'visibilitychange',
        refresh
      );

      window.removeEventListener(
        'smartcity:notifications-changed',
        refresh
      );
    };
  }, [identity]);

  return state.identity === identity
    ? state.count
    : null;
}