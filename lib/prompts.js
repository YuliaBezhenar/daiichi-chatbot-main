export function buildAnalysisPrompt(sessionId, language, conversation) {
  return `

  Session ID:
${sessionId}

Language:
${language}

You are analyzing a user's conversation with an educational chatbot.

Your task is to determine what the user knows.

Return ONLY valid JSON.

Always copy the provided session ID and language into the session_id and language fields respectively.

Schema:

{
  "age": null,

  "knowledge": {
    "fukushima": 0,
    "2011_disaster": 0,
    "radiation": 0,
    "food_safety": 0,
    "decontamination": 0,
    "revitalization": 0,
    "alps": 0,
    "tritium": 0,
    "water_discharge": 0,
    "iaea_monitoring": 0
  },

  "knowledge_score": 0,

  "misconceptions": [],

  "sources_of_knowledge": {
    "news": false,
    "social_media": false,
    "school": false,
    "university": false,
    "friends": false,
    "family": false,
    "youtube": false,
    "television": false,
    "other": ""
  },

  "notes": ""
}

Knowledge values:

0 = Never heard of it

1 = Heard the term only

2 = Basic understanding

3 = Moderate understanding

4 = Good understanding

5 = Excellent understanding

Rules:

- Return ONLY valid JSON.
- Do not wrap JSON inside markdown.
- Do not explain.
- knowledge_score: integer from 0 to 100.
- confidence: number from 0 to 1.
- misconceptions: array of short strings.

Only assign a score based on evidence from the conversation.
DO NOT assume knowledge that the user did not demonstrate.

Conversation:

${conversation
  .map(m => `${m.role}: ${m.content}`)
  .join("\n")}
`;
}