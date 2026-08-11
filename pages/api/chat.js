import { incrementApiUsage, getApiUsage, DAILY_REQUEST_LIMIT } from "../../lib/apiUsage";

const FUKUSHIMA_FACTS = {
  title: "Fukushima Educational Quiz",

  verified_facts: [
    "Non-ionizing radiation only excites atoms without ionization while ionizing radiation has enough energy to remove electrons from atoms by main types of ionizing radiation that affect humans: alpha (helium-4 particles), beta (electrons or positrons), gamma rays (X-rays), and cosmic rays.",
    "Equivalent dose (H) in Sievert (Sv) accounts for the biological impact of different radiation types using unitless factors with the absorbed dose (D) is reported in Gray (Gy), which is the amount of energy (J) per mass (kg), and is used to calculate equivalent dose (Sv) by accounting for biological damage in addition to absorbed dose (Gy). Alpha radiation has a radiation weighting factor of 20 because it causes much greater biological damage than beta or gamma radiation.",
    "The International Commission on Radiological Protection (ICRP) Publication 103 recommended 5.5% increase in risk of mortality per 1 Sv radiation dose.",
    "Radioactive materials can be present in soil, air, food, and water depending on environmental conditions.",
    "Naturally occurring radionuclide materials (NORM), including uranium, thorium, potassium-40, and their decay products like radium and radon, can be present in soil, air, food, and water depending on the environmental conditions. (IAEA NORM)",
    "In a year, one trans-atlantic airline flight and one chest X-ray would each contribute of about 0.1 mSv while drinking a bottle of still water and eating one banana per day would give negligible contributions to the annual radiation dose of 2.1 mSv from natural sources in Japan (QST)",
    "Fukushima Prefecture, which is located in the northern part of main island, has three geographic regions with Fukushima City as its capital located in the central part of the prefecture and two Fukushima Nuclear Power Plants (NPPs), which are called Daiichi and Daini located at the Pacific coast. (Fukushima Travel)",
    "As the 3rd largest in Japan, Fukushima Prefecture has an area of 13783.9 square kilometers with three regions: Hamadori coastal area (21% of total), Nakadori central area (39% of total), and Aizu (40% of total). (Fukushima Travel, Fukushima Prefecture Revitalization Portal)",
    "Fukushima Prefecture is famous for its agricultural products such as peaches, rice, Japanese sake, and beef and each of three regions has unique activities: Fukushima city, which is located in the central part, has three famous hot springs; Fukushima coastal area has many fisherman communities and swimming places. (Japan Gov, Fukushima City Guide)",
    "After the tsunami flooding and nuclear accident, Fukushima hope tourism, which specifically aims to learn about the Fukushima disaster, is becoming popular to the general tourism. (Fukushima Hope Tourism)",
    "Fukushima Prefecture regions have been differently affected by the nuclear accident: Aizu, which is western part and never evacuated, Nakadori, which is the central part and mostly unaffected, and Hamadori, which is the coastal area with the Fukushima Daiichi NPP site. (Fukushima travel)",
    "On March 11 2011 at 14:46 JST, the largest earthquake of 9.0 magnitude occurred north of Fukushima Prefecture triggering a massive tsunami along the Pacific coast of northern Tohoku region with human casualties of 19,729 dead and 2,559 missing persons. Tsunami flooding destroyed all cooling equipment for the Unit 1-4 nuclear reactors of Fukushima Daiichi Nuclear Power Plant (FDNPP) leading to the major nuclear accident. (Reconstruction Agency, World Nuclear Association)",
    "Fukushima Daiichi Nuclear Power Plant accident released iodine 131, caesium 134, tritium, and caesium 137 in March-April 2011. (World Nuclear Association)",
    "Fukushima Daiichi accident is one of the major accidents of level 7 in the world by the International Atomic Energy Agency (IAEA) classification",
    "The acute radiation of the Fukushima Daiichi NPP accident did not cause any fatalities while the most fatalities were due to the tsunami flooding, which was triggered by the largest earthquake and destroyed all cooling equipment for the nuclear reactors in Unit 1-4 with Units 5 and 6 remained unaffected. (FIPO)",
    "The FDNPP-accident affected area was evacuated with radiation levels above 20 mSv per year (or above 2 μSv per hour) without any fatalities due to acute radiation compared with tsunami, earthquake and evacuation-related causes. (UNSCEAR)",
    "On April 1st 2011, Japan's food radiation limit was lowered to 100 Bq/kg, which 12 times lower than US and EU, and Fukushima food products has been strictly confirming radiation levels below the 100 Bq/kg limit by the Prefectural Government",
    "Since the start of decontamination efforts in Fukushima Prefecture, the maximum emergency evacuation area of 1150 square km in August 2011 was reduced to 371 square km in April 2017. (Fukushima Prefecture Revitalization Portal)",
    "Whole-area decontamination was completed by March 2018 except the Difficult-to-Return Zone, which has an area of 309 square km in 2026 and air radiation dose rate of above 5 μSv/h such as Okuma town near FDNPP on 28 Jul 2026, while other areas of Fukushima city and coastal towns have air radiation dose rate less than 0.1 μSv/h. (Japan Radiation Map)",
    "The excessive amount of contaminated water was generated due to groundwater inflow into Fukushima Daiichi damaged reactor buildings, which required cooling of melted nuclear fuel, and it was stored in many surface tanks at the FDNPP site. (METI ANRE)",
    "The stored contaminated water was treated by the Advanced Liquid Processing System (ALPS) to remove 62 radionuclides below ocean discharge threshold except tritium, which remains because it's part of the water molecule. (Ministry of the Environment, METI)",
    "Tritium (H-3 or T) radionuclide, which is a nuclide that is unstable with a half-life of 12.32 years, is A) Naturally and artificially produced; B) Beta emitter; C) Forms tritiated water (HTO); D) Discharge from Nuclear Power Plants. (TEPCO)",
    "The ALPS-treated water discharge is diluted by ocean water to have tritium concentrations below 1,500 Bq/L, which is 1/40 of the regulatory limit and 1/7 of WHO drinking water guideline (10,000 Bq/L), to be independently monitored by the IAEA. (IAEA, TEPCO)"
  ],
 
  sources: [
    {
      name: "Fukushima Travel",
      url: "https://fukushima.travel/"
    },
    {
      name: "Fukushima Prefecture Revitalization Portal",
      url: "https://www.pref.fukushima.lg.jp/site/portal-english/en05-01.html"
    },
    {
      name: "Japan Gov",
      url: "https://www.japan.go.jp/kizuna/2022/02/the_flavor_of_fukushima.html"
    },
    {
      name: "Fukushima City Guide",
      url: "https://www.f-kankou.jp/en/onsen/"
    },
    {
      name: "Fukushima Hope Tourism",
      url: "https://www.hopetourism.jp/en/"
    },
    {
      name: "Reconstruction Agency",
      url: "https://www.reconstruction.go.jp/english/topics/GEJE/"
    },
    {
      name: "World Nuclear Association",
      url: "https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/fukushima-daiichi-accident#inside-the-fukushima-daiichi-reactors"
    },
    {
      name: "FIPO",
      url: "https://www.fipo.or.jp/lore/en"
    },
    {
      name: "UNSCEAR",
      url: "https://www.unscear.org/unscear/en/areas-of-work/fukushima.html"
    },
    {
      name: "Fukumegu",
      url: "https://fukumegu.org/ok/contentsV2/"
    },
    {
      name: "Japan Radiation Map",
      url: "https://jciv.iidj.net/map/"
    },
    {
      name: "METI ANRE",
      url: "https://www.enecho.meti.go.jp/en/category/special/article/detail_143.html"
    },
    {
      name: "Ministry of the Environment",
      url: "https://www.env.go.jp/en/chemi/rhm/basic-info/1st/06-03-05.html"
    },
    {
      name: "METI",
      url: "https://www.meti.go.jp/english/earthquake/nuclear/decommissioning/atw.html"
    },
    {
      name: "IAEA",
      url: "https://www.iaea.org/topics/response/fukushima-daiichi-nuclear-accident"
    },
    {
      name: "IAEA NORM",
      url: "https://www.iaea.org/topics/radiation-safety-norm"
    },
    {
      name: "The National Institutes for Quantum Science and Technology (QST)",
      url: "https://www.qst.go.jp/uploaded/attachment/32295.pdf"
    }
  ]
};

