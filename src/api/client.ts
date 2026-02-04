import axios from "axios";

const queryApiEnv = import.meta.env.VITE_QUERY_API_URL;
const uploadApiEnv = import.meta.env.VITE_UPLOAD_API_URL;

const QUERY_API_URL = queryApiEnv
  ? `${queryApiEnv}/api`
  : "http://localhost:3000";
const UPLOAD_API_URL = uploadApiEnv
  ? `${uploadApiEnv}/api`
  : "http://localhost:3000";

// Criando uma instância do axios com configurações padrão
const queryApi = axios.create({
  baseURL: QUERY_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const uploadApi = axios.create({
  baseURL: UPLOAD_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export { queryApi, uploadApi };
export default { queryApi, uploadApi };
