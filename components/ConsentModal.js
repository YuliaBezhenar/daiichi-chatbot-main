import React, { useState } from "react";

export default function ConsentModal({
  open,
  onClose,
  onSubmit,
  language = "en",
}) {
  const [consent, setConsent] = useState(null);

  if (!open) return null;

  const TEXT = {
    en: {
      title: "Research Consent",
      description:
        "Your anonymous conversation will be used and analyzed by the IER team for educational research purposes.",
      radial_true:
        "Yes, I give my consent.",
      radial_false:
        "No, I do not give my consent.",
      submit: "Submit Conversation",
      cancel: "Cancel",
    },
    ja: {
      title: "研究への同意",
      description:
        "お客様の匿名化された会話は、教育研究を目的としてIERチームによって使用・分析されます。",
      radial_true:
        "はい、同意します。",
      radial_false:
        "いいえ、同意しません。",
      submit: "送信",
      cancel: "キャンセル",
    },
    ar: {
      title: "الموافقة على البحث",
      description:
        "سيتم استخدام محادثتك المجهولة وتحليلها من قِبَل فريق IER لأغراض البحث التربوي.",
      radial_true:
        "أوافق على مشاركة محادثتي بشكل مجهول لأغراض البحث.",
      radial_false:
        "لا أوافق على مشاركة محادثتي بشكل مجهول لأغراض البحث.",
      submit: "إرسال",
      cancel: "إلغاء",
    },
  };

  const t = TEXT[language] || TEXT.en;

  async function handleSubmit() {
    if (consent === null) return;
    await onSubmit(consent);
    setConsent(null);
  }
 
  function handleClose() {
    setConsent(null);
    onClose();
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <h2 style={styles.title}>{t.title}</h2>

        <p style={styles.description}>
          {t.description}
        </p>

        <div style={styles.optionsContainer}>
          <label
            style={{
              ...styles.optionRow,
              ...(consent === true ? styles.optionRowSelected : {}),
            }}
          >
            <input
              type="radio"
              name="consent"
              checked={consent === true}
              onChange={() => setConsent(true)}
              style={styles.radio}
            />
            <span>{t.radial_true}</span>
          </label>
 
          <label
            style={{
              ...styles.optionRow,
              ...(consent === false ? styles.optionRowSelected : {}),
            }}
          >
            <input
              type="radio"
              name="consent"
              checked={consent === false}
              onChange={() => setConsent(false)}
              style={styles.radio}
            />
            <span>{t.radial_false}</span>
          </label>
        </div>

        <div style={styles.buttons}>

          <button
            onClick={handleClose}
            style={styles.cancel}
          >
            {t.cancel}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!checked}
            style={{
              ...styles.submit,
              opacity: checked ? 1 : 0.5,
              cursor: checked ? "pointer" : "not-allowed",
            }}
          >
            {t.submit}
          </button>

        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
 
  modal: {
    background: "#fff",
    width: "90%",
    maxWidth: 500,
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,.2)",
  },
 
  title: {
    marginBottom: 16,
  },
 
  description: {
    marginBottom: 20,
    lineHeight: 1.6,
  },
 
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 24,
  },
 
  optionRow: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ccc",
    cursor: "pointer",
    transition: "all 0.15s",
  },
 
  optionRowSelected: {
    background: "#e8f5ee",
    borderColor: "#2d6a4f",
  },
 
  radio: {
    marginTop: 3,
    accentColor: "#2d6a4f",
    flexShrink: 0,
  },
 
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
 
  cancel: {
    padding: "10px 18px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    borderRadius: 8,
  },
 
  submit: {
    padding: "10px 18px",
    border: "none",
    background: "#2d6a4f",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 8,
  },
};