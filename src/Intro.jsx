import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from './remindme logo.jfif';
import './Intro.css';

const Intro = ({ onFinish }) => {
    useEffect(() => {
        // بعد 3.5 ثانية ننهي الانترو
        const timer = setTimeout(() => {
            onFinish();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="intro-container">
            <motion.div 
                className="intro-content"
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    filter: "blur(0px)",
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                {/* تأثير الإضاءة خلف اللوجو */}
                <div className="logo-glow"></div>
                
                <motion.img 
                    src={logo} 
                    alt="Logo" 
                    className="intro-logo-img"
                    animate={{ 
                        y: [0, -10, 0], // حركة عائمة خفيفة
                    }}
                    transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />

                <motion.h1 
                    className="intro-title"
                    initial={{ letterSpacing: "15px", opacity: 0 }}
                    animate={{ letterSpacing: "2px", opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.2 }}
                >
                    Remind<span>ME</span>
                </motion.h1>
                
                <motion.div 
                    className="intro-line"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                />
            </motion.div>
        </div>
    );
};

export default Intro;