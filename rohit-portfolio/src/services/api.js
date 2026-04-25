/**
 * src/services/api.js
 * Central Axios instance for all Django API calls.
 * - Attaches JWT access token from memory on every request
 * - Auto-refreshes on 401 and retries the original request
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// In-memory token store (never persisted to localStorage)
let accessToken = null;
export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // send httpOnly cookies (refresh token) automatically
});

// ── Request interceptor — attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
});

// ── Response interceptor — handle 401 & refresh ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Only attempt refresh on 401, not on the refresh endpoint itself
        if (
            error.response?.status === 401 &&
            !original._retry &&
            !original.url?.includes('auth/refresh')
        ) {
            if (isRefreshing) {
                // Queue all requests that arrive while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    original.headers['Authorization'] = `Bearer ${token}`;
                    return api(original);
                });
            }

            original._retry = true;
            isRefreshing = true;

            try {
                // Refresh token is in httpOnly cookie — sent automatically
                const { data } = await axios.post(
                    `${BASE_URL}/auth/refresh/`,
                    {},
                    { withCredentials: true }
                );
                setAccessToken(data.access);
                processQueue(null, data.access);
                original.headers['Authorization'] = `Bearer ${data.access}`;
                return api(original);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAccessToken();
                // Redirect to admin login
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/admin';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
