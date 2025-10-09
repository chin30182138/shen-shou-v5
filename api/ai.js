export default async function handler(req, res) {
  try {
    // 兼容 Vercel 舊版/新版 req 物件
    const body = req.body || (await (async () => {
      try { return await req.json(); } catch { return {}; }
    })());

    const { scores, summary } = body || {};
    if (!scores || !summary) {
      return res.status(400).json({ error: "缺少 scores 或 summary" });
    }

    const sys = "你是「仙人指路占卜研究學會」的助教。根據六獸能量（青龍、朱雀、勾陳、螣蛇、白虎、玄武）與主神獸，寫出 120~180 字個人化建議，融合職場／感情／養生三面向，語氣溫暖、具體可行、避免空話。";
    const usr = `六獸分數：${Object.entries(scores).map(([k, v]) => `${k}${v}`).join("、")}；主神獸：${summary.top}${summary.dual ? `，次主導：${summary.dual[1]}` : ""}`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr }
        ],
        temperature: 0.7,
        max_tokens: 220
      })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: text || "OpenAI API error" });
    }

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}
