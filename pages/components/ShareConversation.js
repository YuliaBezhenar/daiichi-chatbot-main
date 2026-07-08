import React from "react";

export default function ShareConversation({
  onClick,
  disabled = false,
  language = "en",
}) {
  const TEXT = {
    en: "📤 Share Conversation",
    ja: "📤 会話を共有",
    ar: "📤 مشاركة المحادثة",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.button,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {TEXT[language] || TEXT.en}
    </button>
  );
}

const styles = {
  button: {
    width: "100%",
    marginTop: 12,
    padding: "12px",
    border: "none",
    borderRadius: 10,
    background: "#2d6a4f",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    transition: "0.2s",
  },
};