import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  // حالة لتحديد هل المستخدم سجل دخوله أم لا
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // حالة للتبديل بين واجهة الدخول (true) وواجهة التسجيل (false)
  const [showLogin, setShowLogin] = useState(true);

  // إذا كان المستخدم مسجلاً، اظهر له الـ Dashboard مباشرة
  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <div className="App">
      {showLogin ? (
        /* واجهة تسجيل الدخول */
        <Login 
          onLoginSuccess={() => setIsLoggedIn(true)} 
          switchToRegister={() => setShowLogin(false)} 
        />
      ) : (
        /* واجهة إنشاء حساب جديد */
        <Register 
          onLoginSuccess={() => setIsLoggedIn(true)} 
          switchToLogin={() => setShowLogin(true)} 
        />
      )}
    </div>
  );
}

export default App;
