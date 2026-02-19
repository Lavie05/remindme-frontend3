import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [reminders, setReminders] = useState([
        { id: 1, text: "مراجعة مشروع React", time: "10:00 PM" },
        { id: 2, text: "جلسة برمجة مع Gemini", time: "11:30 PM" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    // دالة التسجيل الصوتي الذكي
    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("عذراً، متصفحك لا يدعم خاصية التعرف على الصوت.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA'; // دعم اللغة العربية
        
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript); // وضع النص المسجل في الخانة تلقائياً
        };

        recognition.start();
    };

    return (
        <div className="dashboard-container">
            <nav className="side-nav">
                <div className="logo">Remind<span>ME</span></div>
                <div className="nav-items">
                    <button className="active">🏠 الرئيسية</button>
                    <button>📅 تقويمي</button>
                    <button>⚙️ الإعدادات</button>
                </div>
                <button className="logout-btn">تسجيل الخروج</button>
            </nav>

            <main className="content">
                <header>
                    <h1>أهلاً بك، <span>فنانة البرمجة</span> 👋</h1>
                    <p>لديك {reminders.length} تذكيرات ذكية اليوم.</p>
                </header>

                <div className="reminder-grid">
                    <div className="add-card">
                        <h3>➕ إضافة تذكير ذكي</h3>
                        <div className="input-wrapper">
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="اكتبي تذكيراً أو استخدمي الميكروفون..." 
                            />
                            <button 
                                className={`mic-btn ${isRecording ? 'pulse' : ''}`} 
                                onClick={startRecording}
                                title="سجلي صوتك"
                            >
                                {isRecording ? '🛑' : '🎙️'}
                            </button>
                        </div>
                        <button className="add-btn">حفظ التذكير</button>
                    </div>

                    {reminders.map(item => (
                        <div key={item.id} className="reminder-card">
                            <div className="time">{item.time}</div>
                            <p>{item.text}</p>
                            <div className="card-actions">
                                <button className="action-check">✔️</button>
                                <button className="action-delete">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;