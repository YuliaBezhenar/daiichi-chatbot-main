import supabase from "../../lib/supabase";

const SURVEY_QUESTION_IDS = ["q1", "q2", "q3", "q4", "q5"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { sessionId, language, answers } = req.body;

  if (!sessionId || !answers) {
    return res.status(400).json({
      error: "Session ID and answers are required.",
    });
  }

  const missing = SURVEY_QUESTION_IDS.filter((id) => !answers[id]);
  if (missing.length > 0) {
    return res.status(400).json({
      error: `Missing answers for: ${missing.join(", ")}`,
    });
  }

  try {
    const { error } = await supabase
      .from("chat_surveys")
      .upsert(
        {
          session_id: sessionId,
          language: language,
          q1: answers.q1,
          q2: answers.q2,
          q3: answers.q3,
          q4: answers.q4,
          q5: answers.q5,
        },
        { onConflict: "session_id" }
      );

    if (error) {
      console.error(error);
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}