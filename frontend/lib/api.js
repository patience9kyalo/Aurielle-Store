// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const API_URL = "https://aurielle-store.onrender.com"; // Updated to point to the deployed backend

const getToken = () => {
  if (typeof window === 'undefined') return null; // SSR guard
  return localStorage.getItem('token');
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Every backend controller responds with { success, data, message }. This
// unwraps that consistently so callers just get the data (or a thrown
// ApiError with the backend's own message on failure).
async function request(path, options = {}) {
  const { body, auth = true, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders = {
    // Let the browser set Content-Type (with boundary) for FormData -
    // setting it manually breaks multipart uploads.
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status);
  }

  // Some endpoints return a bare array rather than { success, data } -
  // handle both shapes gracefully.
  return json?.data !== undefined ? json.data : json;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
