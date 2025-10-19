const express = require('express');
const router = express.Router();

// 只在 API 路由中添加 CORS
router.post('/', async (req, res) => {
    // 添加 CORS 頭部
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    try {
        const { scores, summary, gender, questions } = req.body;
        
        if (!scores || !summary) {
            return res.status(400).json({
                success: false,
                error: '缺少必要的測驗資料'
            });
        }
        
        const analysis = await generateAIAnalysis({
            scores,
            summary,
            gender,
            questions
        });
        
        res.json({
            success: true,
            analysis: analysis
        });
        
    } catch (error) {
        console.error('AI分析錯誤:', error);
        res.status(500).json({
            success: false,
            error: 'AI分析服務暫時不可用，請稍後再試'
        });
    }
});

// 保持您原有的 generateAIAnalysis 和其他函數不變
async function generateAIAnalysis(data) {
    // 您的原有代碼...
}
