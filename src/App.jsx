import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Intro from './Intro'; 

function App() {
  // الحالة تبدأ بـ true لتشغيل الأنيميشن فور فتح الموقع
  const [showIntro, setShowIntro] = useState(true);
  
  // التحكم في حالة تسجيل الدخول
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // التحكم في التبديل بين شاشتي Login و Register
  const [showLogin, setShowLogin] = useState(true);

  /**
   * 1. مرحلة الـ Splash Screen (الافتتاحية)
   * تظهر فقط عند أول دخول للموقع.
   */
  if (showIntro) {
    return <Intro onFinish={() => setShowIntro(false)} />;
  }

  /**
   * 2. مرحلة ما بعد تسجيل الدخول (اللوحة الرئيسية)
   * تظهر فقط إذا نجحت عملية الـ Login أو Register.
   */
  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  /**
   * 3. مرحلة المصادقة (Authentication)
   * التبديل بين الدخول وإنشاء الحساب.
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
          // عند نجاح التسجيل، نعتبره سجل دخول تلقائياً
          onLoginSuccess={() => setIsLoggedIn(true)} 
          switchToLogin={() => setShowLogin(true)} 
        />
      )}
    </div>
  );
}

export default App;