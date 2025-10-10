const express = require('express');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai', async (req, res) => {
  const { scores, summary } = req.body;
  const topBeast = summary.top;
  const dual = summary.dual ? `雙獸: ${summary.dual.join(' x ')}` : '';
  const variant = summary.variant;
  const scoreStr = Object.entries(scores).map(([b, s]) => `${b}: ${s}/25`).join(', ');
  const branchTraits = `子: 機敏、智慧、水元素; 丑: 穩重、耐心、土元素; 寅: 勇敢、積極、木元素; 卯: 溫柔、敏捷、木元素; 辰: 堅韌、領導、土元素; 巳: 智慧、神秘、火元素; 午: 熱情、自由、火元素; 未: 溫和、藝術、土元素; 申: 機智、靈活、金元素; 酉: 精準、美麗、金元素; 戌: 忠誠、守護、土元素; 亥: 寬容、想像、水元素`;

  const prompt = `
你是一位可愛的韓風MBTI專家，專門分析"神獸七十二型人格"系統。這融合中國神獸、五行、金錢卦、十二地支與心理學。用戶的分數: ${scoreStr}。主神獸: ${topBeast} ${dual}。地支變體: ${variant}。

地支特質參考: ${branchTraits}。

生成一份個性化報告，像韓國MBTI一樣：趣味、鼓勵、正向，結構清晰。用可愛emoji，語言活潑（如"哇~你的青龍能量超強！"）。

結構：
1. **介紹**：歡迎+主型概述（融合神獸+地支，如青龍子型=成長+機敏）。
2. **能量分析**：基於雷達圖分數，強項/弱項（e.g., 高白虎=決斷力強，低勾陳=需穩定）。
3. **人格特質**：模仿MBTI，描述內向/外向、思考/感覺等，但用神獸+地支比喻。
4. **生活應用**：職場/感情/養生建議，個性化（基於分數高低+變體調整）。
5. **金錢卦整合**：建議財運卦象（e.g., 高青龍=投資創新，配子=智慧選擇）。
6. **結語**：鼓勵+AI小tip。

保持報告500-800字，中文繁體，可愛風格。`;
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 或 'gpt-4o' 若需更強
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