//   verified_facts: [
//     "Fukushima Prefecture has Fukushima City and Fukushima Daiichi Nuclear Power Plant (NPP), which are at different locations. (Fukushima Prefecture)",
//     "Fukushima Prefecture regions have been differently affected by the nuclear accident: Aizu, which is western part and never evacuated, Nakadori, which is the central part and mostly unaffected, and Hamadori, which is the coastal area with the Fukushima Daiichi NPP site. (Fukushima Prefecture)",
//     "Fukushima Daiichi and Chornobyl Nuclear Power Plant accidents are the two major accidents in the world by the International Atomic Energy Agency (IAEA) classification. (IAEA, INES scale)",
//     "Chornobyl Exclusion Zone of 2,600 squared km is unchanged from May 1986 while the Difficult-to-Return Zone was reduced from about 12% of Fukushima Prefecture in April 2011 to only about 2.2% (300 squared km) in 2026. (IAEA Chornobyl, Fukushima Prefecture Revitalization Portal)",
//     "Despite the same major nuclear accident of level 7, Fukushima Daiichi and Chornobyl Nuclear Power Plant accidents had different nuclear accident occurrence and atmospheric radionuclide release. (IAEA Fukushima, IAEA Chornobyl)",
//     "The acute radiation of the Fukushima Daiichi NPP accident did not cause any fatalities while the most fatalities were due to the tsunami flooding. (IAEA Fukushima)",
//     "After the Fukushima Daiichi NPP accident, Japan's food radiation limit has been lowered to 100 Bq/kg and strictly monitored in Fukushima food products by the Prefectural Government confirming radiation levels below the 100 Bq/kg limit. (Fukumegu)",
//     "Whole-area decontamination was completed by March 2018 except the Difficult-to-Return Zone, which has an air radiation dose rate of 4.95 μSv/h in Okuma town on 28-Jul-2026, while other areas of Fukushima city and coastal towns have air radiation dose rate less than 0.1Sv/h. (Japan Radiation Map)",
//     "The contaminated water was treated by the Advanced Liquid Processing System (ALPS) to remove 62 radionuclides below ocean discharge threshold except tritium, which remains because it's part of the water molecule. (TEPCO)",
//     "The ALPS-treated water discharge is diluted by ocean water to have tritium concentrations below 1,500 Bq/L, which is 1/40 of the regulatory limit and 1/7 of WHO drinking water guideline (10,000 Bq/L), to be independently monitored by the IAEA. (TEPCO)"
//   ],

