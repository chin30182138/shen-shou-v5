// api/ai.js - 處理AI分析請求
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scores, summary } = req.body;
    
    // 構建結構化的提示詞
    const prompt = buildPrompt(scores, summary);
    
    // 調用OpenAI API
    const analysis = await generateAnalysis(prompt);
    
    res.status(200).json({ text: analysis });
  } catch (error) {
    console.error('AI分析錯誤:', error);
    res.status(500).json({ error: '分析失敗，請稍後再試' });
  }
}

function buildPrompt(scores, summary) {
  const beasts = {
    '青龍': '創新、靈感、變通、探索',
    '朱雀': '表達、情感、社交、影響',
    '勾陳': '穩定、責任、計劃、傳統',
    '螣蛇': '敏感、觀察、協調、時機',
    '白虎': '效率、決策、結果、規範',
    '玄武': '思考、謹慎、規劃、邏輯'
  };

  return `你是一位融合心理學、易經五行和神獸象徵的專業分析師。請根據以下測驗結果，提供深度的人格分析：

【測驗結果】
主神獸：${summary.top}
${summary.dual ? `雙重特質：${summary.top} × ${summary.dual[1]}` : ''}
六獸能量分數：${Object.entries(scores).map(([beast, score]) => `${beast}:${score}`).join(', ')}

【神獸特質說明】
${Object.entries(beasts).map(([beast, traits]) => `● ${beast}: ${traits}`).join('\n')}

請從以下幾個層面進行分析：

1. **核心人格解讀** (結合主神獸特質)
2. **五行能量平衡** (從分數分布分析)
3. **優勢與潛在挑戰**
4. **個人成長建議**
5. **人際互動模式**

請用溫暖、專業且具有洞察力的語氣，避免機械化的列表，讓分析既有深度又實用。字數約500-800字。`;
}

async function generateAnalysis(prompt) {
  // 這裡使用您的OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一位融合東方易經智慧和現代心理學的專業分析師，擅長用溫暖而深刻的方式解讀人格特質。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
