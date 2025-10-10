import OpenAI from "openai";

export const config = {
  runtime: "nodejs18.x",
  regions: ["hkg1"], // 可改為 "sin1" 或 "icn1" 看你地區
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!client.apiKey) throw new Error("Missing OpenAI API Key");

    const { scores, summary } = req.body;
    const beast = summary?.top || "未知";
    const dual = summary?.dual?.[1] ? `與 ${summary.dual[1]} 雙獸特質` : "";

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

請以台灣繁體中文，語氣自然、有深度。
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    });

    const text = completion.choices?.[0]?.message?.content || "(無內容)";
    res.status(200).json({ text });
  } catch (err) {
    console.error("AI 分析錯誤：", err);
    res.status(500).json({ error: err.message });
  }
}
