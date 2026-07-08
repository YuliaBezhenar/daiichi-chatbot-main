// lib/storage.js

const CONVERSATION_KEY = "daiichi_conversation";
const TOPIC_KEY = "daiichi_topic";
const LANGUAGE_KEY = "daiichi_language";

/**
 * Save current conversation.
 */
export function saveConversation(messages) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    CONVERSATION_KEY,
    JSON.stringify(messages)
  );
}

/**
 * Load conversation.
 */
export function loadConversation() {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(CONVERSATION_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Remove conversation.
 */
export function clearConversation() {
  if (typeof window ==="undefined") return;

  localStorage.removeItem(CONVERSATION_KEY);
}

/**
 * Save selected topic.
 */
export function saveTopic(topic) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOPIC_KEY, topic);
}

/**
 * Load selected topic.
 */
export function loadTopic() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOPIC_KEY);
}

/**
 * Clear selected topic.
 */
export function clearTopic() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOPIC_KEY);
}

/**
 * Save selected language.
 */
export function saveLanguage(language) {
  if (typeof window === "undefined") return;

  localStorage.setItem(LANGUAGE_KEY, language);
}

/**
 * Load selected language.
 */
export function loadLanguage() {
  if (typeof window === "undefined") return "en";

  return localStorage.getItem(LANGUAGE_KEY) || "en";
}

/**
 * Clear everything.
 */
export function clearAllChatData() {
  clearConversation();
  clearTopic();

  if (typeof window !== "undefined") {
    localStorage.removeItem(LANGUAGE_KEY);
  }
}