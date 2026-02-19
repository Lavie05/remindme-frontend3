import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ reminders, onAddReminder }) => {
  const [text, setText] = useState("");
  const cardColors = ["#62109F", "#DC0E0E", "#FE6244", "#FFDEB9"];

  return (
    <div className="dashboard-container modern-bg">
      <div className="dashboard-header">
        <h1>أهلاً بكِ، فنانة البرمجة 👋</h1>
        <p className="subtitle">لديك {reminders?.length || 0} تذكيرات ذكية مسجلة</p>
      </div>

      <div className="reminders-grid">
        {/* بطاقة الإضافة الجديدة والمطورة */}
        <div className="add-reminder-card modern-card">
          <h3>إضافة تذكير ذكي +</h3>
          <div className="input-group">
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ماذا تريدين أن نتذكر؟" 
            />
            <button className="mic-icon-btn" title="تسجيل صوتي">🎙️</button>
          </div>
          <button className="save-btn" onClick={() => onAddReminder(text)}>
            حفظ التذكير
          </button>
        </div>

        {/* عرض التذكيرات */}
        {reminders && reminders.map((reminder, index) => {
          const bgColor = cardColors[index % cardColors.length];
          const txtColor = bgColor === "#FFDEB9" ? "#000000" : "#FFFFFF";

          return (
            <div 
              key={reminder._id || index} 
              className="reminder-card modern-card shadow-animation" 
              style={{ backgroundColor: bgColor, color: txtColor }}
            >
              <div className="card-top">
                <span className="time-tag">{reminder.time || "الآن"}</span>
              </div>
              <div className="card-main">
                <h3>{reminder.text}</h3>
              </div>
              <div className="card-actions">
                <button className="action-icon">✅</button>
                <button className="action-icon">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;