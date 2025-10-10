const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 重試機制
async function retryRequest(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw new Error(`重試失敗：${err.message}`);
      console.error(`重試 ${i + 1}/${maxRetries} 失敗：${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

app.post('/api/ai', async (req, res) => {
  const { scores, summary } = req.body;
  const topBeast = summary.top;
  const dual = summary.dual ? `雙獸: ${summary.dual.join(' x ')}` : '';
  const variant = summary.variant;
  const scoreStr = Object.entries(scores).map(([b, s]) => `${b}: ${s}/25`).join(', ');
  const branchTraits = `子: 機敏、智慧、水元素; 丑: 穩重、耐心、土元素; 寅: 勇敢、積極、木元素; 卯: 溫柔、敏捷、木元素; 辰: 堅韌、領導、土元素; 巳: 智慧、神秘、火元素; 午: 熱情、自由、火元素; 未: 溫和、藝術、土元素; 申: 機智、靈活、金元素; 酉: 精準、美麗、金元素; 戌: 忠誠、守護、土元素; 亥: 寬容、想像、水元素`;

  const prompt = `
你是一位可愛的韓風MBTI專家，專門分析"神獸七十二型人格"系統，融合中國神獸、五行、金錢卦、十二地支與心理學。用戶分數：${scoreStr}。主神獸：${topBeast} ${dual}。地支變體：${variant}。

地支特質參考：${branchTraits}。

生成一份個性化報告，像韓國MBTI一樣：趣味、鼓勵、正向，結構清晰。用可愛emoji，語言活潑（如"哇~你的青龍子型超有創意！✨"）。避免重複，注重${topBeast}${variant}型的獨特性。

結構：
1. **🌟 介紹**：歡迎+主型概述（融合神獸+地支，如青龍子型=成長+機敏）。
2. **📊 能量分析**：基於分數，描述強項（高分神獸特質）與弱項（低分需改善）。
3. **🧠 人格特質**：模仿MBTI，描述內向/外向、思考/感覺等，用神獸+地支比喻。
4. **🌈 生活應用**：職場、感情、養生建議，根據分數高低+地支個性化。
5. **💰 金錢卦建議**：財運建議（如青龍子型=智慧投資創新項目）。
6. **🎉 結語**：正向鼓勵+AI小建議。

報告500-800字，繁體中文，可愛風格，確保內容與${topBeast}${variant}型高度相關。
`;

  try {
    const completion = await retryRequest(() =>
      openai.chat.completions.create({
        model: 'gpt-4o-mini', // 若無權限，改用 'gpt-3.5-turbo'
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7, // 控制創意度
      })
    );
    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    console.error('API 錯誤：', err);
    res.status(500).send(`伺服器錯誤：${err.message}（錯誤碼：${err.code || '未知'}）`);
  }
});

app.listen(3000, () => {
  console.log('伺服器運行於 port 3000');
});
