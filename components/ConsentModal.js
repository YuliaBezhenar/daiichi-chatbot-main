import React, { useState } from "react";

export default function ConsentModal({
  open,
  onClose,
  onSubmit,
  language = "en",
}) {
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  const TEXT = {
    en: {
      title: "Research Consent",
      description:
        "If you agree, your anonymous conversation will be shared with the researchers and analyzed for educational research purposes.",
      checkbox:
        "I agree to anonymously share my conversation for research purposes.",
      submit: "Submit Conversation",
      cancel: "Cancel",
    },
    ja: {
      title: "研究への同意",
      description:
        "同意すると、匿名化された会話が教育研究のため研究者へ送信されます。",
      checkbox:
        "研究目的で匿名の会話を共有することに同意します。",
      submit: "送信",
      cancel: "キャンセル",
    },
    ar: {
      title: "الموافقة على البحث",
      description:
        "إذا وافقت، فسيتم إرسال المحادثة بشكل مجهول للباحثين لأغراض البحث العلمي.",
      checkbox:
        "أوافق على مشاركة محادثتي بشكل مجهول لأغراض البحث.",
      submit: "إرسال",
      cancel: "إلغاء",
    },
  };

  const t = TEXT[language] || TEXT.en;

  async function handleSubmit() {
    if (!checked) return;
    await onSubmit();
    setChecked(false);
  }

  function handleClose() {
    setChecked(false);
    onClose();
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <h2 style={styles.title}>{t.title}</h2>

        <p style={styles.description}>
          {t.description}
        </p>

        <label style={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />

          <span>{t.checkbox}</span>
        </label>

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

  checkboxContainer: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 24,
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