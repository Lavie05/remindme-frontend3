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

    const generateAIQuote = async (name) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `اكتب جملة تحفيزية قصيرة جداً ومشجعة باللغة العربية للمستخدم "${name}". استخدم إيموجي واحد فقط.`;
            const result = await model.generateContent(prompt);
            setAiQuote(result.response.text());
        } catch (e) { console.log("AI Quote Error"); }
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

    const fetchTasks = async (token) => {
        try {
            const res = await axios.get('https://remindme-backend3.onrender.com/api/tasks', {
                headers: { Authorization: token }
            });
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Error fetching tasks"); }
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

    const handleYoutubeSummarize = async () => {
        const url = prompt("أدخل رابط فيديو اليوتيوب:");
        if (!url) return;

        setIsProcessing(true);
        try {
            // تصحيح الرابط ليطابق مسار الباك إند
            const res = await axios.post('https://remindme-backend3.onrender.com/api/chat/summarize-youtube', { videoUrl: url });
            const summary = res.data.summary;

            const token = localStorage.getItem('token');
            const saveRes = await axios.post('https://remindme-backend3.onrender.com/api/tasks/add', 
                { text: `📺 ملخص فيديو:\n${summary}`, priority: "medium" },
                { headers: { Authorization: token } }
            );
            setTasks(prev => [saveRes.data, ...prev]);

        } catch (error) {
            alert("حدث خطأ. تأكد أن الفيديو يحتوي على ترجمة (CC) وأن الرابط صحيح.");
        } finally {
            setIsProcessing(false);
        }
    };

    // ... (بقية الوظائف handleFileUpload و toggleRecording تبقى كما هي ولكن مع إضافة حماية البيانات)

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('https://remindme-backend3.onrender.com/api/tasks/add', { text: newTask, priority }, { headers: { Authorization: token } });
            setTasks(prev => [res.data, ...prev]);
            setNewTask("");
        } catch (error) { alert("فشل الحفظ"); }
    };

    const deleteTask = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`https://remindme-backend3.onrender.com/api/tasks/${id}`, { headers: { Authorization: token } });
            setTasks(prev => prev.filter(t => (t?._id || t?.id) !== id));
        } catch (err) { console.error("Error deleting task"); }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h3>Remind<span>ME</span></h3>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item active">🏠 الرئيسية</button>
                    <button className="nav-item" onClick={handleStatsClick}>📊 الإحصائيات</button>
                    <div style={{ marginTop: '20px', padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {themePalettes.map(t => (
                                <button key={t.id} onClick={() => changeTheme(t)} 
                                    style={{ width: '25px', height: '25px', borderRadius: '50%', backgroundColor: t.accent, border: '2px solid white', cursor: 'pointer' }} 
                                />
                            ))}
                        </div>
                    </div>
                </nav>
                <button className="logout-btn-sidebar" onClick={onLogout}>🚪 تسجيل الخروج</button>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="header-text">
                        <h2>صباح الإبداع، <span>{userName}</span></h2>
                        <p>{aiQuote}</p>
                        <p>لديك <span>{tasks?.length || 0}</span> عناصر اليوم</p>
                    </motion.div>

                    <div className="ai-controls">
                        <button onClick={handleYoutubeSummarize} className="ai-btn" style={{ background: '#FF0000', color: 'white' }} disabled={isProcessing}>
                            {isProcessing ? "جاري التلخيص..." : "تلخيص يوتيوب 📺"}
                        </button>
                    </div>
                </header>

                <form className="task-input-bar" onSubmit={addTask}>
                    <input type="text" placeholder="أضف مهمة يدوية..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                    <button type="submit">إضافة</button>
                </form>

                <div className="tasks-grid">
                    <AnimatePresence>
                        {tasks && tasks.length > 0 ? (
                            tasks.map(task => (
                                <motion.div key={task?._id || task?.id} layout className={`task-card prio-${task?.priority || 'medium'}`}>
                                    <div className="task-body">
                                        <p style={{ whiteSpace: 'pre-line' }}>{task?.text || ""}</p>
                                        <span className="task-meta">⏰ {task?.createdAt ? new Date(task.createdAt).toLocaleTimeString('ar-SA') : "AI Analysis"}</span>
                                    </div>
                                    <button className="delete-btn" onClick={() => deleteTask(task?._id || task?.id)}>×</button>
                                </motion.div>
                            ))
                        ) : (
                            <p style={{ color: 'white', textAlign: 'center', gridColumn: '1/-1' }}>لا يوجد مهام حالياً ✨</p>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;