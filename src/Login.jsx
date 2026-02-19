import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; 

const Login = ({ onLoginSuccess, switchToRegister }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ تم التعديل: استبدال localhost برابط Render الجديد الخاص بكِ
            const response = await axios.post('https://remindme-backend3.onrender.com/api/auth/login', formData);
            
            alert("🔑 تم تسجيل الدخول بنجاح!");
            onLoginSuccess(); 
        } catch (error) {
            alert("❌ خطأ: " + (error.response?.data?.error || "بيانات الدخول غير صحيحة"));
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
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            placeholder="كلمة المرور" 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                        />
                    </div>
                    <button type="submit" className="glow-button">دخول</button>
                </form>
                
                <button onClick={switchToRegister} className="switch-link" style={{background:'none', border:'none', color:'#58a6ff', marginTop:'15px', cursor:'pointer'}}>
                    ليس لديك حساب؟ انضم الآن
                </button>
            </div>
        </div>
    );
};

export default Login;