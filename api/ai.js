const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');

// 創建 Express 應用
const app = express();

// 中間件
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 從環境變數獲取 API Keys
const openaiApiKey = process.env.OPENAI_API_KEY;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

console.log('環境變數檢查:');
console.log('OPENAI_API_KEY:', openaiApiKey ? '已設定' : '未設定');
console.log('DEEPSEEK_API_KEY:', deepseekApiKey ? '已設定' : '未設定');

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '服務正常運行', 
    timestamp: new Date().toISOString(),
    openai: !!openaiApiKey,
    deepseek: !!deepseekApiKey,
    platform: 'Vercel'
  });
});

// 重試函數
async function retryRequest(fn, maxRetries = 2, delay = 10000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();
      return result;
    } catch (err) {
      console.error(`重試 ${i + 1}/${maxRetries} 失敗：${err.message}`);
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 靜態 fallback 報告
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

// DeepSeek API 呼叫
async function callDeepSeek(prompt) {
  if (!deepseekApiKey) throw new Error('DeepSeek API Key 未設定');
  
  const url = 'https://api.deepseek.com/v1/chat/completions';
  const headers = { 
    'Authorization': `Bearer ${deepseekApiKey}`, 
    'Content-Type': 'application/json' 
  };
  const data = {
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.9,
  };
  
  const response = await axios.post(url, data, { 
    headers, 
    timeout: 25000 
  });
  
  if (!response.data.choices || !response.data.choices[0].message.content) {
    throw new Error('DeepSeek 回應為空');
  }
  
  return response.data;
}

// 主要 AI 分析端點
app.post('/api/ai', async (req, res) => {
  console.log('收到 AI 分析請求');
  
  try {
    const { scores, summary } = req.body;
    
    if (!summary) {
      return res.status(400).json({ 
        error: '缺少測驗資料，請先完成測驗！😿' 
      });
    }

    console.log('分析資料:', { 
      topBeast: summary.top, 
      variant: summary.variant,
      scores 
    });

    // 生成提示詞
    const topBeast = summary.top;
    const dual = summary.dual ? `雙獸: ${summary.dual.join(' x ')}` : '';
    const variant = summary.variant;
    const scoreStr = Object.entries(scores).map(([b, s]) => `${b}: ${s}/25`).join(', ');
    
    const prompt = `
你是超級韓風 MBTI 小仙女，專聊「神獸七十二型人格」！😽💕 
用戶分數：${scoreStr}。主神獸：${topBeast} ${dual}。變體：${variant}。

生成韓劇級超萌報告！超多 emoji (🌸😻💖✨)，語氣少女爆表！
短句、誇張撒嬌、滿滿正能量！每段至少 4 個 emoji，像跟閨蜜聊天！😘

**結構**：
1. 🌟介紹：大喊歡迎+${topBeast}${variant}型萌點
2. 📊能量分析：狂誇強項，輕鬆鼓勵弱項
3. 🧠人格特質：MBTI 比喻+神獸特質
4. 🌈生活應用：職場/感情/養生小 tip
5. 💰金錢卦：財運萌建議
6. 🎉結語：大抱抱鼓勵

500-800字，繁體中文，少女風到融化！讓 ${topBeast}${variant}型超獨特可愛！🌈💖😺`;

    let completion;
    let usedService = '';

    try {
      // 先嘗試 OpenAI
      if (openai && openaiApiKey) {
        console.log('嘗試 OpenAI...');
        completion = await retryRequest(() =>
          openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 800,
            temperature: 0.9,
          })
        );
        usedService = 'OpenAI';
      } else {
        throw new Error('OpenAI 未設定');
      }
    } catch (openaiErr) {
      console.log('OpenAI 失敗:', openaiErr.message);
      
      // 嘗試 DeepSeek
      if (deepseekApiKey) {
        console.log('嘗試 DeepSeek...');
        try {
          const deepseekResp = await retryRequest(() => callDeepSeek(prompt));
          completion = { 
            choices: [{ 
              message: { 
                content: deepseekResp.choices[0].message.content 
              } 
            }] 
          };
          usedService = 'DeepSeek';
        } catch (deepseekErr) {
          console.log('DeepSeek 失敗:', deepseekErr.message);
          throw new Error('所有 AI 服務暫時不可用');
        }
      } else {
        throw new Error('沒有可用的 AI 服務');
      }
    }

    console.log(`${usedService} 回應成功`);
    
    if (!completion.choices[0].message.content) {
      throw new Error('AI 回應為空');
    }
    
    const responseText = completion.choices[0].message.content;
    
    res.json({ 
      text: responseText,
      service: usedService
    });
    
  } catch (err) {
    console.error('AI 分析錯誤:', err);
    
    // 返回 fallback 報告
    const { scores = {}, summary = {} } = req.body || {};
    const fallbackText = generateFallbackReport(summary, scores);
    
    res.json({ 
      text: fallbackText,
      error: err.message,
      service: 'fallback'
    });
  }
});

// 導出 Vercel serverless 函數
module.exports = app;
