import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import API_BASE_URL from './config'; 
import logo from './remindme logo.jfif'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const Register = ({ onLoginSuccess, switchToLogin }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false); 
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0); // حالة قوة كلمة المرور

    // دالة لتقييم قوة كلمة المرور (من 0 إلى 5)
    const evaluatePassword = (password) => {
        let score = 0;
        if (!password) return 0;
        if (password.length > 6) score++; // طول مقبول
        if (password.length > 9) score++; // طول ممتاز
        if (/[A-Z]/.test(password)) score++; // يحتوي حرف كبير
        if (/[0-9]/.test(password)) score++; // يحتوي أرقام
        if (/[^A-Za-z0-9]/.test(password)) score++; // يحتوي رموز
        return score;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // مسح الخطأ عند الكتابة
        if (errorMsg) setErrorMsg('');

        // تحديث مقياس القوة عند تغيير الباسورد
        if (name === 'password') {
            setStrength(evaluatePassword(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        // تحسين: منع الإرسال إذا كانت الكلمة ضعيفة جداً (اختياري)
        if (formData.password.length < 6) {
            setErrorMsg("⚠️ كلمة المرور قصيرة جداً");
            return;
        }

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
                <p style={{marginBottom: '10px', fontSize: '0.9rem'}}>مستقبل التذكيرات الذكية</p>
                
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="text" name="username" placeholder="اسم المستخدم" onChange={handleChange} required />
                    </div>
                    
                    <div className="input-group">
                        <input type="email" name="email" placeholder="البريد الإلكتروني" onChange={handleChange} required />
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

                    {/* مقياس قوة كلمة المرور البصري */}
                    <div className="strength-bar-container">
                        <div className={`strength-bar-fill strength-${strength}`}></div>
                    </div>
                    <div className="strength-text-label">
                        {strength > 0 && (
                            strength <= 2 ? "ضعيفة 🔴" : strength === 3 ? "متوسطة 🟠" : "قوية جداً 🟢"
                        )}
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