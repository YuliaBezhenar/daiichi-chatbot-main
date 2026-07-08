import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "daiichi_session_id";

/**
 * Returns existing session id or creates a new one.
 */
export function getSessionId() {
  if (typeof window === "undefined") return null;

  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Deletes current session id.
 * (Probably won't be used, but useful for debugging.)
 */
export function clearSessionId() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEY);
}