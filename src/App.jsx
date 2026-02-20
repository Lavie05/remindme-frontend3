import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; // ✅ إضافة نظام التنبيهات العالمي
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Intro from './Intro'; 
import axios from 'axios';

// ✅ تعريف الرابط الموحد للسيرفر (Base URL)
// هذا يسهل عليكِ تغييره مستقبلاً من مكان واحد فقط
axios.defaults.baseURL = 'https://remindme-backend3.onrender.com';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  // التحقق من التوكن عند تشغيل التطبيق
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      // هنا يمكننا مستقبلاً إضافة طلب للسيرفر للتأكد أن التوكن لم تنتهِ صلاحيته
      setIsLoggedIn(true);
    }
  }, []);

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  /**
   * 1. مرحلة الـ Intro
   */
  if (showIntro) {
    return <Intro onFinish={() => setShowIntro(false)} />;
  }

  /**
   * 2. العرض الرئيسي
   */
  return (
    <div className="App">
      {/* ✅ وضعنا Toaster هنا ليعمل في Login و Register و Dashboard */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a0429',
            color: '#FFDEB9',
            border: '1px solid rgba(254, 98, 68, 0.3)',
            borderRadius: '12px'
          },
        }} 
      />

      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        showLogin ? (
          <Login 
            onLoginSuccess={() => setIsLoggedIn(true)} 
            switchToRegister={() => setShowLogin(false)} 
          />
        ) : (
          <Register 
            onLoginSuccess={() => setIsLoggedIn(true)} 
            switchToLogin={() => setShowLogin(true)} 
          />
        )
      )}
    </div>
  );
}

export default App;