import { buildAnalysisPrompt } from "../../lib/prompts";
import supabase from "../../lib/supabase";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const {
    sessionId,
    language,
    conversation,
    consent,
  } = req.body;

  if (!conversation || !Array.isArray(conversation)) {
    return res.status(400).json({
      error: "Conversation is required.",
    });
  }

  try {

    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-3.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
                  text: buildAnalysisPrompt(
                          sessionId,
                          language,
                          conversation
                        ),
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
    } catch (e) {
      console.error("Gemini JSON parse error:", e);

      return res.status(500).json({
        error: "Gemini returned invalid JSON.",
      });
    }

    console.log({
      sessionId,
      language,
      analysis,
    });

    const { error } = await supabase
    .from("chat_sessions")
    .upsert({
      session_id: sessionId,

      language: language,

      model: model,

      completed: true,

      updated_at: new Date().toISOString(),

      age: analysis.age,

      misconceptions: analysis.misconceptions,

      notes: analysis.notes,

      conversation: conversation,
 
      consent: consent,
    },
    {
      onConflict: "session_id",
    });

    if (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message,
    });

  }

    return res.status(200).json({
      success: true,
      sessionId,
      language,
      analysis,
      conversation,
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message,
    });

  }

}