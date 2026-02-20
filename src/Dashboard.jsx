import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Dashboard.css';

// التعديل 1: استخدام استدعاء Vite للمتغيرات البيئية
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

    useEffect(() => {
        if (!recognition) return;

        recognition.continuous = false;
        recognition.lang = 'ar-SA';
        recognition.interimResults = false;

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsRecording(false);
            setIsProcessing(true);

            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                
                // برومبت (Prompt) محسن للحصول على نتائج منسقة
                const prompt = `قم بتلخيص النص التالي المستخرج من تسجيل صوتي لمحاضرة. اجعل التلخيص على شكل نقاط واضحة ومختصرة باللغة العربية: "${transcript}"`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const summaryText = response.text();

                const aiNote = {
                    id: Date.now(),
                    text: summaryText, 
                    priority: "high",
                    time: "AI Summary ✨"
                };
                setTasks(prev => [aiNote, ...prev]);
            } catch (error) {
                console.error("Gemini Error:", error);
                setTasks(prev => [{
                    id: Date.now(),
                    text: `🎙️ الأصل: ${transcript}`,
                    priority: "low",
                    time: "Original"
                }, ...prev]);
            } finally {
                setIsProcessing(false);
            }
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
    }, []);

    const toggleRecording = () => {
        if (!recognition) {
            alert("المتصفح لا يدعم التسجيل الصوتي.");
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
        setTasks([{
            id: Date.now(),
            text: newTask,
            priority: priority,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...tasks]);
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
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="welcome-text">
                        <h2>لوحة التحكم الذكية 🚀</h2>
                        <p>لديك <span>{tasks.length}</span> عناصر</p>
                    </motion.div>

                    <div className="ai-record-wrapper">
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleRecording}
                            disabled={isProcessing}
                            className={`ai-record-btn ${isRecording ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
                        >
                            {isProcessing ? "جاري التلخيص... ✨" : isRecording ? "إيقاف التسجيل ⏹️" : "تسجيل محاضرة 🎙️"}
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
                    <select className="priority-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
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
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`task-card prio-${task.priority}`}
                            >
                                <div className="task-info">
                                    {/* التعديل 2: معالجة النص القادم من الـ AI ليدعم الأسطر الجديدة */}
                                    <h4 style={{ whiteSpace: 'pre-line' }}>{task.text}</h4>
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