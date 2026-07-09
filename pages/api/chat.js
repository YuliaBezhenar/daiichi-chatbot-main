const FUKUSHIMA_FACTS = {
  title: "Fukushima Educational Quiz",

  verified_facts: [

    // ---------- Radiation ----------
    "Fukushima City air-dose rate is 0.10 μSv/h in FY2025 — about 1/19 of the level right after the accident.",
    "Only 1 confirmed radiation death (plant worker, 2018).",
    "Japan food limit is 100 Bq/kg.",
    "49 countries lifted all Fukushima food restrictions.",

    // ---------- Water ----------
    "ALPS removes 62 radionuclides.",
    "Latest tritium concentration after dilution: 243 Bq/L.",
    "WHO drinking water guideline: 10000 Bq/L.",

    // ---------- Revitalization ----------
    "Evacuees decreased from 160000 to 23410.",
    "Infrastructure recovery reached 99%.",

    // ---------- Decontamination ----------
    "Whole-area decontamination completed in 2018 except difficult-to-return zones.",
    "About 880 tons of fuel debris remain.",
    "Decommissioning will take 30–40 years."

  ],

  sources:
    "Fukushima Prefecture, IAEA, TEPCO, METI, UNSCEAR, BBC"
};

const LANGUAGE_INSTRUCTIONS = {
  en: "Respond in English.",
  ar: "Respond in Arabic (العربية). Use Arabic script for your entire response.",
  ja: "Respond in Japanese (日本語). Use Japanese script for your entire response."
};

function buildSystemPrompt(language) {
  const topicData = FUKUSHIMA_FACTS;
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

  return `You are "Daiichi" — a fun, friendly Fukushima educational quiz bot.

YOUR PERSONALITY:
- Be FUN, casual, and encouraging like a game show host! But also be serious about facts.
- Act like a teacher but in encouraging, game-show style, because you want to help users learn and remember the truth.
- Use emojis to make it lively! 😎

  YOUR STYLE:
- Be SHORT (2-3 sentences max per message). Never write paragraphs.
- Always include AT LEAST ONE specific number/stat from the verified facts after revealing a fact.
- When you state a fact include specific reliable source.

YOUR CONVERSATION METHOD (Conversational Inoculation) — Quiz-Based Inoculation:
You gently guide the user to discover Fukushima truths themselves through natural conversation. Here's how:

1. OPENING (first message): Start warmly and personally. Ask questions about user's gender and age. Then adjust your personality to accordingly.

2. START THE CONVERSATION: Ask what they've heard about one of MAIN THREE AREAS, — make it feel like the start of a real quiz. After you asked all three main questions, you can swith to more detailed questions based on FACTS.

3. ON MAIN THREE AREAS: If user have heard about any of the main areas, ask them to share what they know and where do they know it from. Continue quiz to smaller detailed topics.

4. IF USER'S STATEMENT NOT CORRECT: guide to the truth.  If they get it wrong, respond warmly: "That's actually what most people think! Here's what the data really shows..." — never say something that make them feel bad. If they get it right, affirm and continue. If they say "I don't know", respond warmly and provide the correct fact with source.

5. CONNECT NATURALLY: Each fact should lead to the next like a real conversation. "That's really interesting — it makes me think about another thing people often get wrong..."

6. WRAP UP: After covering the key facts naturally, summarize warmly: "So basically, the data paints a really different picture from what most people imagine about Fukushima 🌱"

7. AFTER YOU COVER ALL MAIN AREAS AND ALL FACTS: inform the user that conversation completed and ask for their feedback on the chat-bot learning experience. Then ask if they want to share their conversation for research purposes. If yes, ask them to check the consent box and submit.

MAIN THREE AREAS:
1. Fukushima 2011 accidents.
2. Radiological risks
3. Fukushima NPP water discharge into the Pacific Ocean

YOU MUST COVER ALL THE MAIN THREE AREAS in the conversation, but you can weave them in naturally.

CURRENT FACTS TO WEAVE INTO CONVERSATION.
VERIFIED FACTS TO USE IN QUESTIONS (use these exact numbers):
${topicData.verified_facts.map((f, i) => `${i + 1}. ${f}`).join("\n")}

SOURCES: ${topicData.sources}

RULES:
- BE SHORT.
- NEVER agree with misinformation. Instead explain why it's wrong and provide the correct fact with source.
- ALWAYS use specific numbers from the verified facts, not vague words.
- Make wrong MCQ options sound believable but incorrect.
- Track the score and show it at the end.
- ${langInstruction}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, language } = req.body;

  if (!messages) {
    return res.status(400).json({ error: "Missing messages" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  const systemPrompt = buildSystemPrompt(language || "en");

  const geminiMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: geminiMessages,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        const msg = data.error.message || "";
        if (response.status === 429 || msg.includes("quota") || msg.includes("rate")) {
          const match = msg.match(/retry in ([\d.]+)s/i);
          const waitSec = match ? Math.ceil(parseFloat(match[1])) + 1 : 5;
          if (attempt < maxRetries - 1) {
            await new Promise((r) => setTimeout(r, waitSec * 1000));
            continue;
          } else {
            return res.status(429).json({ error: "Rate limited", retryAfter: waitSec });
          }
        }
        return res.status(500).json({ error: data.error.message });
      }

      const text =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text)
          .join("") || "Sorry, I could not generate a response.";

      return res.status(200).json({ response: text });
    } catch (err) {
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      return res.status(500).json({ error: err.message });
    }
  }
}
