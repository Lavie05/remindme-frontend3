import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import API_BASE_URL from './config'; 
import logo from './remindme logo.jfif'; 
import './Register.css';

const Register = ({ onLoginSuccess, switchToLogin }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false); 
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);

    const evaluatePassword = (password) => {
        let score = 0;
        if (!password) return 0;
        if (password.length > 6) score++; 
        if (password.length > 9) score++; 
        if (/[A-Z]/.test(password)) score++; 
        if (/[0-9]/.test(password)) score++; 
        if (/[^A-Za-z0-9]/.test(password)) score++; 
        return score;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errorMsg) setErrorMsg('');
        if (name === 'password') {
            setStrength(evaluatePassword(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const dataToSend = {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password
        };

        if (dataToSend.password.length < 6) {
            setErrorMsg("⚠️ كلمة المرور قصيرة جداً (6 أحرف على الأقل)");
            return;
        }

        setLoading(true); 

        try {
            // ✅ التعديل هنا ليتوافق مع السيرفر الجديد
            // بما أننا حذفنا /api من السيرفر، سنطلبه من الرابط الأساسي مباشرة
            // تأكدي أن API_BASE_URL في config.js هو: https://remindme-backend3.onrender.com
            const response = await axios.post(`${API_BASE_URL}/auth/register`, dataToSend);
            
            if (response.data) {
                toast.success("✨ تم إنشاء الحساب بنجاح!");
                // إذا كان السيرفر يرسل توكن عند التسجيل، نحفظه
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    onLoginSuccess();
                } else {
                    switchToLogin(); // ننتقل لصفحة الدخول إذا لم يتوفر توكن
                }
            }
        } catch (error) {
            const serverError = error.response?.data?.error || "تعذر الاتصال بالسيرفر، حاول مجدداً";
            setErrorMsg(serverError);
            toast.error(serverError);
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
                <p style={{marginBottom: '10px', fontSize: '0.9rem'}}>مستقبل التذكيرات الذكية</p>
                
                {errorMsg && <div className="error-message-box">{errorMsg}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="اسم المستخدم" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="البريد الإلكتروني" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="input-group password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="كلمة المرور" 
                            onChange={handleChange} 
                            required 
                        />
                        <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <div className="strength-bar-container">
                        <div className={`strength-bar-fill strength-${strength}`}></div>
                    </div>
                    <div className="strength-text-label">
                        {strength > 0 && (
                            strength <= 2 ? "ضعيفة 🔴" : strength === 3 ? "متوسطة 🟠" : "قوية جداً 🟢"
                        )}
                    </div>

                    <button type="submit" className="glow-button" disabled={loading}>
                        {loading ? (
                            <span className="loader-text">جاري إنشاء حسابك... ✨</span>
                        ) : "انضم الآن"}
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