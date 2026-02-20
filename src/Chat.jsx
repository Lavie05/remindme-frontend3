import express from 'express';
const router = express.Router();

// هذا هو المسار الذي سيتحدث معه الفرونت إند
router.post('/smart-schedule', async (req, res) => {
    try {
        const { text } = req.body;
        // هنا سيتم لاحقاً إضافة منطق الذكاء الاصطناعي
        res.json({ 
            task: text, 
            schedule: [new Date()] // موعد تجريبي
        });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر" });
    }
});

export default router;