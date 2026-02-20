import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; 
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Intro from './Intro'; 
import Chat from './Chat'; 
import axios from 'axios';

// ✅ الرابط الموحد - تأكدي أنه بدون /api في النهاية لأننا عدلنا السيرفر
axios.defaults.baseURL = 'https://remindme-backend3.onrender.com';

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
          {/* ✅ الذكاء الاصطناعي يظهر فوق لوحة التحكم */}
          <Chat /> 
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