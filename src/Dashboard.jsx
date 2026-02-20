import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Dashboard.css';

// إعداد Gemini API باستخدام Vite Env
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

    // دالة مساعدة لتحويل الملف إلى Base64
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

    // --- وظيفة رفع الملف الصوتي وتحليله ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            alert("يرجى اختيار ملف صوتي مدعوم (MP3, WAV, M4A).");
            return;
        }

        setIsProcessing(true);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const audioData = await fileToGenerativePart(file);
            
            const prompt = "أنت مساعد ذكي للمذاكرة. استمع لهذا الملف الصوتي وقم بتلخيصه في نقاط رئيسية واضحة ومنظمة باللغة العربية، مع ذكر أهم المعلومات التي وردت فيه.";
            
            const result = await model.generateContent([prompt, audioData]);
            const response = await result.response;
            const summaryText = response.text();

            const aiNote = {
                id: Date.now(),
                text: `📁 ملخص ملف: ${file.name}\n\n${summaryText}`,
                priority: "high",
                time: "AI Audio Analysis ✨"
            };
            setTasks(prev => [aiNote, ...prev]);
        } catch (error) {
            console.error("File Analysis Error:", error);
            alert("فشل الذكاء الاصطناعي في تحليل الملف. تأكد من حجم الملف والاتصال.");
        } finally {
            setIsProcessing(false);
            e.target.value = null; // إعادة تصغير المدخلات
        }
    };

    // --- وظيفة التسجيل الصوتي المباشر (Speech to Text) ---
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
                const prompt = `قم بتلخيص النص التالي بأسلوب نقاط مختصره باللغة العربية: "${transcript}"`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const summaryText = response.text();

                setTasks(prev => [{
                    id: Date.now(),
                    text: summaryText, 
                    priority: "high",
                    time: "AI Live Summary ✨"
                }, ...prev]);
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
        if (!recognition) return alert("المتصفح لا يدعم التسجيل.");
        isRecording ? recognition.stop() : recognition.start();
        if (!isRecording) setIsRecording(true);
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

    const deleteTask = (id) => setTasks(tasks.filter(task => task.id !== id));

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-logo"><h3>Remind<span>ME</span></h3></div>
                <button className="logout-btn" onClick={onLogout}>تسجيل الخروج</button>
            </nav>

            <div className="dashboard-content">
                <div className="top-header">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="welcome-text">
                        <h2>لوحة التحكم الذكية 🚀</h2>
                        <p>لديك <span>{tasks.length}</span> عناصر</p>
                    </motion.div>

                    <div className="ai-actions-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {/* زر التسجيل المباشر */}
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleRecording}
                            disabled={isProcessing}
                            className={`ai-record-btn ${isRecording ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
                        >
                            {isRecording ? "إيقاف ⏹️" : "تسجيل مباشر 🎙️"}
                        </motion.button>

                        {/* زر رفع الملف الصوتي */}
                        <label className={`upload-label ${isProcessing ? 'disabled' : ''}`}>
                            {isProcessing ? "جاري المعالجة... ✨" : "رفع تسجيل 📁"}
                            <input 
                                type="file" 
                                accept="audio/*" 
                                onChange={handleFileUpload} 
                                disabled={isProcessing}
                                style={{ display: 'none' }} 
                            />
                        </label>
                    </div>
                </div>

                <form className="add-task-form" onSubmit={addTask}>
                    <input 
                        type="text" 
                        placeholder="أضف مهمة يدوية..."
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