// 📁 frontend/src/axiosConfig.ts
import axios from 'axios'

// ให้ axios ใช้ cookie ทุกครั้ง และ proxy /api → backend
axios.defaults.withCredentials = true

// ติด interceptor ดัก 401 แค่กับ “data-fetch” routes เท่านั้น
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const status = error.response?.status
    const url = config.url || ''

    // ถ้า 401, ยังไม่เคย retry, และไม่ใช่ /auth/me หรือ /auth/refresh
    if (
      status === 401 &&
      !config._retry &&
      !url.endsWith('/auth/me') &&
      !url.endsWith('/auth/refresh')
    ) {
      config._retry = true
      try {
        // เรียก refresh token
        await axios.post('/api/auth/refresh', {})
        // retry request เดิม
        return axios(config)
      } catch {
        // ถ้า refresh ยัง 401 จริง ๆ ยก error ดั้งเดิมกลับไป
        return Promise.reject(error)
      }
    }

    // default: ยก error กลับ
    return Promise.reject(error)
  }
)

export default axios
