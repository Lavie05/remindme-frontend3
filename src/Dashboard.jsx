import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jwtDecode } from "jwt-decode"; // تأكدي من تثبيتها: npm install jwt-decode
import axios from 'axios'; // للتعامل مع الـ Backend
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

    // 1. استخراج الاسم وجلب المهام من السيرفر عند تحميل الصفحة
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserName(decoded.name || decoded.username || "مبدعنا");
                fetchTasks(token);
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

    // دالة تحويل الملف إلى Base64
    const fileToGenerativePart = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({
                inlineData: {
                    data: reader.result.split(',')[1],
                    mimeType: file.type
                },
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // تحليل الملف الصوتي المرفوع
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
            
            // إضافة المهمة للسيرفر (اختياري يمكنك حفظ الملخص أيضاً)
            setTasks(prev => [{
                id: Date.now(),
                text: `📁 ملخص: ${file.name}\n${response.text()}`,
                priority: "high",
                time: "AI Audio Analysis ✨"
            }, ...prev]);
        } catch (error) {
            alert("حدث خطأ في تحليل الملف.");
        } finally { setIsProcessing(false); }
    };

    // إعدادات التعرف على الصوت (مباشر)
    useEffect(() => {
        if (!recognition) return;
        recognition.lang = 'ar-SA';
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsRecording(false);
            setIsProcessing(true);
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(`أعد صياغة هذا النص ليكون مهمة واضحة: "${transcript}"`);
                const response = await result.response;
                setTasks(prev => [{
                    id: Date.now(),
                    text: response.text(),
                    priority: "high",
                    time: "AI Summary ✨"
                }, ...prev]);
            } catch (error) { console.error(error); } 
            finally { setIsProcessing(false); }
        };
    }, []);

    const toggleRecording = () => {
        if (!recognition) return alert("المتصفح لا يدعم التسجيل.");
        isRecording ? recognition.stop() : recognition.start();
        setIsRecording(!isRecording);
    };

    // 2. إضافة مهمة يدوية وحفظها في MongoDB
    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('https://remindme-backend3.onrender.com/api/tasks/add', {
                text: newTask,
                priority
            }, { headers: { Authorization: token } });
            
            setTasks([res.data, ...tasks]);
            setNewTask("");
        } catch (error) {
            alert("فشل الحفظ في قاعدة البيانات");
        }
    };

    const deleteTask = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`https://remindme-backend3.onrender.com/api/tasks/${id}`, {
                headers: { Authorization: token }
            });
            setTasks(tasks.filter(t => t._id !== id));
        } catch (err) { console.error("Error deleting task"); }
    };

    // دالة لتغيير الترحيب حسب الوقت
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
                    <button className="nav-item">⚙️ الإعدادات</button>
                </nav>
                <button className="logout-btn-sidebar" onClick={onLogout}>
                    🚪 تسجيل الخروج
                </button>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="header-text"
                    >
                        {/* 3. تطبيق فكرة المساعد الشخصي */}
                        <h2>{getTimeGreeting()}، <span>{userName}</span></h2>
                        <p>ماذا سننجز اليوم؟ لديك <span>{tasks.length}</span> عناصر</p>
                    </motion.div>

                    <div className="ai-controls">
                        <button 
                            onClick={toggleRecording} 
                            className={`ai-btn record ${isRecording ? 'active' : ''}`}
                        >
                            {isRecording ? "إيقاف ⏹️" : "تسجيل مباشر 🎙️"}
                        </button>

                        <label className="ai-btn upload">
                            {isProcessing ? "جاري المعالجة... ✨" : "رفع ملف 📁"}
                            <input type="file" accept="audio/*" onChange={handleFileUpload} hidden disabled={isProcessing} />
                        </label>
                    </div>
                </header>

                <form className="task-input-bar" onSubmit={addTask}>
                    <input 
                        type="text" 
                        placeholder="أضف مهمة يدوية هنا..." 
                        value={newTask} 
                        onChange={(e) => setNewTask(e.target.value)} 
                    />
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
                            <motion.div 
                                key={task._id || task.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className={`task-card prio-${task.priority}`}
                            >
                                <div className="task-body">
                                    <p>{task.text}</p>
                                    <span className="task-meta">⏰ {task.time || new Date(task.createdAt).toLocaleTimeString()}</span>
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