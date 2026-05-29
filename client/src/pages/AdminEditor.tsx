import { Button } from "@/components/ui/button";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { defaultSiteContent, type Article, type CustomPage as CustomPageType, type Service, type SiteContent } from "@shared/cms";
import { getLoginConfigIssue } from "@/const";
import { signInWithGoogle, logout, onAuthStateChanged, firebaseInitError, type User } from "@/lib/firebase";
import Home from "./Home";
import AboutUs from "./AboutUs";
import Articles from "./Articles";
import ArticleDetail from "./ArticleDetail";
import ServiceDetail from "./ServiceDetail";
import CustomPage from "./CustomPage";

type ContactSubmission = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  createdAt: string;
};

const emptyService: Service = {
  title: "",
  description: "",
  icon: "",
  longDescription: "",
};

const emptyArticle: Article = {
  slug: "",
  title: "",
  description: "",
  content: "",
  section: "",
  imageUrl: "",
  featured: false,
};

export default function AdminEditor() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState("");
  const [activeToken, setActiveToken] = useState("");
  const [cms, setCms] = useState<SiteContent>(defaultSiteContent);
  const [draftCms, setDraftCms] = useState<SiteContent>(defaultSiteContent);
  const [status, setStatus] = useState("Editor ready");
  const [navInput, setNavInput] = useState("");
  const [footerLinkInput, setFooterLinkInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<"home" | "about" | "articles" | "service" | "article" | "custom">("home");
  const [previewSlug, setPreviewSlug] = useState<string>("");
  const [customPageTitleInput, setCustomPageTitleInput] = useState("");
  const [customPageSlugInput, setCustomPageSlugInput] = useState("");
  const [customPageDescriptionInput, setCustomPageDescriptionInput] = useState("");
  const [customPageContentInput, setCustomPageContentInput] = useState("");
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

  const loadCms = async () => {
    try {
      const response = await fetch("/api/cms");
      if (!response.ok) throw new Error(`Failed to load CMS (${response.status})`);
      const payload = (await response.json()) as SiteContent;
      setCms(payload);
      setDraftCms(payload);
      setStatus("Loaded current Firebase CMS content");
    } catch (error) {
      console.error("Load CMS failed", error);
      setStatus(
        "Unable to load CMS. Make sure the backend server is running and /api/cms is reachable."
      );
    }
  };

  useEffect(() => {
    if (!user) return;
    void loadCms();
  }, [user]);

  const setToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveToken(tokenInput.trim());
  };

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

  const updateDraft = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setDraftCms((prev) => ({ ...prev, [key]: value }));
  };

  const updateAboutUs = <K extends keyof SiteContent["aboutUs"]>(key: K, value: SiteContent["aboutUs"][K]) => {
    setDraftCms((prev) => ({ ...prev, aboutUs: { ...prev.aboutUs, [key]: value } }));
  };

  const updateService = (index: number, patch: Partial<Service>) => {
    setDraftCms((prev) => ({
      ...prev,
      services: prev.services.map((service, i) => (i === index ? { ...service, ...patch } : service)),
    }));
  };

  const addService = () => {
    setDraftCms((prev) => ({ ...prev, services: [...prev.services, emptyService] }));
  };

  const deleteService = (index: number) => {
    setDraftCms((prev) => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  };

  const updateArticle = (index: number, patch: Partial<Article>) => {
    setDraftCms((prev) => ({
      ...prev,
      articles: prev.articles.map((article, i) => (i === index ? { ...article, ...patch } : article)),
    }));
  };

  const addArticle = () => {
    setDraftCms((prev) => ({ ...prev, articles: [...prev.articles, emptyArticle] }));
  };

  const deleteArticle = (index: number) => {
    setDraftCms((prev) => ({ ...prev, articles: prev.articles.filter((_, i) => i !== index) }));
  };

  const addCustomPage = () => {
    if (!customPageTitleInput.trim() || !customPageSlugInput.trim()) return;
    const nextPage: CustomPageType = {
      title: customPageTitleInput.trim(),
      slug: customPageSlugInput.trim(),
      description: customPageDescriptionInput.trim(),
      content: customPageContentInput.trim(),
    };

    setDraftCms((prev) => ({ ...prev, customPages: [...prev.customPages, nextPage] }));
    setCustomPageTitleInput("");
    setCustomPageSlugInput("");
    setCustomPageDescriptionInput("");
    setCustomPageContentInput("");
  };

  const updateCustomPage = (index: number, patch: Partial<CustomPageType>) => {
    setDraftCms((prev) => ({
      ...prev,
      customPages: prev.customPages.map((page, i) => (i === index ? { ...page, ...patch } : page)),
    }));
  };

  const deleteCustomPage = (index: number) => {
    setDraftCms((prev) => ({ ...prev, customPages: prev.customPages.filter((_, i) => i !== index) }));
  };

  const saveCms = async () => {
    setStatus("Publishing changes to Firebase...");
    try {
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers,
        body: JSON.stringify(draftCms),
      });
      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Failed to save CMS (${response.status}): ${details}`);
      }
      await loadCms();
      setStatus("Published draft to Firebase");
    } catch (error) {
      console.error("Publish failed", error);
      const message = error instanceof Error ? error.message : "Publish failed.";
      setStatus(message.replace(/\n/g, " ").trim());
    }
  };

  const getServiceSlug = (service: Service) =>
    service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  useEffect(() => {
    if (previewPage === "service" && !previewSlug && draftCms.services.length > 0) {
      setPreviewSlug(getServiceSlug(draftCms.services[0]));
    }

    if (previewPage === "article" && !previewSlug && draftCms.articles.length > 0) {
      setPreviewSlug(draftCms.articles[0].slug);
    }

    if (previewPage === "custom" && !previewSlug && draftCms.customPages.length > 0) {
      setPreviewSlug(draftCms.customPages[0].slug);
    }

    if ((previewPage === "home" || previewPage === "about" || previewPage === "articles") && previewSlug) {
      setPreviewSlug("");
    }
  }, [previewPage, previewSlug, draftCms]);

  const previewComponent = useMemo(() => {
    switch (previewPage) {
      case "about":
        return <AboutUs previewCms={draftCms} key="about" />;
      case "articles":
        return <Articles previewCms={draftCms} key="articles" />;
      case "service":
        return <ServiceDetail previewCms={draftCms} previewSlug={previewSlug} key={`service-${previewSlug}`} />;
      case "article":
        return <ArticleDetail previewCms={draftCms} previewSlug={previewSlug} key={`article-${previewSlug}`} />;
      case "custom":
        return <CustomPage previewCms={draftCms} previewSlug={previewSlug} key={`custom-${previewSlug}`} />;
      default:
        return <Home previewCms={draftCms} key="home" />;
    }
  }, [previewPage, previewSlug, draftCms]);

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
              <p className="text-xs uppercase tracking-widest text-slate-400">CAFOLA</p>
              <h1 className="text-2xl font-serif">Admin Site Editor</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-10">
          <section className="max-w-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h2 className="text-xl font-serif">Sign in to edit the site</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              You must sign in with Gmail before you can use the full site editor.
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
                    <p className="mt-2">Please ensure the following environment variables are set:</p>
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
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">CAFOLA</p>
            <h1 className="text-2xl font-serif">Site Editor</h1>
            <p className="text-slate-400 text-sm">Edit components, page content, links, and preview the site live.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm text-slate-400 hidden sm:inline">{user.email}</span>
            <Button size="sm" variant="outline" className="text-white border-slate-700" onClick={handleLogout}>
              Sign out
            </Button>
            <Link href="/admin" className="text-teal no-underline hover:underline">
              Admin console
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="bg-slate-900 border border-slate-800 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-serif">Current site draft</h2>
              <p className="text-sm text-slate-400">The preview reflects your current draft. Publish to save it to Firebase and make it the live CMS content.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveCms} className="bg-orange hover:bg-orange/90">
                Publish draft
              </Button>
              <Button variant="outline" className="text-white" onClick={() => void loadCms()}>
                Reload current CMS
              </Button>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-400">Status: {status}</p>
        </section>

        <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-6">
            {previewPage === "about" && (
              <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-serif">Edit About Us</h2>
                <div className="grid gap-3">
                  <textarea
                    value={draftCms.aboutUs.headline}
                    onChange={(e) => updateAboutUs("headline", e.target.value)}
                    placeholder="About headline"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[80px]"
                  />
                  <textarea
                    value={draftCms.aboutUs.description}
                    onChange={(e) => updateAboutUs("description", e.target.value)}
                    placeholder="About description"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[100px]"
                  />
                </div>
              </section>
            )}

            {previewPage === "service" && previewSlug && (
              <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-serif">Edit Service</h2>
                {draftCms.services.map((service, index) => {
                  if (getServiceSlug(service) !== previewSlug) return null;
                  return (
                    <div key={`${service.title}-${index}`} className="space-y-3">
                      <input
                        value={service.title}
                        onChange={(e) => updateService(index, { title: e.target.value })}
                        placeholder="Title"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <input
                        value={service.icon}
                        onChange={(e) => updateService(index, { icon: e.target.value })}
                        placeholder="Icon"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(index, { description: e.target.value })}
                        placeholder="Short description"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[80px]"
                      />
                      <textarea
                        value={service.longDescription ?? ""}
                        onChange={(e) => updateService(index, { longDescription: e.target.value })}
                        placeholder="Long description"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[100px]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() => deleteService(index)}
                      >
                        Delete service
                      </Button>
                    </div>
                  );
                })}
              </section>
            )}

            {previewPage === "article" && previewSlug && (
              <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-serif">Edit Article</h2>
                {draftCms.articles.map((article, index) => {
                  if (article.slug !== previewSlug) return null;
                  return (
                    <div key={`${article.slug}-${index}`} className="space-y-3">
                      <input
                        value={article.slug}
                        onChange={(e) => updateArticle(index, { slug: e.target.value })}
                        placeholder="Slug"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <input
                        value={article.title}
                        onChange={(e) => updateArticle(index, { title: e.target.value })}
                        placeholder="Title"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <input
                        value={article.section ?? ""}
                        onChange={(e) => updateArticle(index, { section: e.target.value })}
                        placeholder="Section"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <textarea
                        value={article.description}
                        onChange={(e) => updateArticle(index, { description: e.target.value })}
                        placeholder="Description"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[80px]"
                      />
                      <textarea
                        value={article.content}
                        onChange={(e) => updateArticle(index, { content: e.target.value })}
                        placeholder="Content"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[100px]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() => deleteArticle(index)}
                      >
                        Delete article
                      </Button>
                    </div>
                  );
                })}
              </section>
            )}

            {previewPage === "custom" && previewSlug && (
              <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-serif">Edit Custom Page</h2>
                {draftCms.customPages.map((page, index) => {
                  if (page.slug !== previewSlug) return null;
                  return (
                    <div key={`${page.slug}-${index}`} className="space-y-3">
                      <input
                        value={page.title}
                        onChange={(e) => updateCustomPage(index, { title: e.target.value })}
                        placeholder="Title"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <input
                        value={page.slug}
                        onChange={(e) => updateCustomPage(index, { slug: e.target.value })}
                        placeholder="Slug"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <textarea
                        value={page.description}
                        onChange={(e) => updateCustomPage(index, { description: e.target.value })}
                        placeholder="Description"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[80px]"
                      />
                      <textarea
                        value={page.content}
                        onChange={(e) => updateCustomPage(index, { content: e.target.value })}
                        placeholder="Content"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[120px]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() => deleteCustomPage(index)}
                      >
                        Delete page
                      </Button>
                    </div>
                  );
                })}
              </section>
            )}

            {(previewPage === "home" || previewPage === "articles") && (
              <div className="space-y-6">
                <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
                  <h2 className="text-xl font-serif">Site settings</h2>
              <div className="grid gap-3">
                <input
                  value={draftCms.brandName}
                  onChange={(e) => updateDraft("brandName", e.target.value)}
                  placeholder="Brand name"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                />
                <input
                  value={draftCms.companyDescriptor}
                  onChange={(e) => updateDraft("companyDescriptor", e.target.value)}
                  placeholder="Company descriptor"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                />
                <input
                  value={draftCms.phone}
                  onChange={(e) => updateDraft("phone", e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                />
                <textarea
                  value={draftCms.heroSubheading}
                  onChange={(e) => updateDraft("heroSubheading", e.target.value)}
                  placeholder="Hero subheading"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[100px]"
                />
                <input
                  value={draftCms.servicesHeading}
                  onChange={(e) => updateDraft("servicesHeading", e.target.value)}
                  placeholder="Services heading"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                />
                <textarea
                  value={draftCms.servicesIntro}
                  onChange={(e) => updateDraft("servicesIntro", e.target.value)}
                  placeholder="Services intro"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[80px]"
                />
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
                <h2 className="text-xl font-serif">Navigation links</h2>
              <div className="space-y-2">
                {draftCms.navItems.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-center gap-3">
                    <input
                      value={item}
                      onChange={(e) => {
                        const next = [...draftCms.navItems];
                        next[index] = e.target.value;
                        updateDraft("navItems", next);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-white"
                      onClick={() => updateDraft("navItems", draftCms.navItems.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  value={navInput}
                  onChange={(e) => setNavInput(e.target.value)}
                  placeholder="New nav label"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (!navInput.trim()) return;
                    updateDraft("navItems", [...draftCms.navItems, navInput.trim()]);
                    setNavInput("");
                  }}
                  className="bg-teal hover:bg-teal/90"
                >
                  Add
                </Button>
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h2 className="text-xl font-serif">Services</h2>
              <p className="text-sm text-slate-400">Add, edit, or remove service cards. New services generate detail pages automatically.</p>
              <div className="space-y-4">
                {draftCms.services.map((service, index) => (
                  <div key={`${service.title}-${index}`} className="rounded border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">Service {index + 1}</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() => deleteService(index)}
                      >
                        Delete
                      </Button>
                    </div>
                    <input
                      value={service.title}
                      onChange={(e) => updateService(index, { title: e.target.value })}
                      placeholder="Title"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                    />
                    <input
                      value={service.icon}
                      onChange={(e) => updateService(index, { icon: e.target.value })}
                      placeholder="Icon"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                    />
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(index, { description: e.target.value })}
                      placeholder="Short description"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[80px]"
                    />
                    <textarea
                      value={service.longDescription ?? ""}
                      onChange={(e) => updateService(index, { longDescription: e.target.value })}
                      placeholder="Long description"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[100px]"
                    />
                  </div>
                ))}
              </div>
              <Button type="button" onClick={addService} className="bg-teal hover:bg-teal/90">
                Add service card
              </Button>
            </section>

            <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h2 className="text-xl font-serif">Articles</h2>
              <p className="text-sm text-slate-400">Add article pages that appear in the Resources section and create detail pages automatically.</p>
              <div className="space-y-4">
                {draftCms.articles.map((article, index) => (
                  <div key={`${article.slug}-${index}`} className="rounded border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">Article {index + 1}</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() => deleteArticle(index)}
                      >
                        Delete
                      </Button>
                    </div>
                    <input
                      value={article.slug}
                      onChange={(e) => updateArticle(index, { slug: e.target.value })}
                      placeholder="Slug"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                    />
                    <input
                      value={article.title}
                      onChange={(e) => updateArticle(index, { title: e.target.value })}
                      placeholder="Title"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                    />
                    <input
                      value={article.section ?? ""}
                      onChange={(e) => updateArticle(index, { section: e.target.value })}
                      placeholder="Section"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                    />
                    <textarea
                      value={article.description}
                      onChange={(e) => updateArticle(index, { description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
              <Button type="button" onClick={addArticle} className="bg-teal hover:bg-teal/90">
                Add article page
              </Button>
            </section>

            <section className="bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h2 className="text-xl font-serif">Footer & About</h2>
              <div className="grid gap-3">
                <textarea
                  value={draftCms.aboutUs.headline}
                  onChange={(e) => updateAboutUs("headline", e.target.value)}
                  placeholder="About headline"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[80px]"
                />
                <textarea
                  value={draftCms.aboutUs.description}
                  onChange={(e) => updateAboutUs("description", e.target.value)}
                  placeholder="About description"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[80px]"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={footerLinkInput}
                    onChange={(e) => setFooterLinkInput(e.target.value)}
                    placeholder="New footer link"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!footerLinkInput.trim()) return;
                      updateDraft("footerLinks", [...draftCms.footerLinks, footerLinkInput.trim()]);
                      setFooterLinkInput("");
                    }}
                    className="bg-teal hover:bg-teal/90"
                  >
                    Add footer link
                  </Button>
                </div>
                <div className="space-y-2">
                  {draftCms.footerLinks.map((link, index) => (
                    <div key={`${link}-${index}`} className="flex items-center gap-3">
                      <input
                        value={link}
                        onChange={(e) => {
                          const next = [...draftCms.footerLinks];
                          next[index] = e.target.value;
                          updateDraft("footerLinks", next);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() => updateDraft("footerLinks", draftCms.footerLinks.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3">
                  <input
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="New footer address line"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!addressInput.trim()) return;
                      updateDraft("footerAddress", [...draftCms.footerAddress, addressInput.trim()]);
                      setAddressInput("");
                    }}
                    className="bg-teal hover:bg-teal/90"
                  >
                    Add address line
                  </Button>
                </div>
                <div className="space-y-2">
                  {draftCms.footerAddress.map((line, index) => (
                    <div key={`${line}-${index}`} className="flex items-center gap-3">
                      <input
                        value={line}
                        onChange={(e) => {
                          const next = [...draftCms.footerAddress];
                          next[index] = e.target.value;
                          updateDraft("footerAddress", next);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() => updateDraft("footerAddress", draftCms.footerAddress.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
      )}
          </div>

          <div className="space-y-6">
            <section className="bg-white border border-slate-200 p-6 rounded-md overflow-hidden space-y-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif text-slate-950">Live preview</h2>
                  <p className="text-sm text-slate-600">Preview the current draft across pages and custom content.</p>
                </div>
                <Button type="button" variant="outline" className="text-slate-950" onClick={() => setDraftCms(cms)}>
                  Reset preview to saved
                </Button>
              </div>

              <div className="space-y-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Choose a page to preview</h3>
                  <p className="text-sm text-slate-600">Switch between the homepage, About, Resources, service pages, articles, or custom pages.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-slate-700">Preview page</span>
                    <select
                      value={previewPage}
                      onChange={(event) => {
                        const next = event.target.value as "home" | "about" | "articles" | "service" | "article" | "custom";
                        setPreviewPage(next);
                        setPreviewSlug("");
                      }}
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
                    >
                      <option value="home">Home</option>
                      <option value="about">About</option>
                      <option value="articles">Resources</option>
                      <option value="service">Service detail</option>
                      <option value="article">Article detail</option>
                      <option value="custom">Custom page</option>
                    </select>
                  </label>

                  {(previewPage === "service" || previewPage === "article" || previewPage === "custom") && (
                    <label className="block">
                      <span className="text-sm text-slate-700">Preview selection</span>
                      <select
                        value={previewSlug}
                        onChange={(event) => setPreviewSlug(event.target.value)}
                        className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
                      >
                        {previewPage === "service" && (
                          draftCms.services.length > 0 ? (
                            draftCms.services.map((service) => (
                              <option key={service.title} value={getServiceSlug(service)}>
                                {service.title}
                              </option>
                            ))
                          ) : (
                            <option value="">No services available</option>
                          )
                        )}
                        {previewPage === "article" && (
                          draftCms.articles.length > 0 ? (
                            draftCms.articles.map((article) => (
                              <option key={article.slug} value={article.slug}>
                                {article.title || article.slug || "Untitled article"}
                              </option>
                            ))
                          ) : (
                            <option value="">No articles available</option>
                          )
                        )}
                        {previewPage === "custom" && (
                          draftCms.customPages.length > 0 ? (
                            draftCms.customPages.map((page) => (
                              <option key={page.slug} value={page.slug}>
                                {page.title || page.slug}
                              </option>
                            ))
                          ) : (
                            <option value="">No custom pages available</option>
                          )
                        )}
                      </select>
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Custom pages</h3>
                  <p className="text-sm text-slate-600">Create or update custom page content that appears at <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">/pages/&lt;slug&gt;</code>.</p>
                </div>
                <div className="grid gap-3">
                  <input
                    value={customPageTitleInput}
                    onChange={(e) => setCustomPageTitleInput(e.target.value)}
                    placeholder="Page title"
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                  <input
                    value={customPageSlugInput}
                    onChange={(e) => setCustomPageSlugInput(e.target.value)}
                    placeholder="Page slug"
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                  <input
                    value={customPageDescriptionInput}
                    onChange={(e) => setCustomPageDescriptionInput(e.target.value)}
                    placeholder="Page description"
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                  <textarea
                    value={customPageContentInput}
                    onChange={(e) => setCustomPageContentInput(e.target.value)}
                    placeholder="Page content"
                    className="w-full min-h-[120px] rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                  <Button type="button" onClick={addCustomPage} className="bg-teal hover:bg-teal/90">
                    Add custom page
                  </Button>
                </div>

                {draftCms.customPages.length > 0 && (
                  <div className="space-y-4">
                    {draftCms.customPages.map((page, index) => (
                      <div key={`${page.slug}-${index}`} className="rounded border border-slate-200 bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{page.title || page.slug}</p>
                            <p className="text-xs text-slate-500">/{page.slug}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-slate-950"
                            onClick={() => deleteCustomPage(index)}
                          >
                            Delete
                          </Button>
                        </div>
                        <input
                          value={page.title}
                          onChange={(e) => updateCustomPage(index, { title: e.target.value })}
                          placeholder="Title"
                          className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900"
                        />
                        <input
                          value={page.slug}
                          onChange={(e) => updateCustomPage(index, { slug: e.target.value })}
                          placeholder="Slug"
                          className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900"
                        />
                        <textarea
                          value={page.description}
                          onChange={(e) => updateCustomPage(index, { description: e.target.value })}
                          placeholder="Description"
                          className="w-full min-h-[80px] rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900"
                        />
                        <textarea
                          value={page.content}
                          onChange={(e) => updateCustomPage(index, { content: e.target.value })}
                          placeholder="Content"
                          className="w-full min-h-[100px] rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-md border border-slate-200">
                {previewComponent}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
