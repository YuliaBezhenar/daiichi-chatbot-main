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

  console.log({
    sessionId,
    topic,
    language,
    conversation,
  });

  res.status(200).json({
    success: true,
  });

}