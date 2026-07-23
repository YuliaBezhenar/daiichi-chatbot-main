import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import {
  getSessionId,
  createNewSession,
} from "../lib/session";
import {
  saveConversation,
  loadConversation,
  saveLanguage,
  loadLanguage,
} from "../lib/storage";
import ConsentModal from "../components/ConsentModal";
import ShareConversation from "../components/ShareConversation";
import ReactMarkdown from "react-markdown";

const MENU_CARDS = [
  {
    id: "quiz",
    emoji: "🧠",
    en: "Start Chat",
    ja: "チャットを始める",
    ar: "ابدأ الدردشة",
  },
  {
    id: "learn",
    emoji: "📚",
    en: "Fukushima Facts",
    ja: "福島について学ぶ",
    ar: "تعرف على فوكوشيما",
  },
  {
    id: "tbd1",
    emoji: "🚧",
    en: "TBD",
    ja: "TBD",
    ar: "TBD",
  },
  {
    id: "tbd2",
    emoji: "🚧",
    en: "TBD",
    ja: "TBD",
    ar: "TBD",
  },
];

const LANGUAGES = {
  en: { label: "English", flag: "🇬🇧", dir: "ltr" },
  ar: { label: "العربية", flag: "🇦🇪", dir: "rtl" },
  ja: { label: "日本語", flag: "🇯🇵", dir: "ltr" },
};

const UI_TEXT = {
  en: {
    title: "Daiichi",
    subtitle: "Fukushima Myth-Buster Chatbot",
    chooseTopic: "Choose a topic to start the quiz:",
    typeMessage: "Type your answer...",
    send: "Send",
    powered: "Built at IER, Fukushima University",
    by: "By Abdulrahman Alblooshi",
    back: "← Change Topic",
    learnTitle: "Fukushima Facts",
    learnClose: "Close",
  },
  ar: {
    title: "دايتشي",
    subtitle: "روبوت تصحيح خرافات فوكوشيما",
    chooseTopic: "اختر موضوعاً لبدء الاختبار:",
    typeMessage: "اكتب إجابتك...",
    send: "إرسال",
    powered: "تم بناؤه في IER، جامعة فوكوشيما",
    by: "بواسطة عبدالرحمن البلوشي",
    back: "→ تغيير الموضوع",
    learnTitle: "تعرّف على فوكوشيما",
    learnClose: "إغلاق",
  },
  ja: {
    title: "ダイイチ",
    subtitle: "福島の誤解を正すチャットボット",
    chooseTopic: "トピックを選んでクイズを始めよう：",
    typeMessage: "回答を入力...",
    send: "送信",
    powered: "福島大学IERで開発",
    by: "Abdulrahman Alblooshi 作成",
    back: "← トピックを変更",
    learnTitle: "福島について学ぶ",
    learnClose: "閉じる",
  },
};

