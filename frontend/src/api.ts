import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { Token } from './utils';

const BACKEND_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3000';
const REQUEST_TIMEOUT = 5000;

const SILENT_401_URLS = ['/auth/check'];

export const createAPI = (): AxiosInstance => {
  const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: REQUEST_TIMEOUT,
  });

  api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const token = Token.get();

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
  );

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      const url = error.config?.url ?? '';
      const isSilent = status === 401 && SILENT_401_URLS.some((u) => url.startsWith(u));

      if (!isSilent) {
        toast.dismiss();
        const data = error.response?.data as { message?: string } | undefined;
        toast.warn(data?.message ?? error.message);
      }

      return Promise.reject(error);
    },
  );

  return api;
};
