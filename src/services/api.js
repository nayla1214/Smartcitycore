const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/+$/, '');

const getHeaders = (customHeaders = {}) => {
  const token = localStorage.getItem('token');

  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  new Headers(customHeaders).forEach((value, key) => {
    headers.set(key, value);
  });

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();

    return data.message || 'Error en la petición.';
  } catch {
    return `No se pudo completar la petición (${response.status}).`;
  }
};

const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        ...options,
        headers: getHeaders(options.headers),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response)
      );
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(
      `API Error (${endpoint}):`,
      error
    );

    throw error;
  }
};

const download = async (
  endpoint,
  filename = 'reporte.pdf',
  options = {}
) => {
  try {
    const headers = getHeaders(options.headers);

    headers.set('Accept', 'application/pdf');

    const response = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        ...options,
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response)
      );
    }

    const contentType = (
      response.headers.get('Content-Type') || ''
    ).toLowerCase();

    if (!contentType.includes('application/pdf')) {
      throw new Error(
        'El servidor no devolvió un archivo PDF válido.'
      );
    }

    const blob = await response.blob();

    if (!blob.size) {
      throw new Error(
        'El reporte recibido está vacío.'
      );
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);

    try {
      link.click();
    } finally {
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 30000);
    }
  } catch (error) {
    console.error(
      `Error descargando archivo (${endpoint}):`,
      error
    );

    throw error;
  }
};

export const api = {
  get: (endpoint, options) =>
    request(endpoint, {
      method: 'GET',
      ...options,
    }),

  post: (endpoint, body, options) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  put: (endpoint, body, options) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, options) =>
    request(endpoint, {
      method: 'DELETE',
      ...options,
    }),

  download,
};