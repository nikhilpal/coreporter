import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://app-ixkketuo.fly.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 307) {
      const redirectUrl = error.response.headers.location;
      const secureRedirectUrl = redirectUrl.replace('http:', 'https:');
      originalRequest.url = secureRedirectUrl.replace(originalRequest.baseURL, '');
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
