const API = import.meta.env.VITE_API_URL || '/api';
console.log('[BacWeb] API URL:', API);
console.log('[BacWeb] Mode:', import.meta.env.MODE);

export default API;
