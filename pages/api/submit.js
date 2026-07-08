import { buildAnalysisPrompt } from "../../lib/prompts";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const {
    sessionId,
    topic,
    language,
    conversation,
  } = req.body;

  if (!conversation || !Array.isArray(conversation)) {
    return res.status(400).json({
      error: "Conversation is required.",
    });
  }

  try {

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildAnalysisPrompt(conversation),
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    let text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        text = text
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

    let analysis = {};

    try {
      analysis = JSON.parse(text);
    } catch {

      analysis = {
        raw: text,
      };

    }

    // Тут потім буде Supabase

    console.log({
      sessionId,
      topic,
      language,
      analysis,
      conversation,
    });

    return res.status(200).json({
      success: true,
      analysis,
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message,
    });

  }

}