import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jwtDecode } from "jwt-decode"; 
import axios from 'axios'; 
import './Dashboard.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const Dashboard = ({ onLogout }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [priority, setPriority] = useState("medium");
    const [taskDate, setTaskDate] = useState(""); // ✅ تم النقل للداخل
    const [taskTime, setTaskTime] = useState(""); // ✅ تم النقل للداخل
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userName, setUserName] = useState("صديقي");
    const [aiQuote, setAiQuote] = useState("استعد لإنجاز عظيم اليوم! ✨");
    const [showStats, setShowStats] = useState(false);
    const [statsData, setStatsData] = useState({ total: 0, high: 0, medium: 0, low: 0 });

    const themePalettes = [
        { id: 'deep-purple', name: 'الافتراضي', accent: '#FE6244', colors: { '--bg-gradient': 'radial-gradient(circle at top right, #1a0429 0%, #05010a 100%)', '--sidebar-bg': 'rgba(10, 5, 20, 0.6)', '--accent-color': '#FE6244', '--text-main': '#FFDEB9', '--glow-shadow': 'rgba(254, 98, 68, 0.5)' } },
        { id: 'midnight', name: 'المحيط', accent: '#1ba098', colors: { '--bg-gradient': 'radial-gradient(circle at top right, #051622 0%, #02090e 100%)', '--sidebar-bg': 'rgba(5, 22, 34, 0.8)', '--accent-color': '#1ba098', '--text-main': '#d1f2f0', '--glow-shadow': 'rgba(27, 160, 152, 0.5)' } },
        { id: 'cyber', name: 'سيبربونك', accent: '#C147E9', colors: { '--bg-gradient': 'radial-gradient(circle at top right, #2D033B 0%, #000000 100%)', '--sidebar-bg': 'rgba(45, 3, 59, 0.6)', '--accent-color': '#C147E9', '--text-main': '#E5B8F4', '--glow-shadow': 'rgba(193, 71, 233, 0.5)' } }
    ];

    const changeTheme = (theme) => {
        if (!theme?.colors) return;
        Object.keys(theme.colors).forEach(key => {
            document.documentElement.style.setProperty(key, theme.colors[key]);
        });
        localStorage.setItem('selectedTheme', JSON.stringify(theme));
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            try { changeTheme(JSON.parse(savedTheme)); } catch(e) { console.error("Theme error"); }
        }

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const name = decoded?.name || decoded?.username || "مبدعنا";
                setUserName(name);
                fetchTasks(token);
                generateAIQuote(name);
            } catch (err) { console.error("Invalid token"); }
        }
    }, []);

    const generateAIQuote = async (name) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `اكتب جملة تحفيزية قصيرة جداً ومشجعة باللغة العربية للمستخدم "${name}". استخدم إيموجي واحد فقط.`;
            const result = await model.generateContent(prompt);
            setAiQuote(result.response.text());
        } catch (e) { console.log("AI Quote Error"); }
    };

    const fetchTasks = async (token) => {
        try {
            const res = await axios.get('https://remindme-backend3.onrender.com/api/tasks', {
                headers: { Authorization: token }
            });
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Error fetching tasks"); }
    };

    const addTask = async (e) => {
        if (e) e.preventDefault();
        if (!newTask.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('https://remindme-backend3.onrender.com/api/tasks/add', 
                { 
                    text: newTask, 
                    priority,
                    reminderDate: taskDate, // ✅ إرسال التاريخ
                    reminderTime: taskTime  // ✅ إرسال الوقت
                }, 
                { headers: { Authorization: token } }
            );
            setTasks(prev => [res.data, ...prev]);
            setNewTask("");
            setTaskDate(""); // تصفير الحقول بعد الإضافة
            setTaskTime("");
        } catch (error) { alert("فشل الحفظ"); }
    };

    const deleteTask = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`https://remindme-backend3.onrender.com/api/tasks/${id}`, { headers: { Authorization: token } });
            setTasks(prev => prev.filter(t => (t?._id || t?.id) !== id));
        } catch (err) { console.error("Error deleting task"); }
    };

    const handleStatsClick = () => {
        const stats = {
            total: tasks?.length || 0,
            high: tasks?.filter(t => t?.priority === 'high').length || 0,
            medium: tasks?.filter(t => t?.priority === 'medium').length || 0,
            low: tasks?.filter(t => t?.priority === 'low').length || 0,
        };
        setStatsData(stats);
        setShowStats(true);
    };

    const toggleVoiceRecording = () => {
        if (!recognition) return alert("متصفحك لا يدعم التعرف على الصوت");
        if (isRecording) {
            recognition.stop();
            setIsRecording(false);
        } else {
            recognition.lang = 'ar-SA';
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.start();
            setIsRecording(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setNewTask(transcript);
            };
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = () => setIsRecording(false);
        }
    };

    const handleYoutubeSummarize = async () => {
        const url = prompt("أدخل رابط فيديو اليوتيوب:");
        if (!url) return;
        setIsProcessing(true);
        try {
            const res = await axios.post('https://remindme-backend3.onrender.com/api/chat/summarize-youtube', { videoUrl: url });
            const token = localStorage.getItem('token');
            const saveRes = await axios.post('https://remindme-backend3.onrender.com/api/tasks/add', 
                { text: `📺 ملخص فيديو:\n${res.data.summary}`, priority: "medium" },
                { headers: { Authorization: token } }
            );
            setTasks(prev => [saveRes.data, ...prev]);
        } catch (error) { alert("حدث خطأ في التلخيص"); }
        finally { setIsProcessing(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsProcessing(true);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Data = reader.result.split(',')[1];
                const result = await model.generateContent([
                    "استخرج المهام من هذه الصورة بوضوح وبالعربية.",
                    { inlineData: { data: base64Data, mimeType: file.type } }
                ]);
                const token = localStorage.getItem('token');
                const saveRes = await axios.post('https://remindme-backend3.onrender.com/api/tasks/add', 
                    { text: `🖼️ مهام من صورة:\n${result.response.text()}`, priority: "high" },
                    { headers: { Authorization: token } }
                );
                setTasks(prev => [saveRes.data, ...prev]);
                setIsProcessing(false);
            };
        } catch (e) { alert("فشل تحليل الصورة"); setIsProcessing(false); }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo"><h3>Remind<span>ME</span></h3></div>
                <nav className="sidebar-nav">
                    <button className="nav-item active">🏠 الرئيسية</button>
                    <button className="nav-item" onClick={handleStatsClick}>📊 الإحصائيات</button>
                    <div className="theme-selector" style={{ marginTop: '20px', padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {themePalettes.map(t => (
                                <button key={t.id} onClick={() => changeTheme(t)} 
                                    style={{ width: '25px', height: '25px', borderRadius: '50%', backgroundColor: t.accent, border: '2px solid white', cursor: 'pointer' }} />
                            ))}
                        </div>
                    </div>
                </nav>
                <button className="logout-btn-sidebar" onClick={onLogout}>🚪 خروج</button>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <div className="header-text">
                        <h2>صباح الإبداع، <span>{userName}</span></h2>
                        <p>{aiQuote}</p>
                    </div>
                    <div className="ai-controls" style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleYoutubeSummarize} className="ai-btn" style={{ background: '#FF0000', color: 'white' }}>
                            {isProcessing ? "جاري..." : "يوتيوب 📺"}
                        </button>
                        <label className="ai-btn" style={{ background: '#4CAF50', color: 'white', cursor: 'pointer' }}>
                            {isProcessing ? "جاري..." : "صورة 🖼️"}
                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                </header>

                <form className="task-input-bar" onSubmit={addTask}>
                    <input type="text" placeholder="أضف مهمة..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                    
                    {/* ✅ حقول التاريخ والوقت الجديدة */}
                    <input type="date" className="date-input" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
                    <input type="time" className="time-input" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} />

                    <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ background: '#333', color: 'white', border: 'none', marginLeft: '10px' }}>
                        <option value="high">عالية</option>
                        <option value="medium">متوسطة</option>
                        <option value="low">منخفضة</option>
                    </select>
                    <button type="submit">إضافة</button>
                </form>

                <div className="tasks-grid">
                    <AnimatePresence mode='popLayout'>
                        {tasks.map(task => (
                            <motion.div 
                                key={task?._id || task?.id} 
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)", transition: { duration: 0.3 } }}
                                className={`task-card prio-${task?.priority || 'medium'}`}
                            >
                                <div className="task-body">
                                    <p style={{ whiteSpace: 'pre-line' }}>{task?.text}</p>
                                    
                                    {/* ✅ عرض التاريخ والوقت على الكارت إذا وجدا */}
                                    <div className="task-reminders">
                                        {task?.reminderDate && <span className="reminder-tag">📅 {task.reminderDate}</span>}
                                        {task?.reminderTime && <span className="reminder-tag">⏰ {task.reminderTime}</span>}
                                    </div>

                                    <span className="task-meta">⏰ تاريخ الإضافة: {task?.createdAt ? new Date(task.createdAt).toLocaleTimeString('ar-SA') : "الآن"}</span>
                                </div>
                                <button className="delete-btn" onClick={() => deleteTask(task?._id || task?.id)}>×</button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            <motion.button 
                className={`fab-mic ${isRecording ? 'recording' : ''}`} 
                onClick={toggleVoiceRecording}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isRecording ? "🛑" : "🎤"}
            </motion.button>
        </div>
    );
};

export default Dashboard;