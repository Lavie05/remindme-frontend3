import React, { useState, useEffect } from 'react';
import './App.css'; // تأكدي من استيراد ملف التنسيق الجديد
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  
  // 1. إضافة حالة الثيم (يقرأ من ذاكرة المتصفح إذا كان موجوداً مسبقاً)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // 2. تفعيل الثيم على الصفحة عند تغييره وحفظه في الذاكرة
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. دالة تبديل الثيم
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // إذا كان المستخدم مسجلاً
  if (isLoggedIn) {
    return (
      <>
        {/* زر التبديل يظهر أيضاً في الـ Dashboard */}
        <button onClick={toggleTheme} className="dark-mode-toggle">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <Dashboard onLogout={() => setIsLoggedIn(false)} />
      </>
    );
  }

  return (
    <div className="App">
      {/* زر التبديل يظهر في صفحات الدخول والتسجيل */}
      <button onClick={toggleTheme} className="dark-mode-toggle">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {showLogin ? (
        <Login 
          onLoginSuccess={() => setIsLoggedIn(true)} 
          switchToRegister={() => setShowLogin(false)} 
        />
      ) : (
        <Register 
          onLoginSuccess={() => setIsLoggedIn(true)} 
          switchToLogin={() => setShowLogin(true)} 
        />
      )}
    </div>
  );
}

export default App;