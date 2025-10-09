export default async function handler(req, res) {
  try {
    const body = req.body || (await req.json?.());
    const { scores, summary } = body || {};
    if (!scores || !summary)
      return res.status(400).json({ error: "缺少 scores 或 summary" });

    const sys =
      "你是『仙人指路占卜研究學會』的助教，請根據六獸能量（青龍、朱雀、勾陳、螣蛇、白虎、玄武）與主神獸，撰寫一段約150字的個人化補運建議，語氣溫暖實用。";
    const usr = `六獸分數：${Object.entries(scores)
      .map(([k, v]) => `${k}${v}`)
      .join("、")}；主神獸：${summary.top}${
      summary.dual ? `，次主導：${summary.dual[1]}` : ""
    }`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr },
        ],
        temperature: 0.7,
        max_tokens: 220,
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      return res.status(500).json({ error: text });
    }

    const data = await openaiRes.json();
    res.status(200).json({
      text: data.choices?.[0]?.message?.content || "（沒有產生內容）",
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}
