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
    answers,
  } = req.body;

  if (!sessionId || !answers) {
    return res.status(400).json({
      error: "Session ID and answers are required.",
    });
  }

  try {

    const { error } = await supabase
      .from("chat_surveys")
      .insert({
        session_id: sessionId,
        language: language,
        answers: answers,
      });

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