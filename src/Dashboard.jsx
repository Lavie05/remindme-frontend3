import React from 'react';
import './Dashboard.css';

const Dashboard = ({ reminders }) => {
  // مصفوفة الألوان التي اخترتِها
  const cardColors = ["#62109F", "#DC0E0E", "#FE6244", "#FFDEB9"];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>أهلاً بكِ، فنانة البرمجة 👋</h2>
        <p>لديك {reminders?.length || 0} تذكيرات ذكية اليوم</p>
      </div>

      <div className="reminders-grid">
        {reminders && reminders.map((reminder, index) => {
          // اختيار اللون بناءً على الترتيب
          const backgroundColor = cardColors[index % cardColors.length];
          
          // النص أسود للون الكريمي (#FFDEB9) وأبيض للباقي لسهولة القراءة
          const textColor = backgroundColor === "#FFDEB9" ? "#000000" : "#FFFFFF";

          return (
            <div 
              key={reminder._id || index} 
              className="reminder-card" 
              style={{ 
                backgroundColor: backgroundColor, 
                color: textColor,
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '15px',
                transition: 'transform 0.3s ease'
              }}
            >
              <div className="card-header">
                <span className="time-badge" style={{ opacity: 0.8 }}>{reminder.time}</span>
              </div>
              <div className="card-body">
                <h3 style={{ margin: '10px 0' }}>{reminder.text}</h3>
              </div>
              <div className="card-footer" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="check-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✅</button>
                <button className="delete-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;