import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://app-ixkketuo.fly.dev';
const secureBaseUrl = apiBaseUrl.replace('http:', 'https:');

const apiClient = axios.create({
  baseURL: secureBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
