import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

// أضفنا onLoginSuccess هنا كـ prop لاستدعائها عند النجاح
const Register = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // تأكدي أن السيرفر يعمل على بورت 5000
            const response = await axios.post('http://localhost:5000/auth/register', formData);
            
            if (response.status === 201 || response.status === 200) {
                alert("🚀 تم إنشاء الحساب بنجاح!");
                onLoginSuccess(); // هذه الدالة ستغير الحالة في App.jsx وتنقلك للـ Dashboard
            }
        } catch (error) {
            console.error("Connection Error:", error);
            // حل مشكلة الـ Timeout برمجياً هنا
            const errorMsg = error.response?.data?.error || "السيرفر لا يستجيب.. تأكدي من تفعيل CORS في الباك-إند";
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
            </div>
        </div>
    );
};

export default Register;