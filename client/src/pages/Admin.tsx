import { Button } from "@/components/ui/button";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { defaultSiteContent, type SiteContent } from "@shared/cms";
import { Link } from "wouter";
import { getLoginConfigIssue } from "@/const";
import { signInWithGoogle, logout, onAuthStateChanged, firebaseInitError, type User } from "@/lib/firebase";

type ContactSubmission = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  createdAt: string;
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState("");
  const [activeToken, setActiveToken] = useState("");
  const [cms, setCms] = useState<SiteContent>(defaultSiteContent);
  const [rawCms, setRawCms] = useState(
    JSON.stringify(defaultSiteContent, null, 2)
  );
  const [cmsStatus, setCmsStatus] = useState("CMS ready");
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [submissionsStatus, setSubmissionsStatus] = useState(
    "No submissions loaded yet"
  );
  const [rawArticles, setRawArticles] = useState(
    JSON.stringify(defaultSiteContent.articles, null, 2)
  );
  const [articlesStatus, setArticlesStatus] = useState("Articles ready");
  const [loginError, setLoginError] = useState<string | null>(null);
  const loginConfigIssue = getLoginConfigIssue() ?? firebaseInitError;

  const headers = useMemo<Record<string, string>>(() => {
    const nextHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (activeToken) nextHeaders["X-Admin-Token"] = activeToken;
    return nextHeaders;
  }, [activeToken]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoginError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      const authError = error as { code?: string };
      if (authError.code === "auth/unauthorized-domain") {
        setLoginError(
          "This domain is not authorized for Firebase Google sign-in. Add your site URL under Firebase Authentication → Settings → Authorized domains."
        );
        return;
      }
      setLoginError("Google sign-in failed. Check Firebase auth settings and try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const loadCms = async () => {
    try {
      const response = await fetch("/api/cms");
      if (!response.ok) throw new Error("Failed to load CMS");
      const payload = (await response.json()) as SiteContent;
      setCms(payload);
      setRawCms(JSON.stringify(payload, null, 2));
      setRawArticles(JSON.stringify(payload.articles, null, 2));
      setCmsStatus("CMS loaded");
    } catch {
      setCmsStatus("Using default CMS content");
    }
  };

  const loadSubmissions = async () => {
    setSubmissionsStatus("Loading contact submissions...");

    try {
      const response = await fetch("/api/contact", {
        headers: activeToken ? { "X-Admin-Token": activeToken } : undefined,
      });

      if (response.status === 401) {
        setSubmissionsStatus(
          "Unauthorized. Enter your admin token and click Set token."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load submissions");
      }

      const payload = (await response.json()) as ContactSubmission[];
      setSubmissions(payload);
      setSubmissionsStatus(
        payload.length
          ? `Loaded ${payload.length} submission(s)`
          : "No submissions yet"
      );
    } catch {
      setSubmissionsStatus("Could not load submissions");
    }
  };

  useEffect(() => {
    if (!user) return;
    void loadCms();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void loadSubmissions();
  }, [activeToken, user]);

  const saveCms = async () => {
    try {
      const parsed = JSON.parse(rawCms) as SiteContent;
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers,
        body: JSON.stringify(parsed),
      });
      if (!response.ok) throw new Error("Failed to save CMS");
      setCms(parsed);
      setCmsStatus("CMS saved");
    } catch {
      setCmsStatus("Invalid JSON or save failed");
    }
  };

  const setToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveToken(tokenInput.trim());
    setSubmissionsStatus(
      tokenInput.trim()
        ? "Token set. Reloading..."
        : "Token cleared. Reloading..."
    );
  };

  const saveArticles = async () => {
    try {
      const parsed = JSON.parse(rawArticles) as SiteContent["articles"];
      if (!Array.isArray(parsed)) {
        throw new Error("Articles must be an array");
      }

      const response = await fetch("/api/cms", {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...cms, articles: parsed }),
      });
      if (!response.ok) throw new Error("Failed to save articles");

      const nextCms = { ...cms, articles: parsed };
      setCms(nextCms);
      setRawCms(JSON.stringify(nextCms, null, 2));
      setArticlesStatus("Articles saved");
    } catch {
      setArticlesStatus("Invalid JSON or save failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                CAFOLA
              </p>
              <h1 className="text-2xl font-serif">Admin Sign-in Required</h1>
            </div>
            <Link href="/" className="text-teal no-underline hover:underline">
              Return to site
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-10">
          <section className="max-w-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h2 className="text-xl font-serif">Continue with Gmail</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              You must sign in with Gmail before you can access the admin
              console.
            </p>
            <div className="flex flex-wrap gap-3">
              {!loginConfigIssue ? (
                <Button onClick={handleLogin} className="bg-orange hover:bg-orange/90">
                  Sign in with Gmail
                </Button>
              ) : (
                <div className="space-y-4 w-full">
                  <Button
                    type="button"
                    disabled
                    className="bg-slate-700 text-slate-300 cursor-not-allowed"
                  >
                    Sign in unavailable
                  </Button>
                  <div className="text-xs text-red-200 p-4 bg-red-900/20 border border-red-900/50">
                    <p className="font-bold mb-2">Configuration Issue:</p>
                    <p>{loginConfigIssue}</p>
                    <p className="mt-2">Please ensure the following environment variables are set in Vercel:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><code>VITE_FIREBASE_API_KEY</code></li>
                      <li><code>VITE_FIREBASE_PROJECT_ID</code></li>
                      <li><code>VITE_FIREBASE_APP_ID</code></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            {loginError ? (
              <p className="text-xs text-red-200 p-3 bg-red-900/20 border border-red-900/50">
                {loginError}
              </p>
            ) : null}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              CAFOLA
            </p>
            <h1 className="text-2xl font-serif">Admin Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden md:inline">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-white border-slate-700">
              Sign out
            </Button>
            <Link href="/" className="text-teal no-underline hover:underline">
              Return to site
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
          <h2 className="text-xl font-serif">Admin token</h2>
          <form className="flex flex-col md:flex-row gap-3" onSubmit={setToken}>
            <input
              type="password"
              value={tokenInput}
              onChange={event => setTokenInput(event.target.value)}
              placeholder="Optional ADMIN_TOKEN"
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700"
            />
            <Button type="submit" className="bg-orange hover:bg-orange/90">
              Set token
            </Button>
          </form>
          <p className="text-sm text-slate-400">
            If ADMIN_TOKEN is configured on the server, enter it here.
          </p>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <h2 className="text-xl font-serif">Articles CMS section</h2>
            <p className="text-sm text-slate-400">Status: {articlesStatus}</p>
          </div>
          <p className="text-sm text-slate-400">
            Manage only the articles array used by the public Articles page.
          </p>
          <textarea
            value={rawArticles}
            onChange={event => setRawArticles(event.target.value)}
            className="w-full min-h-[260px] p-4 bg-slate-950 border border-slate-700 font-mono text-sm"
          />
          <div className="flex gap-3">
            <Button onClick={saveArticles} className="bg-orange hover:bg-orange/90">
              Save Articles
            </Button>
            <Button
              variant="outline"
              className="text-white"
              onClick={() => setRawArticles(JSON.stringify(cms.articles, null, 2))}
            >
              Reset articles editor
            </Button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <h2 className="text-xl font-serif">CMS editor</h2>
            <p className="text-sm text-slate-400">Status: {cmsStatus}</p>
          </div>
          <textarea
            value={rawCms}
            onChange={event => setRawCms(event.target.value)}
            className="w-full min-h-[420px] p-4 bg-slate-950 border border-slate-700 font-mono text-sm"
          />
          <div className="flex gap-3">
            <Button onClick={saveCms} className="bg-orange hover:bg-orange/90">
              Save CMS Content
            </Button>
            <Button
              variant="outline"
              className="text-white"
              onClick={() => setRawCms(JSON.stringify(cms, null, 2))}
            >
              Reset editor
            </Button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <h2 className="text-xl font-serif">Contact form submissions</h2>
            <Button
              variant="outline"
              className="text-white"
              onClick={() => void loadSubmissions()}
            >
              Refresh submissions
            </Button>
          </div>
          <p className="text-sm text-slate-400">{submissionsStatus}</p>

          <div className="overflow-x-auto border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/80 text-left">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-400" colSpan={6}>
                      No rows
                    </td>
                  </tr>
                ) : (
                  submissions.map(entry => (
                    <tr
                      key={`${entry.createdAt}-${entry.email}`}
                      className="border-t border-slate-800 align-top"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        {`${entry.firstName} ${entry.lastName}`.trim()}
                      </td>
                      <td className="px-3 py-2">{entry.email}</td>
                      <td className="px-3 py-2">{entry.phone || "-"}</td>
                      <td className="px-3 py-2">{entry.source}</td>
                      <td className="px-3 py-2 max-w-sm">
                        {entry.message || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