const FACT_SHEETS = {
  en: [
    {
      emoji: "🗾", title: "What Happened?",
      text: "On March 11, 2011, a massive earthquake and tsunami hit Japan. The tsunami caused a meltdown at the Fukushima Daiichi Nuclear Power Plant. About 18,500 people died — almost all from the tsunami, not radiation.",
      stat: "1", statLabel: "confirmed radiation death",
    },
    {
      emoji: "📍", title: "3 Regions, Not 1",
      text: "Fukushima Prefecture is huge! Only the coastal Hamadori area was affected. Aizu (western mountains) was never evacuated. Nakadori (central valley) was mostly fine.",
      stat: "97%", statLabel: "of Fukushima has normal radiation",
    },
    {
      emoji: "📉", title: "Radiation Today",
      text: "Radiation in Fukushima City dropped 95% since 2011. The restricted zone shrank from 12% to just 2.2% of the prefecture. It's safe to live and visit.",
      stat: "0.10 μSv/h", statLabel: "current Fukushima City level",
    },
    {
      emoji: "🍚", title: "Food is Safe",
      text: "Japan's food radiation limit (100 Bq/kg) is 12x stricter than the US. In FY2024, only 3 out of 9,027 food tests exceeded limits. 49 countries lifted all import bans.",
      stat: "100 Bq/kg", statLabel: "Japan's strict food limit",
    },
    {
      emoji: "🌊", title: "ALPS Treated Water",
      text: "The water is filtered through ALPS, removing 62 radioactive substances. Remaining tritium is diluted to 243 Bq/L — that's 43x below WHO drinking water limits.",
      stat: "1/40", statLabel: "of the regulatory safety limit",
    },
    {
      emoji: "🏘️", title: "People Are Returning",
      text: "Evacuees dropped from 160,000 to 23,410. Infrastructure is 99% rebuilt. Tourism hit record highs in FY2024. New industries are growing.",
      stat: "99%", statLabel: "infrastructure rebuilt",
    },
  ],
  ar: [
    {
      emoji: "🗾", title: "ماذا حدث؟",
      text: "في 11 مارس 2011، ضرب زلزال وتسونامي ضخم اليابان. تسبب التسونامي في انصهار في محطة فوكوشيما دايتشي النووية. توفي حوالي 18,500 شخص — معظمهم بسبب التسونامي وليس الإشعاع.",
      stat: "1", statLabel: "حالة وفاة مؤكدة بالإشعاع",
    },
    {
      emoji: "📍", title: "3 مناطق وليست واحدة",
      text: "محافظة فوكوشيما كبيرة! فقط منطقة هامادوري الساحلية تأثرت. آيزو (الجبال الغربية) لم يتم إخلاؤها أبداً.",
      stat: "97%", statLabel: "من فوكوشيما بمستوى إشعاع طبيعي",
    },
    {
      emoji: "📉", title: "الإشعاع اليوم",
      text: "انخفض الإشعاع في مدينة فوكوشيما بنسبة 95% منذ 2011. تقلصت المنطقة المحظورة من 12% إلى 2.2% فقط.",
      stat: "0.10 μSv/h", statLabel: "مستوى مدينة فوكوشيما الحالي",
    },
    {
      emoji: "🍚", title: "الطعام آمن",
      text: "حد الإشعاع الغذائي في اليابان (100 بيكريل/كجم) أكثر صرامة 12 مرة من أمريكا. في 2024، فقط 3 من 9,027 فحص تجاوزت الحد.",
      stat: "100 Bq/kg", statLabel: "حد اليابان الصارم للغذاء",
    },
    {
      emoji: "🌊", title: "مياه ALPS المعالجة",
      text: "يتم تصفية المياه عبر ALPS لإزالة 62 مادة مشعة. يتم تخفيف التريتيوم المتبقي إلى 243 بيكريل/لتر — أقل 43 مرة من حد مياه الشرب.",
      stat: "1/40", statLabel: "من حد السلامة التنظيمي",
    },
    {
      emoji: "🏘️", title: "الناس يعودون",
      text: "انخفض النازحون من 160,000 إلى 23,410. تم إعادة بناء البنية التحتية بنسبة 99%. السياحة سجلت أرقاماً قياسية في 2024.",
      stat: "99%", statLabel: "إعادة بناء البنية التحتية",
    },
  ],
  ja: [
    {
      emoji: "🗾", title: "何が起きた？",
      text: "2011年3月11日、巨大な地震と津波が日本を襲いました。津波により福島第一原子力発電所でメルトダウンが発生。約18,500人が亡くなりましたが、ほぼ全員が津波によるものです。",
      stat: "1", statLabel: "確認された放射線による死亡",
    },
    {
      emoji: "📍", title: "3つの地域",
      text: "福島県は広大です！影響を受けたのは沿岸の浜通りだけ。会津（西部山地）は避難なし。中通り（中央）もほぼ影響なし。",
      stat: "97%", statLabel: "の福島は正常な放射線レベル",
    },
    {
      emoji: "📉", title: "現在の放射線",
      text: "福島市の放射線は2011年から95%低下。制限区域は県面積の12%から2.2%に縮小。住むのも訪れるのも安全です。",
      stat: "0.10 μSv/h", statLabel: "福島市の現在のレベル",
    },
    {
      emoji: "🍚", title: "食品は安全",
      text: "日本の食品放射能基準（100 Bq/kg）は米国の12倍厳しい。2024年度、9,027件の検査で基準超過はわずか3件。49カ国が輸入規制を解除。",
      stat: "100 Bq/kg", statLabel: "日本の厳しい食品基準",
    },
    {
      emoji: "🌊", title: "ALPS処理水",
      text: "ALPSで62種類の放射性物質を除去。残るトリチウムは243 Bq/Lに希釈 — WHO飲料水基準の43分の1以下。",
      stat: "1/40", statLabel: "規制安全基準の",
    },
    {
      emoji: "🏘️", title: "人々が戻っている",
      text: "避難者は160,000人から23,410人に減少。インフラは99%復旧。2024年度の観光客数は過去最高を記録。",
      stat: "99%", statLabel: "インフラ復旧率",
    },
  ],
};

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showLearn, setShowLearn] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [submittingConversation, setSubmittingConversation] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const countdownRef = useRef(null);

  const t = UI_TEXT[language];
  const dir = LANGUAGES[language].dir;
  useEffect(() => {
  const id = getSessionId();
  setSessionId(id);

  const savedMessages = loadConversation();
  const savedLanguage = loadLanguage();

  if (savedLanguage) {
    setLanguage(savedLanguage);
  }

  if (savedMessages.length > 0) {
    setMessages(savedMessages);
  }
}, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, countdown]);

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(countdownRef.current);
    }
  }, [countdown]);

  useEffect(() => {
  saveConversation(messages);
}, [messages]);


