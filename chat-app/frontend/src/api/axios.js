import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// ── Request interceptor: attach JWT access token ──
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 → refresh token ──
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh once per request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post('/api/token/refresh/', {
                    refresh: refreshToken,
                });

                // Save new tokens
                localStorage.setItem('access_token', data.access);
                if (data.refresh) {
                    localStorage.setItem('refresh_token', data.refresh);
                }

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — force logout
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
