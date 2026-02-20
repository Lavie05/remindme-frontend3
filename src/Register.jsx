import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import API_BASE_URL from './config'; 
import logo from './remindme logo.jfif'; 
// استيراد الأيقونات
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const Register = ({ onLoginSuccess, switchToLogin }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false); 
    const [errorMsg, setErrorMsg] = useState('');
    // الحالة الجديدة لإظهار/إخفاء كلمة المرور
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMsg) setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true); 

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
            if (response.status === 201 || response.status === 200) {
                onLoginSuccess(); 
            }
        } catch (error) {
            const serverError = error.response?.data?.error || "تعذر الاتصال بالسيرفر";
            setErrorMsg(serverError);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="modern-container">
            <div className="glass-card">
                <div className="logo-container">
                    <img src={logo} alt="RemindMe Logo" className="site-logo" />
                </div>
                
                <h2>Remind<span>ME</span></h2>
                
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="text" name="username" placeholder="اسم المستخدم" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input type="email" name="email" placeholder="البريد الإلكتروني" onChange={handleChange} required />
                    </div>
                    
                    {/* حقل كلمة المرور مع الأيقونة */}
                    <div className="input-group password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="كلمة المرور" 
                            onChange={handleChange} 
                            required 
                        />
                        <span 
                            className="password-icon" 
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <button type="submit" className="glow-button" disabled={loading}>
                        {loading ? "جاري المعالجة..." : "انضم الآن"}
                    </button>
                </form>

                <p className="switch-text">
                    لديك حساب بالفعل؟ <span onClick={switchToLogin}>سجل دخولك</span>
                </p>
            </div>
        </div>
    );
};

export default Register;