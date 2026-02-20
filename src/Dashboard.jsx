import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
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
            const prompt = "أنت مساعد ذكي للمذاكرة. لخص هذا الملف الصوتي في نقاط واضحة باللغة العربية.";
            const result = await model.generateContent([prompt, audioData]);
            const response = await result.response;
            setTasks(prev => [{
                id: Date.now(),
                text: `📁 ملخص: ${file.name}\n${response.text()}`,
                priority: "high",
                time: "AI Audio Analysis ✨"
            }, ...prev]);
        } catch (error) {
            alert("حدث خطأ في تحليل الملف.");
        } finally {
            setIsProcessing(false);
        }
    };

    // إعدادات التعرف على الصوت
    useEffect(() => {
        if (!recognition) return;
        recognition.lang = 'ar-SA';
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsRecording(false);
            setIsProcessing(true);
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(`لخص النص التالي: "${transcript}"`);
                const response = await result.response;
                setTasks(prev => [{
                    id: Date.now(),
                    text: response.text(),
                    priority: "high",
                    time: "AI Summary ✨"
                }, ...prev]);
            } catch (error) {
                console.error(error);
            } finally { setIsProcessing(false); }
        };
    }, []);

    const toggleRecording = () => {
        if (!recognition) return alert("المتصفح لا يدعم التسجيل.");
        isRecording ? recognition.stop() : recognition.start();
        setIsRecording(!isRecording);
    };

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([{
            id: Date.now(),
            text: newTask,
            priority,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...tasks]);
        setNewTask("");
    };

    const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));

    return (
        <div className="dashboard-layout">
            {/* القائمة الجانبية المضافة */}
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

            {/* المحتوى الرئيسي المعدل */}
            <main className="main-content">
                <header className="main-header">
                    <div className="header-text">
                        <h2>لوحة التحكم الذكية 🚀</h2>
                        <p>لديك <span>{tasks.length}</span> عناصر مسجلة</p>
                    </div>

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
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`task-card prio-${task.priority}`}
                            >
                                <div className="task-body">
                                    <p>{task.text}</p>
                                    <span className="task-meta">⏰ {task.time}</span>
                                </div>
                                <button className="delete-btn" onClick={() => deleteTask(task.id)}>×</button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;