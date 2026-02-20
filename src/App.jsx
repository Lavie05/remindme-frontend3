import React, { useState, useEffect } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Intro from './Intro'; 

function App() {
  // الحالة تبدأ بـ true لتشغيل الأنيميشن فور فتح الموقع
  const [showIntro, setShowIntro] = useState(true);
  
  // التحكم في حالة تسجيل الدخول (نتحقق من وجود توكن عند البداية)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // التحكم في التبديل بين شاشتي Login و Register
  const [showLogin, setShowLogin] = useState(true);

  // --- [إضافة جديدة: التحقق من التوكن عند تشغيل التطبيق] ---
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setIsLoggedIn(true);
      // اختياري: إذا كان مسجلاً دخول، قد ترغبين في تخطي الـ Intro مباشرة
      // setShowIntro(false); 
    }
  }, []);

  // دالة تسجيل الخروج المسؤولة عن مسح البيانات
  const handleLogout = () => {
    localStorage.removeItem('token'); // حذف التوكن من الذاكرة
    setIsLoggedIn(false);
  };

  /**
   * 1. مرحلة الـ Splash Screen (الافتتاحية)
   */
  if (showIntro) {
    return <Intro onFinish={() => setShowIntro(false)} />;
  }

  /**
   * 2. مرحلة ما بعد تسجيل الدخول (اللوحة الرئيسية)
   */
  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  /**
   * 3. مرحلة المصادقة (Authentication)
   */
  return (
    <div className="App">
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