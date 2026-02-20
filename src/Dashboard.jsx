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

    // 1. تعريف مصفوفة الثيمات (Color Hunt Inspiration)
    const themePalettes = [
        { id: 'deep-purple', name: 'الافتراضي', accent: '#FE6244', colors: { '--bg-gradient': 'radial-gradient(circle at top right, #1a0429 0%, #05010a 100%)', '--sidebar-bg': 'rgba(10, 5, 20, 0.6)', '--accent-color': '#FE6244', '--text-main': '#FFDEB9', '--glow-shadow': 'rgba(254, 98, 68, 0.5)' } },
        { id: 'midnight', name: 'المحيط', accent: '#1ba098', colors: { '--bg-gradient': 'radial-gradient(circle at top right, #051622 0%, #02090e 100%)', '--sidebar-bg': 'rgba(5, 22, 34, 0.8)', '--accent-color': '#1ba098', '--text-main': '#d1f2f0', '--glow-shadow': 'rgba(27, 160, 152, 0.5)' } },
        { id: 'cyber', name: 'سيبربونك', accent: '#C147E9', colors: { '--bg-gradient': 'radial-gradient(circle at top right, #2D033B 0%, #000000 100%)', '--sidebar-bg': 'rgba(45, 3, 59, 0.6)', '--accent-color': '#C147E9', '--text-main': '#E5B8F4', '--glow-shadow': 'rgba(193, 71, 233, 0.5)' } }
    ];

    // دالة تغيير الثيم
    const changeTheme = (theme) => {
        Object.keys(theme.colors).forEach(key => {
            document.documentElement.style.setProperty(key, theme.colors[key]);
        });
        localStorage.setItem('selectedTheme', JSON.stringify(theme));
    };

    // دالة توليد الجملة التحفيزية من Gemini
    const generateAIQuote = async (name) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `اكتب جملة تحفيزية قصيرة جداً ومشجعة باللغة العربية للمستخدم "${name}". استخدم إيموجي واحد فقط.`;
            const result = await model.generateContent(prompt);
            setAiQuote(result.response.text());
        } catch (e) { console.log("AI Quote Error"); }
    };

    useEffect(() => {
        // استعادة الثيم المحفوظ
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) changeTheme(JSON.parse(savedTheme));

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const name = decoded.name || decoded.username || "مبدعنا";
                setUserName(name);
                fetchTasks(token);
                generateAIQuote(name); // توليد الجملة فور معرفة الاسم
            } catch (err) { console.error("Invalid token"); }
        }
    }, []);

    const fetchTasks = async (token) => {
        try {
            const res = await axios.get('https://remindme-backend3.onrender.com/api/tasks', {
                headers: { Authorization: token }
            });
            setTasks(res.data);
        } catch (err) { console.error("Error fetching tasks"); }
    };

    // (بقية الدوال: fileToGenerativePart, handleFileUpload, recognition useEffect, toggleRecording, addTask, deleteTask, getTimeGreeting تبقى كما هي في كودك الأصلي)
    const fileToGenerativePart = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({
                inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsProcessing(true);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const audioData = await fileToGenerativePart(file);
            const prompt = "أنت مساعد ذكي للمذاكرة. لخص هذا الملف الصوتي في نقاط واضحة ومختصرة باللغة العربية.";
            const result = await model.generateContent([prompt, audioData]);
            const response = await result.response;
            setTasks(prev => [{ _id: Date.now().toString(), text: `📁 ملخص: ${file.name}\n${response.text()}`, priority: "high", createdAt: new Date().toISOString() }, ...prev]);
        } catch (error) { alert("حدث خطأ في تحليل الملف."); } finally { setIsProcessing(false); }
    };

    useEffect(() => {
        if (!recognition) return;
        recognition.lang = 'ar-SA';
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsRecording(false);
            setIsProcessing(true);
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(`أعد صياغة هذا النص ليكون مهمة واضحة ومختصرة: "${transcript}"`);
                setTasks(prev => [{ _id: Date.now().toString(), text: result.response.text(), priority: "high", createdAt: new Date().toISOString() }, ...prev]);
            } catch (error) { console.error(error); } finally { setIsProcessing(false); }
        };
    }, []);

    const toggleRecording = () => {
        if (!recognition) return alert("المتصفح لا يدعم التسجيل.");
        isRecording ? recognition.stop() : recognition.start();
        setIsRecording(!isRecording);
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('https://remindme-backend3.onrender.com/api/tasks/add', { text: newTask, priority }, { headers: { Authorization: token } });
            setTasks([res.data, ...tasks]);
            setNewTask("");
        } catch (error) { alert("فشل الحفظ في قاعدة البيانات"); }
    };

    const deleteTask = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`https://remindme-backend3.onrender.com/api/tasks/${id}`, { headers: { Authorization: token } });
            setTasks(tasks.filter(t => (t._id || t.id) !== id));
        } catch (err) { console.error("Error deleting task"); }
    };

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "صباح الخير ☀️";
        if (hour < 18) return "أهلاً بك ☕";
        return "مساء الإبداع ✨";
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h3>Remind<span>ME</span></h3>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item active">🏠 الرئيسية</button>
                    <button className="nav-item">📊 الإحصائيات</button>
                    
                    {/* اختيار الثيمات الجديد */}
                    <div style={{ marginTop: '20px', padding: '10px' }}>
                        <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '10px' }}>لون الواجهة:</p>
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
                        <h2>{getTimeGreeting()}، <span>{userName}</span></h2>
                        
                        {/* عرض الجملة التحفيزية من AI */}
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            style={{ fontStyle: 'italic', color: 'var(--accent-color)', marginBottom: '15px' }}>
                            {aiQuote}
                        </motion.p>
                        
                        <p>لديك <span>{tasks.length}</span> عناصر اليوم</p>
                    </motion.div>

                    <div className="ai-controls">
                        <button onClick={toggleRecording} className={`ai-btn record ${isRecording ? 'active' : ''}`}>
                            {isRecording ? "إيقاف ⏹️" : "تسجيل مباشر 🎙️"}
                        </button>
                        <label className="ai-btn upload">
                            {isProcessing ? "جاري المعالجة... ✨" : "رفع ملف 📁"}
                            <input type="file" accept="audio/*" onChange={handleFileUpload} hidden disabled={isProcessing} />
                        </label>
                    </div>
                </header>

                <form className="task-input-bar" onSubmit={addTask}>
                    <input type="text" placeholder="أضف مهمة يدوية هنا..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="high">مهم 🔥</option>
                        <option value="medium">متوسط ⚡</option>
                        <option value="low">عادي ✨</option>
                    </select>
                    <button type="submit">إضافة</button>
                </form>

                <div className="tasks-grid">
                    <AnimatePresence>
                        {tasks.map(task => (
                            <motion.div key={task._id || task.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={`task-card prio-${task.priority}`}>
                                <div className="task-body">
                                    <p>{task.text}</p>
                                    <span className="task-meta">⏰ {task.createdAt ? new Date(task.createdAt).toLocaleTimeString('ar-SA') : "AI Analysis"}</span>
                                </div>
                                <button className="delete-btn" onClick={() => deleteTask(task._id || task.id)}>×</button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;