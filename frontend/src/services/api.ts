import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // Importante para enviar cookies de refresh token
} );

// Interceptor de Requisição (Anexar Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@Prefeitura:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta (Silent Refresh)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh ou login
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/login" &&
      originalRequest.url !== "/refresh"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/refresh");
        const { token } = response.data;

        localStorage.setItem("@Prefeitura:token", token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Se falhar o refresh, desloga o usuário (ou trata como preferir)
        localStorage.removeItem("@Prefeitura:token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
