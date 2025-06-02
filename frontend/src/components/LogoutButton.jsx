import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton({ className = '' }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?');
    if (!confirmed) return;

    try {
      // เรียก backend เพื่อล้าง cookie
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // ต้องมีเพื่อส่ง cookie
      });

      // ลบ cookie บน frontend
      Cookies.remove('token');

      // ส่งกลับไปหน้า login
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-white text-red-600 font-bold py-2 px-4 rounded hover:bg-gray-100 transition ${className}`}
    >
      Logout
    </button>
  );
}
