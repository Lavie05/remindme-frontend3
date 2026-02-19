import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ reminders, onAddReminder }) => {
  const [inputValue, setInputValue] = useState("");
  const cardColors = ["#62109F", "#DC0E0E", "#FE6244", "#FFDEB9"];

  const handleSave = () => {
    if (inputValue.trim()) {
      onAddReminder(inputValue);
      setInputValue(""); // مسح الحقل بعد الإضافة
    }
  };

  return (
    <div className="dashboard-container modern-gradient">
      <div className="dashboard-header">
        <h1>أهلاً بك 👋</h1>
        <p>لديك {reminders?.length || 0} تذكيرات ذكية اليوم</p>
      </div>

      <div className="reminders-grid">
        {/* بطاقة الإضافة العصرية */}
        <div className="add-card-modern">
          <h3>إضافة تذكير ذكي +</h3>
          <div className="input-with-mic">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب هنا أو استخدمي الصوت..." 
            />
            <button className="mic-btn-modern">🎙️</button>
          </div>
          <button className="save-btn-modern" onClick={handleSave}>حفظ التذكير</button>
        </div>

        {/* عرض التذكيرات الملونة */}
        {reminders && reminders.map((reminder, index) => {
          const bgColor = cardColors[index % cardColors.length];
          const txtColor = bgColor === "#FFDEB9" ? "#000000" : "#FFFFFF";

          return (
            <div 
              key={reminder._id || index} 
              className="reminder-card-modern" 
              style={{ backgroundColor: bgColor, color: txtColor }}
            >
              <div className="card-time">{reminder.time || "الآن"}</div>
              <div className="card-text"><h3>{reminder.text}</h3></div>
              <div className="card-actions-modern">
                <span>✅</span>
                <span>🗑️</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;