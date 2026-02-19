import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ reminders, onAddReminder }) => {
  const [inputValue, setInputValue] = useState("");
  // مصفوفة ألوان مستوحاة من صفحة تسجيل الدخول الخاصة بكِ
  const cardColors = ["#62109F", "#4B0082", "#FE6244", "#FF8C00"];

  const handleSave = () => {
    if (inputValue.trim()) {
      onAddReminder(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="dashboard-container login-theme-bg">
      <div className="dashboard-header">
        <h1>أهلاً بك👋</h1>
        <p>لديك {reminders?.length || 0} تذكيرات ذكية اليوم</p>
      </div>

      <div className="reminders-grid">
        <div className="add-card-modern">
          <h3>إضافة تذكير ذكي +</h3>
          <div className="input-with-mic">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ماذا نخطط اليوم؟" 
            />
            <button className="mic-btn-modern">🎙️</button>
          </div>
          <button className="login-style-btn" onClick={handleSave}>حفظ التذكير</button>
        </div>

        {reminders && reminders.map((reminder, index) => {
          const bgColor = cardColors[index % cardColors.length];
          return (
            <div 
              key={reminder._id || index} 
              className="reminder-card-modern shadow-glow" 
              style={{ backgroundColor: bgColor, color: '#FFFFFF' }}
            >
              <div className="card-time">{reminder.time || "الآن"}</div>
              <div className="card-text"><h3>{reminder.text}</h3></div>
              <div className="card-actions-modern">
                <button className="icon-btn">✅</button>
                <button className="icon-btn">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;