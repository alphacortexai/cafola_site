import { Button } from "@/components/ui/button";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultSiteContent, type SiteContent } from "@shared/cms";
import { Link } from "wouter";
import { getLoginConfigIssue } from "@/const";
import {
  signInWithGoogle,
  logout,
  onAuthStateChanged,
  firebaseInitError,
  uploadArticleImage,
  type User,
} from "@/lib/firebase";
import type { Article, Testimonial } from "@shared/cms";

type ContactSubmission = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  createdAt: string;
};

function CmsPreview({ cms }: { cms: SiteContent }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950 p-5">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Preview
          </p>
          <h3 className="text-2xl font-serif text-white">{cms.brandName}</h3>
          <p className="text-slate-400">{cms.companyDescriptor}</p>
          <p className="text-slate-50 text-lg">{cms.heroSubheading}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Services</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {cms.services.slice(0, 4).map(service => (
              <div
                key={service.title}
                className="rounded border border-slate-800 bg-slate-900 p-4"
              >
                <div className="text-3xl mb-2">{service.icon}</div>
                <h5 className="font-semibold text-white">{service.title}</h5>
                <p className="text-slate-400 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">About</h4>
          <p className="text-slate-300">{cms.aboutUs.headline}</p>
          <p className="text-slate-400 text-sm">{cms.aboutUs.description}</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Articles</h4>
          <ul className="space-y-2">
            {cms.articles.slice(0, 3).map(article => (
              <li
                key={article.slug}
                className="rounded border border-slate-800 bg-slate-900 p-3"
              >
                <p className="font-semibold text-white">{article.title}</p>
                <p className="text-slate-400 text-sm">{article.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Footer</h4>
          <p className="text-slate-400 text-sm">
            {cms.footerAddress.join(" • ")}
          </p>
          <p className="text-slate-500 text-sm">
            {cms.footerLinks.join(" • ")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState("");
  const [activeToken, setActiveToken] = useState("");
  const [cms, setCms] = useState<SiteContent>(defaultSiteContent);
  const [draftCms, setDraftCms] = useState<SiteContent>(defaultSiteContent);
  const [previewError, setPreviewError] = useState<string | null>(null);
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
  const [articlesDraft, setArticlesDraft] = useState<SiteContent["articles"]>(
    defaultSiteContent.articles
  );
  const [articleForm, setArticleForm] = useState<Article>({
    slug: "",
    title: "",
    description: "",
    content: "",
    section: "",
    imageUrl: "",
    featured: false,
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [articlesStatus, setArticlesStatus] = useState("Articles ready");
  const [reviewsDraft, setReviewsDraft] = useState<SiteContent["testimonials"]>(
    defaultSiteContent.testimonials
  );
  const [reviewForm, setReviewForm] = useState<Testimonial>({
    quote: "",
    author: "",
    role: "",
    location: "",
  });
  const [editingReviewIndex, setEditingReviewIndex] = useState<number | null>(
    null
  );
  const [reviewsStatus, setReviewsStatus] = useState("Reviews ready");
  const [visibilityDraft, setVisibilityDraft] = useState<
    SiteContent["homeSectionVisibility"]
  >({
    ...defaultSiteContent.homeSectionVisibility,
  });
  const [visibilityStatus, setVisibilityStatus] = useState(
    "Homepage visibility ready"
  );
  const [aboutDraft, setAboutDraft] = useState<SiteContent["aboutUs"]>(
    defaultSiteContent.aboutUs
  );
  const [aboutStatus, setAboutStatus] = useState("About page ready");
  const [uploadingArticleImage, setUploadingArticleImage] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const loginConfigIssue = getLoginConfigIssue() ?? firebaseInitError;

  useEffect(() => {
    try {
      const parsed = JSON.parse(rawCms) as SiteContent;
      setDraftCms(parsed);
      setPreviewError(null);
    } catch {
      setPreviewError("Invalid JSON preview");
    }
  }, [rawCms]);

  const headers = useMemo<Record<string, string>>(() => {
    const nextHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (activeToken) nextHeaders["X-Admin-Token"] = activeToken;
    return nextHeaders;
  }, [activeToken]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(currentUser => {
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
      setLoginError(
        "Google sign-in failed. Check Firebase auth settings and try again."
      );
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
      setDraftCms(payload);
      setRawCms(JSON.stringify(payload, null, 2));
      setRawArticles(JSON.stringify(payload.articles, null, 2));
      setArticlesDraft(payload.articles);
      setAboutDraft(payload.aboutUs);
      setReviewsDraft(payload.testimonials);
      setVisibilityDraft({
        ...defaultSiteContent.homeSectionVisibility,
        ...(payload.homeSectionVisibility ?? {}),
      });
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
    let parsed: SiteContent;

    try {
      parsed = JSON.parse(rawCms) as SiteContent;
    } catch {
      setCmsStatus("Invalid JSON or save failed");
      setPreviewError("Invalid JSON preview");
      return;
    }

    try {
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers,
        body: JSON.stringify(parsed),
      });
      if (!response.ok) throw new Error("Failed to save CMS");
      setCms(parsed);
      setDraftCms(parsed);
      setPreviewError(null);
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
      const parsed = articlesDraft;

      const response = await fetch("/api/cms", {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...cms, articles: parsed }),
      });
      if (!response.ok) throw new Error("Failed to save articles");

      const nextCms = { ...cms, articles: parsed };
      setCms(nextCms);
      setRawCms(JSON.stringify(nextCms, null, 2));
      setRawArticles(JSON.stringify(parsed, null, 2));
      setArticlesStatus("Articles saved");
    } catch {
      setArticlesStatus("Invalid JSON or save failed");
    }
  };

  const updateAboutField = (
    field: keyof SiteContent["aboutUs"],
    value: string
  ) => {
    setAboutDraft(prev => ({ ...prev, [field]: value }));
  };

  const updateAboutLocations = (value: string) => {
    setAboutDraft(prev => ({
      ...prev,
      locations: value
        .split("\n")
        .map(location => location.trim())
        .filter(Boolean),
    }));
  };

  const saveAboutPage = async () => {
    try {
      const nextCms = { ...cms, aboutUs: aboutDraft };
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers,
        body: JSON.stringify(nextCms),
      });
      if (!response.ok) throw new Error("Failed to save about page");

      setCms(nextCms);
      setDraftCms(nextCms);
      setRawCms(JSON.stringify(nextCms, null, 2));
      setAboutStatus("About page saved");
    } catch {
      setAboutStatus("About page save failed");
    }
  };

  const resetAboutPage = () => {
    setAboutDraft(cms.aboutUs);
    setAboutStatus("About page editor reset");
  };

  const saveHomepageVisibility = async () => {
    try {
      const nextCms = { ...cms, homeSectionVisibility: visibilityDraft };
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers,
        body: JSON.stringify(nextCms),
      });
      if (!response.ok) throw new Error("Failed to save visibility");

      setCms(nextCms);
      setDraftCms(nextCms);
      setRawCms(JSON.stringify(nextCms, null, 2));
      setVisibilityStatus("Homepage visibility saved");
    } catch {
      setVisibilityStatus("Homepage visibility save failed");
    }
  };

  const resetReviewForm = () => {
    setEditingReviewIndex(null);
    setReviewForm({ quote: "", author: "", role: "", location: "" });
  };

  const upsertReview = () => {
    if (!reviewForm.quote.trim() || !reviewForm.author.trim()) {
      setReviewsStatus("Review quote and author are required");
      return;
    }

    const nextReviews = [...reviewsDraft];
    if (editingReviewIndex === null) {
      nextReviews.push(reviewForm);
      setReviewsStatus("Review added to draft");
    } else {
      nextReviews[editingReviewIndex] = reviewForm;
      setReviewsStatus("Review updated in draft");
    }
    setReviewsDraft(nextReviews);
    resetReviewForm();
  };

  const editReview = (review: Testimonial, index: number) => {
    setEditingReviewIndex(index);
    setReviewForm(review);
  };

  const deleteReview = (index: number) => {
    setReviewsDraft(prev =>
      prev.filter((_, currentIndex) => currentIndex !== index)
    );
    if (editingReviewIndex === index) resetReviewForm();
    setReviewsStatus("Review removed from draft");
  };

  const saveReviews = async () => {
    try {
      const nextCms = { ...cms, testimonials: reviewsDraft };
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers,
        body: JSON.stringify(nextCms),
      });
      if (!response.ok) throw new Error("Failed to save reviews");

      setCms(nextCms);
      setDraftCms(nextCms);
      setRawCms(JSON.stringify(nextCms, null, 2));
      setReviewsStatus("Reviews saved");
    } catch {
      setReviewsStatus("Reviews save failed");
    }
  };

  const resetArticleForm = () => {
    setEditingSlug(null);
    setArticleForm({
      slug: "",
      title: "",
      description: "",
      content: "",
      section: "",
      imageUrl: "",
      featured: false,
    });
  };

  const upsertArticle = () => {
    if (
      !articleForm.slug.trim() ||
      !articleForm.title.trim() ||
      !articleForm.description.trim()
    ) {
      setArticlesStatus("Slug, title, and description are required");
      return;
    }
    const draft = [...articlesDraft];
    const idx = draft.findIndex(a => a.slug === editingSlug);
    if (idx >= 0) {
      draft[idx] = articleForm;
      setArticlesStatus("Article updated in draft");
    } else {
      draft.push(articleForm);
      setArticlesStatus("Article added to draft");
    }
    setArticlesDraft(draft);
    setRawArticles(JSON.stringify(draft, null, 2));
    resetArticleForm();
  };

  const editArticle = (article: Article) => {
    setEditingSlug(article.slug);
    setArticleForm(article);
  };

  const deleteArticle = (slug: string) => {
    const draft = articlesDraft.filter(a => a.slug !== slug);
    setArticlesDraft(draft);
    setRawArticles(JSON.stringify(draft, null, 2));
    if (editingSlug === slug) resetArticleForm();
    setArticlesStatus("Article removed from draft");
  };

  const onArticleImageSelected = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingArticleImage(true);
    setArticlesStatus("Uploading article image...");

    try {
      const uploadedUrl = await uploadArticleImage(file, articleForm.slug);
      setArticleForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      setArticlesStatus("Article image uploaded");
    } catch (error) {
      console.error("Article image upload failed", error);
      setArticlesStatus(
        "Failed to upload image. Check Firebase storage settings."
      );
    } finally {
      setUploadingArticleImage(false);
      event.target.value = "";
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
                <Button
                  onClick={handleLogin}
                  className="bg-orange hover:bg-orange/90"
                >
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
                    <p className="mt-2">
                      Please ensure the following environment variables are set
                      in Vercel:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>
                        <code>VITE_FIREBASE_API_KEY</code>
                      </li>
                      <li>
                        <code>VITE_FIREBASE_PROJECT_ID</code>
                      </li>
                      <li>
                        <code>VITE_FIREBASE_APP_ID</code>
                      </li>
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
            <span className="text-sm text-slate-400 hidden md:inline">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-white border-slate-700"
            >
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
          <div className="mt-4">
            <Link href="/admin/editor">
              <Button className="bg-teal hover:bg-teal/90">
                Open full site editor
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <h2 className="text-xl font-serif">Homepage visibility</h2>
              <p className="text-sm text-slate-400 mt-1">
                Turn homepage sections on or off without editing raw JSON.
              </p>
            </div>
            <p className="text-sm text-slate-400">Status: {visibilityStatus}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["careTeam", "Care team"],
              ["articles", "Resources/articles"],
              ["newsletter", "Get CAFOLA care insights in your inbox"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-950 p-4"
              >
                <span className="text-sm font-semibold text-slate-200">
                  {label}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(
                    visibilityDraft[
                      key as keyof SiteContent["homeSectionVisibility"]
                    ]
                  )}
                  onChange={event =>
                    setVisibilityDraft(prev => ({
                      ...prev,
                      [key]: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-orange"
                />
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={saveHomepageVisibility}
              className="bg-orange hover:bg-orange/90"
            >
              Save Homepage Visibility
            </Button>
            <Button
              variant="outline"
              className="text-white"
              onClick={() => {
                setVisibilityDraft({
                  ...defaultSiteContent.homeSectionVisibility,
                  ...(cms.homeSectionVisibility ?? {}),
                });
                setVisibilityStatus("Homepage visibility editor reset");
              }}
            >
              Reset visibility editor
            </Button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <h2 className="text-xl font-serif">About page CMS section</h2>
              <p className="text-sm text-slate-400 mt-1">
                Edit the real full About CAFOLA page content without changing
                raw JSON.
              </p>
            </div>
            <p className="text-sm text-slate-400">Status: {aboutStatus}</p>
          </div>

          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-300">
                Hero headline
              </span>
              <textarea
                value={aboutDraft.headline}
                onChange={e => updateAboutField("headline", e.target.value)}
                className="w-full min-h-[90px] px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-300">
                Opening description
              </span>
              <textarea
                value={aboutDraft.description}
                onChange={e => updateAboutField("description", e.target.value)}
                className="w-full min-h-[120px] px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-300">
                Our Experience
              </span>
              <textarea
                value={aboutDraft.experience}
                onChange={e => updateAboutField("experience", e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-300">
                Scope of Service
              </span>
              <textarea
                value={aboutDraft.scopeOfService}
                onChange={e =>
                  updateAboutField("scopeOfService", e.target.value)
                }
                className="w-full min-h-[100px] px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-300">
                Our Staff
              </span>
              <textarea
                value={aboutDraft.staffDescription}
                onChange={e =>
                  updateAboutField("staffDescription", e.target.value)
                }
                className="w-full min-h-[100px] px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-300">
                Culture & Family Connections
              </span>
              <textarea
                value={aboutDraft.cultureAndFamily}
                onChange={e =>
                  updateAboutField("cultureAndFamily", e.target.value)
                }
                className="w-full min-h-[100px] px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-300">
                Staff matching / language support
              </span>
              <textarea
                value={aboutDraft.staffMatching}
                onChange={e =>
                  updateAboutField("staffMatching", e.target.value)
                }
                className="w-full min-h-[90px] px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-slate-300">
                Locations (one per line)
              </span>
              <textarea
                value={aboutDraft.locations.join("\n")}
                onChange={e => updateAboutLocations(e.target.value)}
                className="w-full min-h-[90px] px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={saveAboutPage}
              className="bg-orange hover:bg-orange/90"
            >
              Save About Page
            </Button>
            <Button
              variant="outline"
              className="text-white"
              onClick={resetAboutPage}
            >
              Reset about editor
            </Button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <h2 className="text-xl font-serif">Articles CMS section</h2>
            <p className="text-sm text-slate-400">Status: {articlesStatus}</p>
          </div>
          <p className="text-sm text-slate-400">
            Create, edit, delete, and publish articles. Click Save Articles to
            publish.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={articleForm.slug}
              onChange={e =>
                setArticleForm(p => ({ ...p, slug: e.target.value }))
              }
              placeholder="slug"
              className="px-3 py-2 bg-slate-950 border border-slate-700"
            />
            <input
              value={articleForm.section ?? ""}
              onChange={e =>
                setArticleForm(p => ({ ...p, section: e.target.value }))
              }
              placeholder="section"
              className="px-3 py-2 bg-slate-950 border border-slate-700"
            />
            <input
              value={articleForm.title}
              onChange={e =>
                setArticleForm(p => ({ ...p, title: e.target.value }))
              }
              placeholder="title"
              className="px-3 py-2 bg-slate-950 border border-slate-700 md:col-span-2"
            />
            <input
              value={articleForm.imageUrl ?? ""}
              onChange={e =>
                setArticleForm(p => ({ ...p, imageUrl: e.target.value }))
              }
              placeholder="image url"
              className="px-3 py-2 bg-slate-950 border border-slate-700 md:col-span-2"
            />
            <label className="md:col-span-2 text-sm text-slate-300 space-y-2">
              <span className="block">Or upload image to Firebase Storage</span>
              <input
                type="file"
                accept="image/*"
                onChange={e => void onArticleImageSelected(e)}
                disabled={uploadingArticleImage}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
              />
            </label>
            <textarea
              value={articleForm.description}
              onChange={e =>
                setArticleForm(p => ({ ...p, description: e.target.value }))
              }
              placeholder="description"
              className="px-3 py-2 bg-slate-950 border border-slate-700 md:col-span-2 min-h-[80px]"
            />
            <textarea
              value={articleForm.content ?? ""}
              onChange={e =>
                setArticleForm(p => ({ ...p, content: e.target.value }))
              }
              placeholder="full content"
              className="px-3 py-2 bg-slate-950 border border-slate-700 md:col-span-2 min-h-[120px]"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={upsertArticle}
              className="bg-teal hover:bg-teal/90"
            >
              {editingSlug ? "Update Draft" : "Add Draft"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-white"
              onClick={resetArticleForm}
            >
              Clear
            </Button>
          </div>
          <div className="space-y-2">
            {articlesDraft.map(article => (
              <div
                key={article.slug}
                className="border border-slate-800 p-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">{article.title}</p>
                  <p className="text-xs text-slate-400">
                    /{article.slug} • {article.section ?? "General"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-white"
                    onClick={() => editArticle(article)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => deleteArticle(article.slug)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={saveArticles}
              className="bg-orange hover:bg-orange/90"
            >
              Save Articles
            </Button>
            <Button
              variant="outline"
              className="text-white"
              onClick={() =>
                setRawArticles(JSON.stringify(cms.articles, null, 2))
              }
            >
              Reset articles editor
            </Button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <h2 className="text-xl font-serif">Reviews CMS section</h2>
            <p className="text-sm text-slate-400">Status: {reviewsStatus}</p>
          </div>
          <p className="text-sm text-slate-400">
            Add, edit, delete, and publish homepage reviews/testimonials.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={reviewForm.author}
              onChange={e =>
                setReviewForm(p => ({ ...p, author: e.target.value }))
              }
              placeholder="author"
              className="px-3 py-2 bg-slate-950 border border-slate-700"
            />
            <input
              value={reviewForm.role}
              onChange={e =>
                setReviewForm(p => ({ ...p, role: e.target.value }))
              }
              placeholder="role"
              className="px-3 py-2 bg-slate-950 border border-slate-700"
            />
            <input
              value={reviewForm.location}
              onChange={e =>
                setReviewForm(p => ({ ...p, location: e.target.value }))
              }
              placeholder="location"
              className="px-3 py-2 bg-slate-950 border border-slate-700 md:col-span-2"
            />
            <textarea
              value={reviewForm.quote}
              onChange={e =>
                setReviewForm(p => ({ ...p, quote: e.target.value }))
              }
              placeholder="review quote"
              className="px-3 py-2 bg-slate-950 border border-slate-700 md:col-span-2 min-h-[100px]"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={upsertReview}
              className="bg-teal hover:bg-teal/90"
            >
              {editingReviewIndex === null
                ? "Add Draft Review"
                : "Update Draft Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-white"
              onClick={resetReviewForm}
            >
              Clear
            </Button>
          </div>
          <div className="space-y-2">
            {reviewsDraft.map((review, index) => (
              <div
                key={`${review.author}-${index}`}
                className="border border-slate-800 p-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-xs text-slate-400">
                    {review.role || "Reviewer"} •{" "}
                    {review.location || "No location"}
                  </p>
                  <p className="text-sm text-slate-300 mt-2">
                    “{review.quote}”
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-white"
                    onClick={() => editReview(review, index)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => deleteReview(index)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={saveReviews}
              className="bg-orange hover:bg-orange/90"
            >
              Save Reviews
            </Button>
            <Button
              variant="outline"
              className="text-white"
              onClick={() => {
                setReviewsDraft(cms.testimonials);
                resetReviewForm();
                setReviewsStatus("Reviews editor reset");
              }}
            >
              Reset reviews editor
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
            <h2 className="text-xl font-serif">Live CMS preview</h2>
            <p className="text-sm text-slate-400">
              Preview updates in real time from the JSON editor
            </p>
          </div>
          {previewError ? (
            <div className="rounded border border-red-700 bg-red-900/20 p-4 text-sm text-red-200">
              {previewError}
            </div>
          ) : null}
          <CmsPreview cms={draftCms} />
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
