import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; 
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Intro from './Intro'; 
// احذفي استيراد Chat مؤقتاً للتأكد إذا كان هو السبب
// import Chat from './Chat'; 
import axios from 'axios';

// ✅ تصحيح الرابط ليشمل /api لتوحيد الطلبات
axios.defaults.baseURL = 'https://remindme-backend3.onrender.com/api';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (showIntro) {
    return <Intro onFinish={() => setShowIntro(false)} />;
  }

  return (
    <div className="App">
      <Toaster position="top-center" />

      {isLoggedIn ? (
        <div className="dashboard-wrapper">
          {/* ⚠️ عطلنا الـ Chat مؤقتاً لنرى هل ستظهر الـ Dashboard */}
          {/* <Chat /> */}
          <Dashboard onLogout={handleLogout} />
        </div>
      ) : (
        <div className="auth-wrapper">
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
      )}
    </div>
  );
}

export default App;