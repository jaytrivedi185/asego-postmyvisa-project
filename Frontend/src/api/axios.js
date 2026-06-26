import axios from 'axios';
import { ASEGO_API_BASE_URL } from '../config/asego';

const apiClient = axios.create({
  baseURL: ASEGO_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;
