import { api } from './api';

// Sincroniza las lecturas locales del usuario autenticado
// sin borrar su registro del navegador.
export const syncLocalReadings = async (user) => {
  const identities = [
    ...new Set(
      [user?.id, user?._id, user?.email]
        .filter(
          (value) =>
            value !== undefined && value !== null
        )
        .map(String)
    ),
  ];

  if (!identities.length) {
    return false;
  }

  const pending = new Map();

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);

      const prefix = identities
        .map(
          (id) => `smartcity:readings:v1:${id}:`
        )
        .find(
          (value) => key?.startsWith(value)
        );

      if (!prefix) {
        continue;
      }

      const topic = key
        .slice(prefix.length)
        .split(':')
        .pop();

      if (!/^[123]\.[1-4]$/.test(topic)) {
        continue;
      }

      try {
        const record = JSON.parse(
          localStorage.getItem(key)
        );

        if (!Array.isArray(record?.visited)) {
          continue;
        }

        const urls =
          pending.get(topic) || new Set();

        record.visited
          .filter(
            (url) => typeof url === 'string'
          )
          .forEach((url) => urls.add(url));

        pending.set(topic, urls);
      } catch {
        // Ignora únicamente registros locales ilegibles.
      }
    }
  } catch {
    return true;
  }

  const results = await Promise.allSettled(
    [...pending]
      .filter(([, urls]) => urls.size > 0)
      .map(([topic, urls]) =>
        api.post(
          `/users/me/readings/${topic}`,
          {
            urls: [...urls],
          }
        )
      )
  );

  return results.every(
    (result) => result.status === 'fulfilled'
  );
};