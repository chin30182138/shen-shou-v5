const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 重試機制 + 錯誤分類
async function retryRequest(fn, maxRetries = 3, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.error(`重試 ${i + 1}/${maxRetries} 失敗：${err.message}`);
      if (i === maxRetries - 1) {
        if (err.code === 'invalid_api_key' || err.status === 401) {
          throw new Error('API Key 無效，請檢查 .env 檔案！😿');
        } else if (err.code === 'rate_limit_exceeded' || err.status === 429) {
          throw new Error('請求超限，請等一下再試哦～😽');
        } else if (err.code === 'model_not_found' || err.status === 404) {
          throw new Error('模型不見啦！試試 gpt-3.5-turbo 吧～😺');
        } else {
          throw new Error(`OpenAI 小助手累了：${err.message} 😿`);
        }
      }
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

// 靜態 fallback 報告（超可愛版！）
function generateFallbackReport(summary, scores) {
  const topBeast = summary.top;
  const variant = summary.variant;
  const mainType = `${topBeast}${variant}型`;
  const dualHint = summary.dual ? `（還有小幫手：${summary.dual[1]}！）` : '';
  const branchDesc = {
    子: '機敏如小貓，水元素讓你靈活無敵！😽',
    丑: '穩重像大樹，土元素超級靠譜！🌳',
    寅: '勇敢小老虎，木元素充滿衝勁！🐯',
    卯: '溫柔小兔兔，木元素溫暖人心！🐰',
    辰: '堅韌大地龍，土元素領導力爆棚！🐉',
    巳: '神秘小蛇蛇，火元素智慧閃耀！🐍',
    午: '熱情小馬兒，火元素自由奔放！🐎',
    未: '溫和小綿羊，土元素藝術氣質滿滿！🐑',
    申: '機智小猴子，金元素靈活又聰明！🐒',
    酉: '精準小鳳凰，金元素美麗又優雅！🦚',
    戌: '忠誠小狗狗，土元素守護力超強！🐶',
    亥: '寬容小豬豬，水元素想像力無限！🐷',
  };

  return `
🌸✨ 介紹：哇塞！你是超級無敵可愛的 ${mainType}${dualHint} 小可愛！💖 ${topBeast} 的能量像閃亮星星，讓你獨一無二！${branchDesc[variant]} 簡直是宇宙最萌組合！😻

📊 能量分析：你的 ${topBeast} 能量爆表 (${scores[topBeast]}/25)！🌟 像個小超人！如果有低分小夥伴，別擔心，多練習就能變強哦～😉 ${summary.dual ? `還有 ${summary.dual[1]} 小助手，讓你更全能！` : ''}

🧠 人格特質：你是韓風 MBTI 的小冒險家！🌈 ${topBeast} 讓你像 ${topBeast === '青龍' ? '飛天小龍，創意無限！' : topBeast === '朱雀' ? '閃耀小鳥，超會聊天！' : '獨特小英雄！'} 加上 ${variant} 的 ${branchDesc[variant].split('，')[0]}，簡直無敵可愛！😽

🌈 生活應用：
- 職場：你是 ${topBeast} 小領袖！帶團隊像玩遊戲，${variant} 讓你更 ${variant === '子' ? '機智應變' : '穩定發光'}！💼
- 感情：用 ${topBeast} 的熱情暖心，${variant} 讓你超會撒嬌！💕 記得多聽聽對方哦～
- 養生：試試戶外跑跑跳跳，或安靜冥想，讓 ${variant} 的五行能量大爆發！🏃‍♂️🧘‍♀️

💰 金錢卦建議：你的 ${mainType} 適合 ${variant === '子' ? '投資科技小點子' : '穩穩賺錢'}！卦象說：${topBeast} 帶你「財運旺旺」！💸

🎉 結語：${mainType} 小可愛，你是宇宙最閃亮的存在！🌟 每天給自己一個小讚美，未來會更棒！AI 小 tip：寫日記，記錄你的萌萌能量！💖😺
  `;
}

app.post('/api/ai', async (req, res) => {
  const { scores, summary } = req.body;
  if (!summary) {
    return res.status(400).send('哎呀！缺少測驗資料喵～😿');
  }

  const topBeast = summary.top;
  const dual = summary.dual ? `雙獸: ${summary.dual.join(' x ')}` : '';
  const variant = summary.variant;
  const scoreStr = Object.entries(scores).map(([b, s]) => `${b}: ${s}/25`).join(', ');
  const branchTraits = `子: 機敏、智慧、水; 丑: 穩重、耐心、土; 寅: 勇敢、積極、木; 卯: 溫柔、敏捷、木; 辰: 堅韌、領導、土; 巳: 智慧、神秘、火; 午: 熱情、自由、火; 未: 溫和、藝術、土; 申: 機智、靈活、金; 酉: 精準、美麗、金; 戌: 忠誠、守護、土; 亥: 寬容、想像、水`;

  const prompt = `
你是超級無敵可愛的韓風MBTI專家，專門分析「神獸七十二型人格」！😻 這融合神獸、五行、金錢卦、地支、心理學，超有趣！用戶分數：${scoreStr}。主神獸：${topBeast} ${dual}。變體：${variant}。

地支特質：${branchTraits}。

生成一份超萌超韓風的報告！像韓國 MBTI（KakaoTalk 或 IDOL 風格）：用超多可愛 emoji（🌸✨😽），語氣誇張活潑（像「哇塞！你簡直是宇宙最萌 ${topBeast}${variant}型！」）。用短句、少女風、超級誇獎！避免正式或無聊文字，確保像在跟小可愛聊天！💖

**結構**：
1. 🌟介紹：歡迎+${topBeast}${variant}型概述（神獸+地支，像「青龍子型=創意小龍+機敏水能量！」）。
2. 📊能量分析：誇強項（高分神獸，如「${topBeast} 超強！」），鼓勵弱項（低分建議，輕鬆說）。
3. 🧠人格特質：像 MBTI（ENFP、INTJ 比喻），用神獸+地支形容，超萌（像「你是冒險小龍！」）。
4. 🌈生活應用：職場、感情、養生建議，根據分數+地支個性化，超實用！
5. 💰金錢卦：財運建議（像「青龍子型愛科技投資！」），加卦象。
6. 🎉結語：超正向鼓勵+AI小tip（像「每天笑一笑，能量滿滿！」）。

500-800字，繁體中文，少女風到爆！每段至少 3 個 emoji，確保 ${topBeast}${variant}型超獨特！😺🌈💕`;

  try {
    const completion = await retryRequest(() =>
      openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // 穩定模型
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.9, // 更高創意
      })
    );
    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    console.error('完整錯誤喵：', err);
    const fallbackText = generateFallbackReport(summary, scores);
    res.json({ text: fallbackText });
  }
});

app.listen(3000, () => {
  console.log('伺服器在 port 3000 開跑啦～😺');
});