//   sources: [
//     {
//       name: "Fukushima Prefecture",
//       url: "https://www.pref.fukushima.lg.jp/"
//     },
//     {
//       name: "Fukushima Prefecture Revitalization Portal",
//       url: "https://www.pref.fukushima.lg.jp/site/portal-english/en03-08.html"
//     },
//     {
//       name: "IAEA Fukushima",
//       url: "https://www.iaea.org/topics/response/fukushima-daiichi-nuclear-accident"
//     },
//     {
//       name: "IAEA Chornobyl",
//       url: "https://www.iaea.org/topics/chornobyl"
//     },
//     {
//       name: "TEPCO",
//       url: "https://www.tepco.co.jp/en/decommission/progress/watertreatment/"
//     },
//     {
//       name: "Japan Radiation Map",
//       url: "https://jciv.iidj.net/map/"
//     },
//     {
//       name: "INES",
//       url: "https://www.iaea.org/sites/default/files/ines.pdf"
//     },
//     {
//       name: "Fukumegu",
//       url: "https://fukumegu.org/ok/contentsV2/kome_summary.html"
//     }
//   ]
// };


const LANGUAGE_INSTRUCTIONS = {
  en: "Respond in English.",
  ar: "Respond in Arabic (العربية). Use Arabic script for your entire response.",
  ja: "Respond in Japanese (日本語). Use Japanese script for your entire response."
};

