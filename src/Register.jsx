import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import API_BASE_URL from './config'; 
import logo from './remindme logo.jfif'; 

const Register = ({ onLoginSuccess, switchToLogin }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ تم التعديل: استدعاء الرابط من config مباشرة دون تكرار /api
            const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
            if (response.status === 201 || response.status === 200) {
                alert("🚀 تم إنشاء الحساب بنجاح!");
                onLoginSuccess(); 
            }
        } catch (error) {
            console.error("Connection Error:", error);
            // جلب رسالة الخطأ الحقيقية من السيرفر إذا وجدت
            const errorMsg = error.response?.data?.error || "السيرفر لا يستجيب.. تأكدي من الاتصال";
            alert("❌ خطأ: " + errorMsg);
        }
    };

    return (
        <div className="modern-container">
            <div className="glass-card">
                <div className="logo-container">
                    <img src={logo} alt="RemindMe Logo" className="site-logo" />
                </div>
                
                <h2>Remind<span>ME</span></h2>
                <p style={{marginBottom: '20px'}}>مستقبل التذكيرات الذكية</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="text" name="username" placeholder="اسم المستخدم" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="email" name="email" placeholder="البريد الإلكتروني" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="password" name="password" placeholder="كلمة المرور" onChange={handleChange} required />
                    </div>
                    <button type="submit" className="glow-button">انضم الآن</button>
                </form>

                <p className="switch-text">
                    لديك حساب بالفعل؟ <span onClick={switchToLogin} style={{color: '#58a6ff', cursor: 'pointer', fontWeight: 'bold'}}>سجل دخولك</span>
                </p>
            </div>
        </div>
    );
};

export default Register;