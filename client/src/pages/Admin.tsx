import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User,
} from "firebase/auth";
import {
  Activity, ArrowLeft, BarChart3, Eye, Lock, LogOut, MousePointerClick,
  RefreshCw, Send, ShieldAlert, TrendingUp, Users,
} from "lucide-react";
import {
  fetchAnalyticsEvents, type AnalyticsEvent,
} from "@/lib/analytics";
import { auth, fetchSubmissions, fetchUserRole, type StoredSubmission } from "@/lib/firebase";

/* ── Helpers ────────────────────────────────────────────────────────────── */
function toDate(ts: { toDate?: () => Date } | null | undefined): Date | null {
  if (ts && typeof ts.toDate === "function") return ts.toDate();
  return null;
}
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function shortRef(ref: string): string {
  if (!ref || ref === "direct") return "Direct / typed";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
}

/* ── Login gate (Google sign-in) ────────────────────────────────────────── */
function Gate() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      // onAuthStateChanged in the parent flips to the dashboard.
    } catch (err) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError(null); // user dismissed — no need to alarm
      } else if (code === "auth/operation-not-allowed" || code === "auth/configuration-not-found") {
        setError("Google sign-in isn't enabled in Firebase yet.");
      } else if (code === "auth/unauthorized-domain") {
        setError("This domain isn't authorized for sign-in in Firebase Auth settings.");
      } else {
        setError("Couldn't sign in. Please try again.");
      }
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="card-surface w-full max-w-sm p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-1">Admin Access</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in with your admin Google account to view your site analytics.
        </p>
        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
        <button
          onClick={() => void signIn()}
          disabled={busy}
          className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {busy ? "Opening…" : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M21.35 11.1H12v2.99h5.36c-.23 1.48-1.64 4.33-5.36 4.33-3.22 0-5.85-2.67-5.85-5.96S8.78 6.5 12 6.5c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.74 3.9 14.6 3 12 3 6.98 3 2.9 7.08 2.9 12s4.08 9 9.1 9c5.26 0 8.74-3.7 8.74-8.9 0-.6-.07-1.05-.16-1.5z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
      </div>
    </div>
  );
}

