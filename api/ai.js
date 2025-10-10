import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    const { scores, summary } = req.body;
    const beast = summary?.top || "未知";
    const dual = summary?.dual?.[1] ? `與 ${summary.dual[1]} 雙獸特質` : "";
    const prompt = `
你是一位結合中醫五行、道家哲理與現代心理學的占卜師。
根據六獸人格系統，使用者的主神獸為「${beast}」${dual}。
六獸分數如下：
${Object.entries(scores || {}).map(([k,v])=>`${k}:${v}`).join("、")}。

請生成一份完整的「神獸七十二型人格專業報告」，格式如下：
一、人格核心分析（約100字）
二、內在優勢（3點）
三、隱藏挑戰（3點）
四、職場行為特質與合作建議（約200字）
五、情感互動與相處模式（約200字）
六、健康與能量平衡建議（結合五行養生，約150字）
七、總結（以鼓勵語收尾）

要求：
1. 使用台灣繁體中文。
2. 語氣自然、啟發、有深度。
3. 結構清楚、段落分明。
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    });

    const text = completion.choices?.[0]?.message?.content || "(無內容)";
    res.status(200).json({ text });
  } catch (err) {
    console.error("AI 分析錯誤:", err);
    res.status(500).json({ error: err.message });
  }
}
