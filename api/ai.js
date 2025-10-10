const OpenAI = require('openai');

// 靜態 fallback 報告（超萌韓風！）
function generateFallbackReport(summary, scores) {
  const topBeast = summary.top;
  const variant = summary.variant;
  const mainType = `${topBeast}${variant}型`;
  const dualHint = summary.dual ? `（雙萌獸：${summary.dual[1]}！）` : '';
  const branchDesc = {
    子: '機敏小貓咪，水元素靈活爆棚！😽💦',
    丑: '穩重大樹熊，土元素超靠譜！🌳🛡️',
    寅: '勇敢小老虎，木元素衝勁滿滿！🐯🌿',
    卯: '溫柔小兔兔，木元素甜蜜蜜！🐰💕',
    辰: '堅韌大地龍，土元素領袖王！🐉🗿',
    巳: '神秘小蛇蛇，火元素智慧閃！🐍🔥',
    午: '熱情小馬兒，火元素自由飛！🐎☀️',
    未: '溫和小綿羊，土元素藝術家！🐑🎨',
    申: '機智小猴子，金元素靈活鬼！🐒🪙',
    酉: '精準小鳳凰，金元素美美噠！🦚✨',
    戌: '忠誠小狗狗，土元素守護神！🐶🏰',
    亥: '寬容小豬豬，水元素夢想家！🐷🌊',
  };

  return `
🌸💖 哇塞！你是宇宙最閃亮的小 ${mainType}${dualHint} 寶貝！😻✨ ${topBeast} 能量像彩虹糖，${branchDesc[variant]} 讓你萌到飛天，韓劇女主級別！🌟😽

📊 能量分析：${topBeast} 超無敵 (${scores[topBeast]}/25)！🌈 你是小天才喵！低分小夥伴？嘻嘻，多玩玩就變強啦～😉 ${summary.dual ? `還有 ${summary.dual[1]} 雙倍萌力！` : '單萌也超棒！'} 😺

🧠 人格特質：像韓風 MBTI 的 ENFP 小仙女！😽 ${topBeast === '青龍' ? '創意小龍龍，腦洞大開！' : topBeast === '朱雀' ? '聊天小鳥鳥，超會撒嬌！' : '獨特小公主！'} ${variant} 讓你 ${branchDesc[variant].split('，')[0]}，圈內最愛！🌸💕

🌈 生活應用：（超粉紅小秘訣！）
- 職場：${topBeast} 型是小領袖！${variant} 讓你應變神速，帶隊像玩遊戲！💼😽
- 感情：${topBeast} 熱情暖心，${variant} 甜甜互動，愛情像奶茶！💖🐱
- 養生：${variant} 能量大解放！跑步或泡澡，保持萌萌噠！🏃‍♀️🛁✨

💰 金錢卦建議：${mainType} 財運旺旺！💸 ${variant === '子' ? '科技小投資超讚！' : '穩穩理財賺翻！'} 卦象「飛龍在天」，錢來啦！🌟😍

🎉 結語：${mainType} 小可愛，你是我的心頭寶！💖 每天給自己個大抱抱，世界更粉紅！AI 小 tip：穿粉裙子，能量 UP UP！😺🌸
  `;
}

// Vercel serverless 函數
module.exports = async (req, res) => {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 請求' });
  }

  try {
    const { scores, summary } = req.body;
    
    if (!summary) {
      return res.status(400).json({ error: '哎喲！測驗資料不見啦！😿 小萌物再試一次～' });
    }

    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });

    const topBeast = summary.top;
    const dual = summary.dual ? `雙獸: ${summary.dual.join(' x ')}` : '';
    const variant = summary.variant;
    const scoreStr = Object.entries(scores).map(([b, s]) => `${b}: ${s}/25`).join(', ');
    const branchTraits = `子: 機敏、智慧、水; 丑: 穩重、耐心、土; 寅: 勇敢、積極、木; 卯: 溫柔、敏捷、木; 辰: 堅韌、領導、土; 巳: 智慧、神秘、火; 午: 熱情、自由、火; 未: 溫和、藝術、土; 申: 機智、靈活、金; 酉: 精準、美麗、金; 戌: 忠誠、守護、土; 亥: 寬容、想像、水`;

    const prompt = `
你是超級仙風 仙人指路 小仙女，專聊「神獸七十二型人格」！😽💕 融合神獸、五行、金錢卦、地支、心理學，超粉紅好玩！用戶分數：${scoreStr}。主神獸：${topBeast} ${dual}。變體：${variant}。

地支特質：${branchTraits}。

生成韓劇級超萌報告！像 KakaoTalk MBTI：超多 emoji (🌸😻💖✨)，語氣少女爆表（「哇塞！你是宇宙最萌 ${topBeast}${variant}型！」「小可愛超棒！」）。短句、誇張撒嬌、滿滿正能量！每段至少 4 個 emoji，絕不正式，像跟閨蜜聊天！😘

**結構**（超可愛！）：
1. 🌟介紹：大喊歡迎+${topBeast}${variant}型萌點（神獸+地支，像「青龍子型=創意小龍+機敏水寶貝！」😽）。
2. 📊能量分析：狂誇強項（高分像「${topBeast} 閃到爆！」），輕鬆鼓勵弱項（「小練習就萌翻！」）。
3. 🧠人格特質：MBTI 比喻（像 ENFP 小冒險家！），神獸+地支超萌形容（「聊天小鳥+溫柔兔兔！」🐰）。
4. 🌈生活應用：職場/感情/養生小 tip，超個性化（分數+地支，粉紅實用！）。
5. 💰金錢卦：財運萌建議（「子型買可愛配件賺大錢！」），加卦象。
6. 🎉結語：大抱抱鼓勵+AI tip（「每天自拍一張，萌力滿滿！」😻）。

500-800字，繁體中文，少女風到融化！讓 ${topBeast}${variant}型超獨特可愛！🌈💖😺`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.9,
    });

    res.json({ text: completion.choices[0].message.content });
    
  } catch (err) {
    console.error('AI 小仙女日誌：', err);
    const { scores = {}, summary = {} } = req.body || {};
    const fallbackText = generateFallbackReport(summary, scores);
    res.json({ text: fallbackText });
  }
};
