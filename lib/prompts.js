export function buildAnalysisPrompt(conversation) {
  return `
You are analyzing a user's conversation with an educational chatbot.

Your task is to determine what the user knows.

Return ONLY valid JSON.

Schema:

{
  "knowledge": {
    "knows_fukushima": true,
    "knows_2011_disaster": false,
    "knows_food_safe": false,
    "knows_alps": true,
    "knows_tritium": false,
    "knows_radiation": true
  },
  "knowledge_score": 0,
  "confidence": 0,
  "misconceptions": []
}

Rules:

- Return ONLY valid JSON.
- Do not wrap JSON inside markdown.
- Do not explain.
- knowledge_score: integer from 0 to 100.
- confidence: number from 0 to 1.
- misconceptions: array of short strings.

Conversation:

${conversation
  .map(m => `${m.role}: ${m.content}`)
  .join("\n")}
`;
}