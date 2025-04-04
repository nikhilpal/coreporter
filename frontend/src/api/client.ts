import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://app-ixkketuo.fly.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
