// 1. عرفي مصفوفة الألوان خارج أو داخل المكون
const cardColors = ["#62109F", "#DC0E0E", "#FE6244", "#FFDEB9"];

// ... داخل المكون (Component) وفي جزء الـ Return ...

<div className="reminders-grid">
  {reminders.map((reminder, index) => {
    // اختيار اللون بناءً على الترتيب
    const backgroundColor = cardColors[index % cardColors.length];
    
    // اجعل لون النص أسود إذا كان لون الخلفية فاتحاً (#FFDEB9) لسهولة القراءة
    const textColor = backgroundColor === "#FFDEB9" ? "#000000" : "#FFFFFF";

    return (
      <div 
        key={reminder._id} 
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
          <span className="time-badge">{reminder.time}</span>
        </div>
        <div className="card-body">
          <h3>{reminder.text}</h3>
        </div>
        <div className="card-footer">
          <button className="check-btn">✅</button>
          <button className="delete-btn">🗑️</button>
        </div>
      </div>
    );
  })}
</div>