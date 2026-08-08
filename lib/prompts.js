export function buildAnalysisPrompt(sessionId, language, conversation) {
  return `

  Session ID:
${sessionId}

Language:
${language}


You are analyzing a user's conversation with an educational chatbot.

Your task is to extract information about the user.

Return ONLY valid JSON.

Always copy the provided session ID, language into the corresponding fields.

Schema:

{
  "session_id": "${sessionId}",
  "language": "${language}",
  "age": null,
  "misconceptions": [],
  "notes": ""
}

Rules:

- Return ONLY valid JSON.
- Do not wrap JSON inside markdown.
- Do not explain.
- Do not change conversation content.
- misconceptions: array of short strings.
- If the user does not provide their age, use null.

A misconception means that the user expresses an incorrect belief, claim, or understanding about Fukushima, radiation, ALPS, environmental risks, or related scientific topics.
Do NOT treat "I don't know", uncertainty, lack of knowledge, or a wrong answer by itself as a misconception.

DO NOT assume knowledge that the user did not demonstrate.

Conversation:

${conversation
  .map(m => `${m.role}: ${m.content}`)
  .join("\n")}
`;
}