import React from 'react';
import './Dashboard.css';

const Dashboard = ({ reminders }) => {
  // الألوان التي طلبتِها بالترتيب
  const cardColors = ["#62109F", "#DC0E0E", "#FE6244", "#FFDEB9"];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ padding: '20px', color: 'white' }}>
        <h2>أهلاً بكِ، فنانة البرمجة 👋</h2>
        <p>لديك {reminders?.length || 0} تذكيرات ذكية اليوم</p>
      </div>

      <div className="reminders-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
        {/* بطاقة إضافة تذكير جديد (تبقى كما هي) */}
        <div className="add-reminder-card" style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '15px', minWidth: '280px', border: '1px solid #333' }}>
             <h3 style={{color: 'white'}}>إضافة تذكير ذكي +</h3>
             {/* ... محتوى الإضافة ... */}
        </div>

        {/* عرض التذكيرات بالألوان الجديدة */}
        {reminders && reminders.map((reminder, index) => {
          const bgColor = cardColors[index % cardColors.length];
          const txtColor = bgColor === "#FFDEB9" ? "#000000" : "#FFFFFF";

          return (
            <div 
              key={reminder._id || index} 
              className="reminder-card" 
              style={{ 
                backgroundColor: bgColor, 
                color: txtColor,
                padding: '20px',
                borderRadius: '15px',
                minWidth: '280px',
                flex: '1'
              }}
            >
              <div className="card-header" style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                {reminder.time || "10:00 PM"}
              </div>
              <div className="card-body">
                <h3 style={{ margin: '0' }}>{reminder.text || "مراجعة مشروع React"}</h3>
              </div>
              <div className="card-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
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