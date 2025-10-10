// /api/ai.js
import OpenAI from "openai";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!client.apiKey) {
      return res.status(500).json({ error: "OpenAI API key missing" });
    }

    const { scores, summary } = req.body || {};
    const beast = summary?.top || "未知";
    const dual = summary?.dual?.[1] ? `與 ${summary.dual[1]} 雙獸特質` : "";

    const prompt = `
你是一位結合中醫五行、道家哲理與心理人格分析的專業顧問。
使用者的主神獸為「${beast}」${dual}。
六獸分數如下：
${Object.entries(scores || {}).map(([k, v]) => `${k}:${v}`).join("、")}。

請生成一份「神獸七十二型人格專業報告」，包含以下段落：
一、人格核心分析（約100字）
二、內在優勢（3點）
三、隱藏挑戰（3點）
四、職場行為與合作建議（約200字）
五、情感互動與溝通風格（約200字）
六、健康與能量平衡建議（約150字，結合五行養生）
七、總結（正面鼓勵語）

請使用台灣繁體中文，語氣自然、有深度。
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const text = completion.choices?.[0]?.message?.content || "(無內容)";
    res.status(200).json({ text });
  } catch (err) {
    console.error("AI 分析錯誤：", err);
    res.status(500).json({ error: err.message });
  }
}
