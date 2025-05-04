// frontend/src/lib/real-api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',         // พอเดินบน 5173 แล้ว proxy จะ forward ไป 3001
  withCredentials: true,    // ให้ส่ง httpOnly cookie ไปด้วย
})

export default api