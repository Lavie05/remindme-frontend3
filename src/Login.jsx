import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; 
import './Register.css'; 

const Login = ({ onLoginSuccess, switchToRegister }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ✅ تم تصحيح الرابط: حذف /api واستخدام رابط Render المباشر
            const response = await axios.post('https://remindme-backend3.onrender.com/auth/login', formData);
            
            // ✅ حفظ التوكن في الذاكرة المحلية
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                toast.success("🔑 مرحباً بعودتك!");
                onLoginSuccess(); // ✅ نقلك للداشبورد
            }
        } catch (error) {
            // ✅ عرض رسالة الخطأ القادمة من السيرفر بوضوح
            const errorMsg = error.response?.data?.error || "بيانات الدخول غير صحيحة";
            toast.error(errorMsg);
            console.error("Login Error details:", error.response);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modern-container">
            <div className="glass-card">
                <div className="tech-icon">🔐</div>
                <h2>Remind<span>ME</span></h2>
                <p>مرحباً بعودتك!</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            type="email" 
                            placeholder="البريد الإلكتروني" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            placeholder="كلمة المرور" 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>
                    <button type="submit" className="glow-button" disabled={loading}>
                        {loading ? "جاري التحقق..." : "دخول"}
                    </button>
                </form>
                
                <button onClick={switchToRegister} className="switch-link">
                    ليس لديك حساب؟ انضم الآن
                </button>
            </div>
        </div>
    );
};

export default Login;