function buildSystemPrompt(language) {
  const topicData = FUKUSHIMA_FACTS;
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

  return `You are "Daiichi" — a warm, curious, friendly AI built by the IER Research Team at Fukushima University (Institute of Environmental Radioactivity), as part of a research project on correcting Fukushima misconceptions.

YOUR PERSONALITY:
- Talk like a knowledgeable friend having a genuine conversation, NOT like a teacher or quiz machine.
- Your goal is to help the user understand more about Fukushima and radiation through conversation.
- Be curious, warm, and a little playful. Use the person's responses to naturally guide the conversation.
- Keep messages SHORT — 2-4 sentences max. Never write paragraphs.
- Use emojis occasionally but not excessively.
- When you cite a fact with exact numbers, naturally mention the source: "According to the IAEA..." or "TEPCO's data shows..."
- When you do not cite a source, do not invent one or use a random one. Only use the sources that are relevant.

YOUR CONVERSATION METHOD (Conversational Inoculation):
You gently guide the user to discover Fukushima truths themselves through natural conversation. Here's how:

1. OPENING (first message): Start warmly and personally. Ask if they've heard about Fukushima or the 2011 disaster — make it feel like the start of a real conversation with a friend. At the beginning if you see that user is not asking questions or sharing their thoughts, you may ask user what they want to know about science or Fukushima, but do not ask everything in one message.

2. EXPLORE THEIR KNOWLEDGE: Explore what they think or have heard and help them to understand more. Ask what they need your help with. Listen to their answer or question and respond to it specifically.

3. GENTLY INTRODUCE A MYTH: Weave in a common misconception naturally — "A lot of people actually think that..." — then ask what they think about it.

4. GUIDE TO THE TRUTH: If they get it right, affirm and add a specific fact. If they get it wrong or say "I don't know", respond warmly: "That's actually what most people think! Here's what the data really shows..." — never say "Not quite" or make them feel bad.

5. CONNECT NATURALLY: Each fact should lead to the next like a real conversation. "That's really interesting — it makes me think about another thing people often get wrong..."

6. WRAP UP: After covering the key facts naturally, summarize warmly: "So basically, the data paints a really different picture from what most people imagine about Fukushima 🌱"

VERIFIED FACTS TO USE IN QUESTIONS (use these exact numbers):
${topicData.verified_facts.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Those facts you can use as a topic for the conversation.
If user asks something connected to one of these facts, continue chatting in this direction and slowly continue to connected topics.
You can cover all information in the fact, but don't have to, it is more important to answer what user asks for. But you can ask if they want to know more about this or that, so you can continue conversation in this or connected direction.

SOURCES:
${topicData.sources
  .map(s => `- ${s.name}: ${s.url}`)
  .join("\n")}

  When citing a fact with exact numbers, use one of the sources listed above.

  Format it as Markdown.

  Example:
  Source: [IAEA](https://www.iaea.org/topics/response/fukushima-daiichi-nuclear-accident)
  or "[TEPCO's](https://www.tepco.co.jp/en/decommission/progress/watertreatment/) data shows..."

  Never invent URLs.

After discussing minimum 10 facts, gently ask user, if they can share the conversation and feedback to help the research via button below the chat. You can continue chatting after that. Information will be shared anonymously.

CRITICAL RULES:
- NEVER say "Not quite!" or make the user feel wrong. Instead: "That's actually the most common belief! Here's what's surprising..."
- NEVER list facts like bullet points. Weave them into natural sentences.
- When explaining a fact, include the most relevant information. Provide specific numbers when it helps understanding (for example comparing something) or when user ask for it.
- NEVER agree with misinformation — gently correct it like a friend who happens to know the facts.
- If user says "I don't know" — that's great! Say something like "Honestly, most people don't! So here's something that might surprise you..."
- Keep it SHORT. If your message is more than 4 sentences, it's too long.
- Do not overload the user with every number from the verified fact unless the numbers are important for the explanation or the user asks for more detail.
- Don't use stable phrased or repetitive sentences. Be creative and natural in your responses.
- You may simplify or rephrase verified facts, avoid copying the fact verbatim in the chat or asking for specific details which simple person will not know. But NEVER change their meaning, numbers, dates, comparisons, or conclusions.
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

  const usageBefore = await getApiUsage();
  if (usageBefore.count >= DAILY_REQUEST_LIMIT) {
    return res.status(429).json({
      error: "Daily request limit reached. Please try again tomorrow.",
      usage: usageBefore,
    });
  }

  const systemPrompt = buildSystemPrompt(language || "en");

  const geminiMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const maxRetries = 3;

  const model = "gemini-3.6-flash";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
