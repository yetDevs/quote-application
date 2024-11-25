import axios from 'axios';

const API_BASE_URL = window.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    // You can integrate with your toast notification system here
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export const createQuote = async (quoteData) => {
  return api.post('/api/quote', quoteData);
};

export const getQuote = async (quoteId) => {
  return api.get(`/api/quotes/${quoteId}`);
};

export const downloadQuotePdf = async (quoteId) => {
  const response = await api.get(`/api/quotes/${quoteId}/pdf`, {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `quote_${quoteId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response;
};

export const updateQuote = async (quoteId, quoteData) => {
  return api.put(`/api/quotes/${quoteId}`, quoteData);
};

export const deleteQuote = async (quoteId) => {
  return api.delete(`/api/quotes/${quoteId}`);
};

export default api;