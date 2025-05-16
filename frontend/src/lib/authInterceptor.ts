// frontend/src/lib/authInterceptor.ts
import axios from 'axios';

// ฟังก์ชันเพื่อเพิ่ม interceptor ที่ใช้งานกับ cookie-based authentication
export function setupAuthInterceptor() {
  // เพิ่ม interceptor ที่จะทำงานก่อนส่ง request
  axios.interceptors.request.use((config) => {
    // ต้องเพิ่ม withCredentials เพื่อให้ส่ง cookies ไปด้วย
    config.withCredentials = true;
    return config;
  });
  
  // เพิ่ม interceptor ในส่วนของ response เพื่อจัดการ error 401
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized: Please login again');
        // ถ้าเกิด 401 ให้ redirect ไปที่หน้า login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  console.log('Cookie-based auth interceptor setup complete');
}
