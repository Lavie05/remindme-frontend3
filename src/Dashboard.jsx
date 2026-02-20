import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

// إعداد محرك التعرف على الكلام (Speech Recognition)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const Dashboard = ({ onLogout }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [priority, setPriority] = useState("medium");
    const [isRecording, setIsRecording] = useState(false);

    // إعدادات المحرك عند تشغيل التطبيق
    useEffect(() => {
        if (!recognition) return;

        recognition.continuous = false; // يتوقف عند الصمت
        recognition.lang = 'ar-SA'; // يدعم اللغة العربية
        recognition.interimResults = false;

        // ماذا يحدث عندما ينتهي من سماعك؟
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const aiNote = {
                id: Date.now(),
                text: `🎙️ ملخص صوتي: ${transcript}`,
                priority: "high", // الملخصات الصوتية عادة مهمة
                time: "AI Note"
            };
            setTasks(prev => [aiNote, ...prev]);
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error("خطأ في المايكروفون:", event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };
    }, []);

    const toggleRecording = () => {
        if (!recognition) {
            alert("متصفحك لا يدعم التعرف على الصوت. جرب Chrome.");
            return;
        }

        if (isRecording) {
            recognition.stop();
        } else {
            setIsRecording(true);
            recognition.start();
        }
    };

    const addTask = (e) => {
        e.preventDefault();
        if (newTask.trim() === "") return;
        
        const taskObj = {
            id: Date.now(),
            text: newTask,
            priority: priority,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setTasks([taskObj, ...tasks]);
        setNewTask("");
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-logo">
                    <h3>Remind<span>ME</span></h3>
                </div>
                <button className="logout-btn" onClick={onLogout}>تسجيل الخروج</button>
            </nav>

            <div className="dashboard-content">
                <div className="top-header">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="welcome-text"
                    >
                        <h2>لوحة التحكم الذكية 🚀</h2>
                        <p>لديك <span>{tasks.length}</span> عناصر في قائمتك</p>
                    </motion.div>

                    <div className="ai-record-wrapper">
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleRecording}
                            className={`ai-record-btn ${isRecording ? 'active' : ''}`}
                        >
                            {isRecording ? "جاري الاستماع... ⏹️" : "تسجيل محاضرة 🎙️"}
                        </motion.button>
                        {isRecording && <span className="recording-dot"></span>}
                    </div>
                </div>

                <form className="add-task-form" onSubmit={addTask}>
                    <input 
                        type="text" 
                        placeholder="أضف مهمة أو ملاحظة..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                    />
                    <select 
                        className="priority-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="high">مهم 🔥</option>
                        <option value="medium">متوسط ⚡</option>
                        <option value="low">عادي ✨</option>
                    </select>
                    <button type="submit">إضافة</button>
                </form>

                <div className="tasks-grid">
                    <AnimatePresence>
                        {tasks.map((task) => (
                            <motion.div 
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`task-card prio-${task.priority}`}
                            >
                                <div className="task-info">
                                    <h4>{task.text}</h4>
                                    <span className="task-time">⏰ {task.time}</span>
                                </div>
                                <button className="delete-task" onClick={() => deleteTask(task.id)}>×</button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;