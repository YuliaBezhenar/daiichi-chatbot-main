import { buildAnalysisPrompt } from "../../lib/prompts";
import supabase from "../../lib/supabase";

const MAX_RETRIES = 5;
const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
    const model = "gemini-3.6-flash";
    const chatModel = "gemini-3.5-flash-lite";

    let data;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
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

        data = await response.json();

        if (response.ok && !data.error) {
          break;
        }

        const status = response.status;
        const message = data.error?.message || "";

        const retryable =
          [408, 429, 500, 502, 503, 504].includes(status) ||
          /high demand|temporarily unavailable|overloaded/i.test(message);

        if (!retryable || attempt === MAX_RETRIES - 1) {
          return res.status(status || 500).json({
            error: message || "Gemini analysis failed.",
          });
        }
      } catch (err) {
        console.error(`Gemini attempt ${attempt + 1} failed:`, err);

        if (attempt === MAX_RETRIES - 1) {
          return res.status(503).json({
            error: "Gemini is temporarily unavailable. Please try again.",
          });
        }
      }

      const delay = 1000 * Math.pow(2, attempt) + Math.random() * 1000;

      console.log(
        `Retrying Gemini analysis (${attempt + 2}/${MAX_RETRIES}) in ${Math.round(delay)} ms`
      );

      await wait(delay);
    }

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

      model: chatModel,

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