/* ── Access-denied screen (signed in, but not an admin) ─────────────────── */
function Denied({ email }: { email: string | null }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="card-surface w-full max-w-sm p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 mb-5">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-1">Not authorized</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {email ? <><span className="text-foreground">{email}</span> isn't an admin account.</> : "This account isn't an admin."}
        </p>
        <button
          onClick={() => void signOut(auth)}
          className="w-full h-10 rounded-md border border-border text-sm font-semibold hover:border-primary/40 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────────────────────────── */
function Stat({ icon: Icon, label, value, sub }: {
  icon: typeof Eye; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

/* ── Horizontal bar list ────────────────────────────────────────────────── */
function BarList({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="text-sm text-foreground w-40 shrink-0 truncate" title={r.label}>{r.label}</span>
          <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary/70" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-muted-foreground w-8 text-right shrink-0">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main dashboard ─────────────────────────────────────────────────────── */
export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [role, setRole] = useState<"checking" | "admin" | "denied">("checking");
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [subs, setSubs] = useState<StoredSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ev, sb] = await Promise.all([fetchAnalyticsEvents(), fetchSubmissions()]);
      setEvents(ev);
      setSubs(sb);
    } catch (err) {
      console.error(err);
      setError("Couldn't load data. Check your Firestore security rules allow reads on 'analytics_events' and 'contact_submissions' for signed-in users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      setRole("checking");
    });
  }, []);

  // Verify the signed-in user carries an admin role, then load data.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetchUserRole(user.uid);
        if (cancelled) return;
        if (r === "admin") {
          setRole("admin");
          void load();
        } else {
          setRole("denied");
        }
      } catch (err) {
        // Reads blocked by rules, or no user doc — treat as not authorized.
        if (!cancelled) setRole("denied");
        console.error(err);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const metrics = useMemo(() => {
    const pageviews = events.filter((e) => e.type === "pageview");
    const clicks = events.filter((e) => e.type === "click");
    const uniqueVisitors = new Set(events.map((e) => e.sessionId)).size;
    const submissions = subs.length;

    // Visits per day (last 14 days)
    const days: { key: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count: 0 });
    }
    const dayMap = new Map(days.map((d) => [d.key, d]));
    for (const pv of pageviews) {
      const d = toDate(pv.createdAt);
      if (!d) continue;
      const row = dayMap.get(dayKey(d));
      if (row) row.count++;
    }

    // Top clicks
    const clickCounts = new Map<string, number>();
    for (const c of clicks) {
      const key = c.label || "(unlabeled)";
      clickCounts.set(key, (clickCounts.get(key) || 0) + 1);
    }
    const topClicks = Array.from(clickCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count).slice(0, 8);

    // Referrers
    const refCounts = new Map<string, number>();
    for (const pv of pageviews) {
      const key = shortRef(pv.referrer);
      refCounts.set(key, (refCounts.get(key) || 0) + 1);
    }
    const referrers = Array.from(refCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);

    const conversion = uniqueVisitors > 0 ? (submissions / uniqueVisitors) * 100 : 0;

    return {
      visits: pageviews.length, uniqueVisitors, clicks: clicks.length,
      submissions, days, topClicks, referrers, conversion,
    };
  }, [events, subs]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!user) return <Gate />;
  if (role === "checking") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Verifying access…</p>
      </div>
    );
  }
  if (role === "denied") return <Denied email={user.email} />;

  const maxDay = Math.max(1, ...metrics.days.map((d) => d.count));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="font-display font-bold text-lg">Analytics <span className="gradient-text">Dashboard</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary/40 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary/40 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Site
            </Link>
            <button
              onClick={() => void signOut(auth)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary/40 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {error && (
          <div className="card-surface p-5 border-red-500/40">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {loading && !error && (
          <p className="text-sm text-muted-foreground">Loading analytics…</p>
        )}

        {!loading && !error && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Stat icon={Eye} label="Page Views" value={metrics.visits} />
              <Stat icon={Users} label="Unique Visitors" value={metrics.uniqueVisitors} />
              <Stat icon={MousePointerClick} label="Clicks" value={metrics.clicks} />
              <Stat icon={Send} label="Submissions" value={metrics.submissions} />
              <Stat icon={TrendingUp} label="Conversion" value={`${metrics.conversion.toFixed(1)}%`} sub="subs / unique visitor" />
            </div>

            {/* Visits over time */}
            <div className="card-surface p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="font-display font-semibold">Page views · last 14 days</h2>
              </div>
              <div className="flex items-end gap-2 h-40">
                {metrics.days.map((d) => (
                  <div key={d.key} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t bg-primary/70 group-hover:bg-primary transition-all min-h-[2px] relative"
                        style={{ height: `${(d.count / maxDay) * 100}%` }}
                        title={`${d.count} views`}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[0.6rem] font-mono text-muted-foreground opacity-0 group-hover:opacity-100">{d.count}</span>
                      </div>
                    </div>
                    <span className="text-[0.55rem] text-muted-foreground whitespace-nowrap">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clicks + referrers */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card-surface p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MousePointerClick className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-semibold">Top clicked</h2>
                </div>
                <BarList rows={metrics.topClicks} />
              </div>
              <div className="card-surface p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-semibold">Traffic sources</h2>
                </div>
                <BarList rows={metrics.referrers} />
              </div>
            </div>

            {/* Submissions */}
            <div className="card-surface p-6">
              <div className="flex items-center gap-2 mb-5">
                <Send className="h-4 w-4 text-primary" />
                <h2 className="font-display font-semibold">Contact submissions ({subs.length})</h2>
              </div>
              {subs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                        <th className="py-2 pr-4 font-medium">Date</th>
                        <th className="py-2 pr-4 font-medium">Name</th>
                        <th className="py-2 pr-4 font-medium">Email</th>
                        <th className="py-2 pr-4 font-medium">Service</th>
                        <th className="py-2 font-medium">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s) => (
                        <tr key={s.id} className="border-b border-border/50 align-top">
                          <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{fmtDate(toDate(s.createdAt))}</td>
                          <td className="py-3 pr-4 font-medium whitespace-nowrap">{s.name}</td>
                          <td className="py-3 pr-4">
                            <a href={`mailto:${s.email}`} className="text-primary hover:underline">{s.email}</a>
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">{s.service || "—"}</td>
                          <td className="py-3 max-w-md">
                            {s.subject && <span className="block font-medium text-foreground">{s.subject}</span>}
                            <span className="text-muted-foreground">{s.message}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