useEffect(() => {
  saveLanguage(language);
}, [language]);



  async function callAPI(msgs, lang) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs, language: lang }),
    });
    const data = await res.json();
    if (res.status === 429 && data.retryAfter) {
      const waitSec = Math.min(data.retryAfter + 2, 30);
      setCountdown(waitSec);
      await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
      setCountdown(0);
      const res2 = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, language: lang }),
      });
      return await res2.json();
    }
    return data;
  }

  async function startQuiz() {
    setShowChat(true);

    if (messages.length > 0) {
      return;
    }

    setLoading(true);

    try {
      const data = await callAPI(
        [
          {
            role: "user",
            content: "Start the quiz! Give me the first question.",
          },
        ],
        language
      );

      if (data.error) {
        setMessages([
          {
            role: "assistant",
            content: "Error: " + data.error,
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            content: data.response,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const data = await callAPI(newMessages, language);
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: "Error: " + data.error }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Connection error: " + err.message }]);
    }
    setLoading(false);
    setCountdown(0);
  }

  function goBack() {
    setShowChat(false);
  }

  async function submitConversation() {

    if (messages.length === 0) return;

    try {

      setSubmittingConversation(true);

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          language,
          conversation: messages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unknown error");
      }

      setShowConsent(false);

      console.log(data);

      alert("Thank you! Your conversation has been submitted.");

    } catch (err) {

      alert(err.message);

    } finally {

      setSubmittingConversation(false);

    }

  }

  async function handleNewConversation() {
    const id = createNewSession();

    setSessionId(id);

    setMessages([]);
    saveConversation([]);

    setShowChat(true);

    setLoading(true);

    try {
      const data = await callAPI(
        [
          {
            role: "user",
            content: "Start the quiz! Give me the first question.",
          },
        ],
        language
      );

      if (data.error) {
        setMessages([
          {
            role: "assistant",
            content: "Error: " + data.error,
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            content: data.response,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  const facts = FACT_SHEETS[language] || FACT_SHEETS.en;

  return (
    <>
      <Head>
        <title>Daiichi — Fukushima Myth-Buster</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Quiz-based AI chatbot that busts Fukushima myths." />
      </Head>

      <div style={{ ...styles.container, direction: dir }}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>🌿</div>
            <div>
              <h1 style={styles.headerTitle}>{t.title}</h1>
              <p style={styles.headerSub}>{t.subtitle}</p>
              {/* delete later */}
              <p style={{ fontSize: 10, opacity: 0.6 }}>
                Session: {sessionId}
              </p>
            </div>
          </div>
          <div style={styles.langBar}>
            {Object.entries(LANGUAGES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => {
                    setLanguage(key);
                    setMessages([]);

                    saveConversation([]);
                }}
                style={{ ...styles.langBtn, ...(language === key ? styles.langBtnActive : {}) }}
              >
                {val.flag} {val.label}
              </button>
            ))}
          </div>
        </header>

        {!showChat ? (
          <main style={styles.topicScreen}>
            <div style={styles.heroSection}>
              <div style={styles.heroEmoji}>🌿</div>
              <h2 style={styles.heroTitle}>
                {t.title}
              </h2>
              <p style={styles.heroDesc}>
                {language === "en" &&
                  "Choose one of the options below."}

                {language === "ja" &&
                  "下のメニューから選択してください。"}

                {language === "ar" &&
                  "اختر أحد الخيارات التالية."}
              </p>
            </div>
            <div style={styles.topicGrid}>
              {/* Quiz */}
              <button
                style={styles.topicCard}
                onClick={startQuiz}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(26,58,42,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 12px rgba(26,58,42,0.08)";
                }}
              >
                <span style={styles.topicEmoji}>🧠</span>
                <span style={styles.topicLabel}>
                  {language === "en" && "Start Chat"}
                  {language === "ja" && "チャットを始める"}
                  {language === "ar" && "ابدأ الدردشة"}
                </span>
              </button>

              {/* Learn */}
              <button
                style={styles.topicCard}
                onClick={() => setShowLearn(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(26,58,42,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 12px rgba(26,58,42,0.08)";
                }}
              >
                <span style={styles.topicEmoji}>📚</span>
                <span style={styles.topicLabel}>
                  {language === "en" && "Learn About Fukushima"}
                  {language === "ja" && "福島について学ぶ"}
                  {language === "ar" && "تعرف على فوكوشيما"}
                </span>
              </button>

              {/* TBD */}
              <button
                style={{
                  ...styles.topicCard,
                  opacity: 0.6,
                  cursor: "default",
                }}
              >
                <span style={styles.topicEmoji}>🚧</span>
                <span style={styles.topicLabel}>
                  TBD
                </span>

              </button>
              {/* TBD */}
              <button
                style={{
                  ...styles.topicCard,
                  opacity: 0.6,
                  cursor: "default",
                }}
              >
                <span style={styles.topicEmoji}>🚧</span>
                <span style={styles.topicLabel}>
                  TBD
                </span>
              </button>
            </div>

            <footer style={styles.footer}>
              <p>
                {t.powered} &middot; {t.by}
              </p>
            </footer>

          </main>
        ) : (
          <div style={styles.chatScreen}>
            <div style={styles.topicBar}>
              <button
              onClick={goBack}
              style={styles.backBtn}
              >
                ← Menu
              </button>
              <button
              onClick={handleNewConversation}
              style={styles.backBtn}
              >
                ↻ New Conversation
              </button>
              <span style={styles.topicBarLabel}>
                  🌿 Daiichi
              </span>
          </div>
            <div style={styles.chatMessages}>
              {messages.map((msg, i) => (
                <div key={i} style={{ ...styles.msgRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "assistant" && <div style={styles.botAvatar}>🌿</div>}
                  <div style={{ ...styles.bubble, ...(msg.role === "user" ? styles.userBubble : styles.botBubble) }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
                  <div style={styles.botAvatar}>🌿</div>
                  <div style={{ ...styles.bubble, ...styles.botBubble, ...styles.loadingBubble }}>
                    {countdown > 0 ? (
                      <span style={styles.countdownText}>
                        {language === "ar" ? `⏳ ~${countdown}s جاري الانتظار...` :
                         language === "ja" ? `⏳ ~${countdown}秒 お待ちください...` :
                         `⏳ ~${countdown}s please wait...`}
                      </span>
                    ) : (
                      <><span style={styles.dot} /><span style={styles.dot} /><span style={styles.dot} /></>
                    )}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} style={styles.inputBar}>
              <input
                ref={inputRef} type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.typeMessage}
                style={{ ...styles.input, direction: dir }}
                disabled={loading}
              />
              <button type="submit" style={styles.sendBtn} disabled={loading || !input.trim()}>
                {t.send}
              </button>
            </form>
            <div style={styles.shareContainer}>
              <ShareConversation
                language={language}
                disabled={
                  messages.length === 0 ||
                  submittingConversation
                }
                onClick={() => setShowConsent(true)}
              />
            </div>
          </div>
        )}

        {/* Learn Modal */}
        {showLearn && (
          <div style={styles.modalOverlay} onClick={() => setShowLearn(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{t.learnTitle}</h2>
                <button onClick={() => setShowLearn(false)} style={styles.modalClose}>✕</button>
              </div>
              <div style={styles.modalBody}>
                {facts.map((fact, i) => (
                  <div key={i} style={styles.factCard}>
                    <div style={styles.factTop}>
                      <span style={styles.factEmoji}>{fact.emoji}</span>
                      <h3 style={styles.factTitle}>{fact.title}</h3>
                    </div>
                    <p style={styles.factText}>{fact.text}</p>
                    <div style={styles.factStat}>
                      <span style={styles.factStatNum}>{fact.stat}</span>
                      <span style={styles.factStatLabel}>{fact.statLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <ConsentModal
          open={showConsent}
          language={language}
          onClose={() => setShowConsent(false)}
          onSubmit={submitConversation}
        />
      </div>

      <style jsx global>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

const styles = {
  container: { height: "100vh", display: "flex", flexDirection: "column", maxWidth: 900, margin: "0 auto", background: "#f0f7f2" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "linear-gradient(135deg, #1a3a2a, #2d6a4f)", color: "#fff", flexWrap: "wrap", gap: 8 },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logo: { fontSize: 32, lineHeight: 1 },
  headerTitle: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" },
  headerSub: { fontSize: 12, opacity: 0.85, marginTop: 2 },
  langBar: { display: "flex", gap: 4 },
  langBtn: { padding: "6px 12px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, background: "transparent", color: "#fff", cursor: "pointer", fontSize: 13, transition: "all 0.2s" },
  langBtnActive: { background: "rgba(255,255,255,0.2)", borderColor: "#fff", fontWeight: 600 },
  topicScreen: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 32, overflowY: "auto" },
  heroSection: { textAlign: "center" },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: 700, color: "#1a3a2a", marginBottom: 8 },
  heroDesc: { fontSize: 15, color: "#3a5a48", maxWidth: 440, lineHeight: 1.5 },
  topicGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, width: "100%", maxWidth: 520 },
  topicCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "28px 16px", background: "#fff", border: "2px solid #d8f3dc", borderRadius: 16, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 12px rgba(26,58,42,0.08)" },
  topicEmoji: { fontSize: 36 },
  topicLabel: { fontSize: 15, fontWeight: 600, color: "#1a3a2a", textAlign: "center" },
  footer: { fontSize: 12, color: "#6b8f7a", textAlign: "center" },
  chatScreen: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topicBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "#d8f3dc", borderBottom: "1px solid #b7e4c7" },
  backBtn: { background: "none", border: "none", color: "#2d6a4f", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  topicBarLabel: { fontSize: 14, fontWeight: 600, color: "#1a3a2a" },
  chatMessages: { flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  botAvatar: { width: 32, height: 32, borderRadius: "50%", background: "#2d6a4f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  bubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: 18, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  userBubble: { background: "#2d6a4f", color: "#fff", borderBottomRightRadius: 4 },
  botBubble: { background: "#fff", color: "#1b2e24", border: "1px solid #d8f3dc", borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(26,58,42,0.06)" },
  loadingBubble: { display: "flex", gap: 5, padding: "14px 20px", alignItems: "center" },
  countdownText: { fontSize: 13, color: "#2d6a4f", fontWeight: 500 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#74c69d", display: "inline-block", animation: "blink 1.4s infinite both" },
  inputBar: { display: "flex", gap: 8, padding: "12px 16px", background: "#fff", borderTop: "1px solid #d8f3dc" },
  input: { flex: 1, padding: "12px 16px", border: "2px solid #d8f3dc", borderRadius: 24, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" },
  sendBtn: { padding: "10px 24px", background: "#2d6a4f", color: "#fff", border: "none", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", fontFamily: "inherit" },
  // Learn FAB
  learnFab: { position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: "#2d6a4f", border: "none", fontSize: 28, cursor: "pointer", boxShadow: "0 4px 16px rgba(26,58,42,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, transition: "transform 0.2s" },
  // Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#f0f7f2", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, #1a3a2a, #2d6a4f)", color: "#fff" },
  modalTitle: { fontSize: 20, fontWeight: 700 },
  modalClose: { background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: 4 },
  modalBody: { overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 },
  factCard: { background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #d8f3dc", boxShadow: "0 2px 8px rgba(26,58,42,0.06)" },
  factTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  factEmoji: { fontSize: 28 },
  factTitle: { fontSize: 16, fontWeight: 700, color: "#1a3a2a" },
  factText: { fontSize: 14, lineHeight: 1.6, color: "#3a5a48", marginBottom: 12 },
  factStat: { display: "flex", alignItems: "baseline", gap: 8, padding: "10px 14px", background: "#d8f3dc", borderRadius: 10 },
  factStatNum: { fontSize: 22, fontWeight: 800, color: "#1a3a2a" },
  factStatLabel: { fontSize: 13, color: "#3a5a48" },
  shareContainer: { padding: "0 16px 12px",  background: "#fff", },
};
