// /api/ai.js
import OpenAI from "openai";

export const config = {
  runtime: "nodejs18.x",   // 🔧 強制使用 Node 環境
  regions: ["hkg1"],       // 🔧 可改 sin1/icn1 看部署區域
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    // ✅ 檢查環境變數
    if (!process.env.OPENAI_API_KEY)
      return res.status(500).json({ error: "❌ Missing OPENAI_API_KEY" });

    // ✅ 初始化 OpenAI
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ✅ 接收前端資料
    const { scores, summary } = req.body;
    if (!scores || !summary)
      return res.status(400).json({ error: "Missing input data" });

    const beast = summary.top || "未知";
    const dual = summary.dual?.[1] ? `與 ${summary.dual[1]} 雙獸特質` : "";

    // ✅ 組合 prompt
    const prompt = `
使用者的主神獸為「${beast}」${dual}。
六獸分數如下：
${Object.entries(scores || {}).map(([k, v]) => `${k}:${v}`).join("、")}。

請生成一份「神獸七十二型人格專業報告」，包含以下段落：
一、人格核心分析
二、內在優勢（三點）
三、隱藏挑戰（三點）
四、職場合作建議
五、感情互動與溝通風格
六、健康與五行調養建議
七、總結（正面鼓勵）

請以台灣繁體中文書寫，語氣自然、有深度。
`;

    // ✅ 呼叫 GPT
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const text = completion.choices?.[0]?.message?.content || "(無內容)";
    return res.status(200).json({ text });
  } catch (err) {
    console.error("AI分析錯誤：", err);
    return res.status(500).json({ error: err.message });
  }
}
