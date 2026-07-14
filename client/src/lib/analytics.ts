import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Lightweight first-party analytics written to Firestore.
 * Every event lands in the `analytics_events` collection and powers the
 * /admin dashboard. Tracking must NEVER throw into the UI — all writes are
 * best-effort and fail silently.
 */

const SESSION_KEY = "mp_session_id";

/** Stable per-browser id so we can count unique visitors. */
function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

export type AnalyticsEventType = "pageview" | "click" | "submission";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  label: string;
  path: string;
  referrer: string;
  sessionId: string;
  userAgent: string;
  createdAt: Timestamp | null;
}

async function track(type: AnalyticsEventType, label = ""): Promise<void> {
  try {
    await addDoc(collection(db, "analytics_events"), {
      type,
      label,
      path: `${window.location.pathname}${window.location.hash}`,
      referrer: document.referrer || "direct",
      sessionId: getSessionId(),
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Analytics is non-critical — never surface to the visitor.
    console.debug("[analytics] track failed", err);
  }
}

let pageviewSent = false;

/** Fire once per page load. */
export function trackPageview(): void {
  if (pageviewSent) return;
  pageviewSent = true;
  void track("pageview");
}

/** Fire on meaningful interactions (CTAs, enquire buttons, outbound links). */
export function trackClick(label: string): void {
  void track("click", label);
}

/** Fire when a contact submission succeeds. */
export function trackSubmission(label = ""): void {
  void track("submission", label);
}

/** Read all events for the admin dashboard (newest first). */
export async function fetchAnalyticsEvents(max = 5000): Promise<AnalyticsEvent[]> {
  const snap = await getDocs(
    query(collection(db, "analytics_events"), orderBy("createdAt", "desc"), limit(max)),
  );
  return snap.docs.map((d) => d.data() as AnalyticsEvent);
}
