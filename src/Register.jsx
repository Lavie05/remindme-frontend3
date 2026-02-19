import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import API_BASE_URL from './config'; // استيراد الرابط من ملف config

const Register = ({ onLoginSuccess, switchToLogin }) => { // أضفنا switchToLogin لتمكين التنقل
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ استخدام API_BASE_URL بدلاً من كتابة الرابط يدوياً
            const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
            
            if (response.status === 201 || response.status === 200) {
                alert("🚀 تم إنشاء الحساب بنجاح!");
                onLoginSuccess(); 
            }
        } catch (error) {
            console.error("Connection Error:", error);
            const errorMsg = error.response?.data?.error || "السيرفر لا يستجيب.. تأكدي أن السيرفر يعمل بشكل صحيح على Render";
            alert("❌ خطأ: " + errorMsg);
        }
    };

    return (
        <div className="modern-container">
            <div className="glass-card">
                <div className="tech-icon">🤖</div>
                <h2>Remind<span>ME</span></h2>
                <p>مستقبل التذكيرات الذكية</p>
                
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

                {/* زر إضافي للعودة لصفحة الدخول إذا كان لديه حساب */}
                <p className="switch-text">
                    لديك حساب بالفعل؟ <span onClick={switchToLogin} style={{cursor: 'pointer', color: 'var(--accent-color)'}}>سجل دخولك</span>
                </p>
            </div>
        </div>
    );
};

export default Register;