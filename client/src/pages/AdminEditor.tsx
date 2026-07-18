import { Button } from "@/components/ui/button";
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { defaultSiteContent, type Article, type CustomPage as CustomPageType, type HomeImages, type MediaAsset, type Service, type ServiceDetailItem, type ServicePage, type ServicePageSection, type SiteContent } from "@shared/cms";
import { getLoginConfigIssue } from "@/const";
import { signInWithGoogle, logout, onAuthStateChanged, firebaseInitError, uploadMediaAsset, type User } from "@/lib/firebase";
import Home from "./Home";
import AboutUs from "./AboutUs";
import Articles from "./Articles";
import ArticleDetail from "./ArticleDetail";
import ServiceDetail from "./ServiceDetail";
import CustomPage from "./CustomPage";
import ServicePageDetail from "./ServicePageDetail";

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
  imageUrl: "",
  imageAlt: "",
  longDescription: "",
  details: [],
};

const emptyServiceDetail: ServiceDetailItem = {
  title: "",
  description: "",
  linkPageSlug: "",
  inlineLinkedPage: false,
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

const emptyServicePageSection: ServicePageSection = {
  title: "",
  description: "",
  imageUrl: "",
  imageAlt: "",
  mediaType: "image",
  imagePosition: "full",
};

const emptyServicePage: ServicePage = {
  slug: "",
  title: "",
  description: "",
  heroImageUrl: "",
  heroMediaType: "image",
  content: "",
  sections: [],
};

type PreviewPage = "home" | "about" | "articles" | "service" | "servicePage" | "article" | "custom";

type EditorSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function EditorSection({ title, description, children }: EditorSectionProps) {
  return (
    <details className="bg-slate-900 border border-slate-800 p-6">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif">{title}</h2>
            {description ? <p className="text-sm text-slate-400">{description}</p> : null}
          </div>
          <span className="mt-1 text-sm text-slate-400">Open</span>
        </div>
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}

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
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");
  const [previewSlug, setPreviewSlug] = useState<string>("");
  const [customPageTitleInput, setCustomPageTitleInput] = useState("");
  const [customPageSlugInput, setCustomPageSlugInput] = useState("");
  const [customPageDescriptionInput, setCustomPageDescriptionInput] = useState("");
  const [customPageContentInput, setCustomPageContentInput] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
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

  const updateHomeImage = <K extends keyof HomeImages>(key: K, value: HomeImages[K]) => {
    setDraftCms((prev) => ({
      ...prev,
      homeImages: { ...(prev.homeImages ?? defaultSiteContent.homeImages), [key]: value },
    }));
  };

  const updateCaregiverImage = (index: number, value: string) => {
    setDraftCms((prev) => {
      const caregivers = [...(prev.homeImages?.caregivers ?? defaultSiteContent.homeImages.caregivers)];
      caregivers[index] = value;
      return {
        ...prev,
        homeImages: { ...(prev.homeImages ?? defaultSiteContent.homeImages), caregivers },
      };
    });
  };

  const updateCaregiverCopy = (index: number, value: string) => {
    setDraftCms((prev) => ({
      ...prev,
      caregiversCopy: prev.caregiversCopy.map((line, i) => (i === index ? value : line)),
    }));
  };

  const addMediaAsset = (asset: MediaAsset) => {
    setDraftCms((prev) => ({ ...prev, mediaLibrary: [asset, ...(prev.mediaLibrary ?? [])] }));
  };

  const deleteMediaAsset = (assetId: string) => {
    setDraftCms((prev) => ({ ...prev, mediaLibrary: (prev.mediaLibrary ?? []).filter((asset) => asset.id !== assetId) }));
  };

  const getMediaType = (contentType?: string): MediaAsset["type"] =>
    contentType?.startsWith("video/") ? "video" : "image";

  const onMediaSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setStatus(`Uploading ${file.name}...`);
    try {
      const url = await uploadMediaAsset(file);
      addMediaAsset({
        id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
        name: file.name,
        url,
        type: getMediaType(file.type),
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      });
      setStatus("Uploaded media to library");
    } catch (error) {
      console.error("Media upload failed", error);
      const message = error instanceof Error ? error.message : "Media upload failed.";
      setStatus(message);
    } finally {
      setUploadingMedia(false);
      event.currentTarget.value = "";
    }
  };

  const onLogoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Please choose an image file for the company logo.");
      event.currentTarget.value = "";
      return;
    }

    setUploadingMedia(true);
    setStatus(`Uploading company logo ${file.name}...`);
    try {
      const url = await uploadMediaAsset(file);
      addMediaAsset({
        id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
        name: file.name,
        url,
        type: "image",
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      });
      updateDraft("logoUrl", url);
      setStatus("Uploaded company logo. Publish changes to apply it site-wide.");
    } catch (error) {
      console.error("Logo upload failed", error);
      const message = error instanceof Error ? error.message : "Logo upload failed.";
      setStatus(message);
    } finally {
      setUploadingMedia(false);
      event.currentTarget.value = "";
    }
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

  const updateServiceDetail = (
    serviceIndex: number,
    detailIndex: number,
    patch: Partial<ServiceDetailItem>
  ) => {
    setDraftCms((prev) => ({
      ...prev,
      services: prev.services.map((service, i) => {
        if (i !== serviceIndex) return service;
        return {
          ...service,
          details: (service.details ?? []).map((detail, j) =>
            j === detailIndex ? { ...detail, ...patch } : detail
          ),
        };
      }),
    }));
  };

  const addServiceDetail = (serviceIndex: number) => {
    setDraftCms((prev) => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === serviceIndex
          ? { ...service, details: [...(service.details ?? []), emptyServiceDetail] }
          : service
      ),
    }));
  };

  const deleteServiceDetail = (serviceIndex: number, detailIndex: number) => {
    setDraftCms((prev) => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === serviceIndex
          ? { ...service, details: (service.details ?? []).filter((_, j) => j !== detailIndex) }
          : service
      ),
    }));
  };

  const updateServicePage = (index: number, patch: Partial<ServicePage>) => {
    setDraftCms((prev) => ({
      ...prev,
      servicePages: (prev.servicePages ?? []).map((page, i) =>
        i === index ? { ...page, ...patch } : page
      ),
      services:
        patch.slug !== undefined
          ? prev.services.map((service) => ({
              ...service,
              details: (service.details ?? []).map((detail) =>
                detail.linkPageSlug === (prev.servicePages ?? [])[index]?.slug
                  ? { ...detail, linkPageSlug: patch.slug }
                  : detail
              ),
            }))
          : prev.services,
    }));
  };

  const addServicePage = (page?: Partial<ServicePage>) => {
    const nextPage: ServicePage = {
      ...emptyServicePage,
      slug: page?.slug ?? "",
      title: page?.title ?? "",
      description: page?.description ?? "",
      heroImageUrl: page?.heroImageUrl ?? "",
      content: page?.content ?? "",
      sections: page?.sections ?? [],
    };

    setDraftCms((prev) => ({ ...prev, servicePages: [...(prev.servicePages ?? []), nextPage] }));
    return nextPage.slug;
  };

  const deleteServicePage = (index: number) => {
    setDraftCms((prev) => {
      const removed = (prev.servicePages ?? [])[index];
      return {
        ...prev,
        servicePages: (prev.servicePages ?? []).filter((_, i) => i !== index),
        services: prev.services.map((service) => ({
          ...service,
          details: (service.details ?? []).map((detail) =>
            detail.linkPageSlug === removed?.slug ? { ...detail, linkPageSlug: "" } : detail
          ),
        })),
      };
    });
  };

  const updateServicePageSection = (
    pageIndex: number,
    sectionIndex: number,
    patch: Partial<ServicePageSection>
  ) => {
    setDraftCms((prev) => ({
      ...prev,
      servicePages: (prev.servicePages ?? []).map((page, i) => {
        if (i !== pageIndex) return page;
        return {
          ...page,
          sections: (page.sections ?? []).map((section, j) =>
            j === sectionIndex ? { ...section, ...patch } : section
          ),
        };
      }),
    }));
  };

  const addServicePageSection = (pageIndex: number) => {
    setDraftCms((prev) => ({
      ...prev,
      servicePages: (prev.servicePages ?? []).map((page, i) =>
        i === pageIndex
          ? { ...page, sections: [...(page.sections ?? []), emptyServicePageSection] }
          : page
      ),
    }));
  };

  const deleteServicePageSection = (pageIndex: number, sectionIndex: number) => {
    setDraftCms((prev) => ({
      ...prev,
      servicePages: (prev.servicePages ?? []).map((page, i) =>
        i === pageIndex
          ? { ...page, sections: (page.sections ?? []).filter((_, j) => j !== sectionIndex) }
          : page
      ),
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
      imageUrl: "",
      imageAlt: "",
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

  const getUniqueServicePageSlug = (title: string) => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "service-page";
    const existing = new Set((draftCms.servicePages ?? []).map((page) => page.slug));
    let slug = base;
    let count = 2;
    while (existing.has(slug)) {
      slug = `${base}-${count}`;
      count += 1;
    }
    return slug;
  };

  const renderMediaPicker = (
    selectedUrl: string | undefined,
    onSelect: (asset: MediaAsset) => void
  ) => (
    <div className="rounded border border-slate-800 bg-slate-950/80 p-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Choose from media library
      </p>
      {(draftCms.mediaLibrary ?? []).length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {(draftCms.mediaLibrary ?? []).map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset)}
              className={`overflow-hidden rounded border text-left transition ${
                selectedUrl === asset.url ? "border-teal bg-teal/10" : "border-slate-800 bg-slate-900 hover:border-slate-600"
              }`}
            >
              {asset.type === "image" ? (
                <img src={asset.url} alt={asset.name} className="h-20 w-full object-cover" loading="lazy" />
              ) : (
                <div className="grid h-20 place-items-center bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Video
                </div>
              )}
              <span className="block truncate px-2 py-2 text-xs text-slate-300">{asset.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Upload media below to make it available here.</p>
      )}
    </div>
  );

  const renderImagePicker = (
    selectedUrl: string | undefined,
    onSelect: (asset: MediaAsset) => void
  ) => {
    const imageAssets = (draftCms.mediaLibrary ?? []).filter((asset) => asset.type === "image");

    return (
      <div className="rounded border border-slate-800 bg-slate-950/80 p-3 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Choose image from media library
        </p>
        {imageAssets.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {imageAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelect(asset)}
                className={`overflow-hidden rounded border text-left transition ${
                  selectedUrl === asset.url ? "border-teal bg-teal/10" : "border-slate-800 bg-slate-900 hover:border-slate-600"
                }`}
              >
                <img src={asset.url} alt={asset.name} className="h-20 w-full object-cover" loading="lazy" />
                <span className="block truncate px-2 py-2 text-xs text-slate-300">{asset.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Upload images in the Media section to make them available here.</p>
        )}
      </div>
    );
  };

  const renderMediaLibraryEditor = () => (
    <EditorSection
      title="Media"
      description="Upload images or videos once, then choose them while editing page media."
    >
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(event) => void onMediaSelected(event)}
        disabled={uploadingMedia}
        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
      />
      {uploadingMedia ? <p className="text-sm text-slate-400">Uploading...</p> : null}
      {(draftCms.mediaLibrary ?? []).length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {(draftCms.mediaLibrary ?? []).map((asset) => (
            <div key={asset.id} className="overflow-hidden rounded border border-slate-800 bg-slate-950">
              {asset.type === "image" ? (
                <img src={asset.url} alt={asset.name} className="h-24 w-full object-cover" loading="lazy" />
              ) : (
                <video src={asset.url} className="h-24 w-full object-cover" muted controls />
              )}
              <div className="space-y-2 p-2">
                <p className="truncate text-xs text-slate-300">{asset.name}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full text-white"
                  onClick={() => deleteMediaAsset(asset.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </EditorSection>
  );

  const renderServiceDetailsEditor = (service: Service, serviceIndex: number, inputClassName: string) => (
    <div className="space-y-3 rounded border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-semibold">Service page blocks</h4>
          <p className="text-xs text-slate-400">These appear under "What We Offer" on this service page.</p>
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-teal hover:bg-teal/90"
          onClick={() => addServiceDetail(serviceIndex)}
        >
          Add block
        </Button>
      </div>

      {(service.details ?? []).length > 0 ? (
        <div className="space-y-3">
          {(service.details ?? []).map((detail, detailIndex) => (
            <div key={`${detail.title}-${detailIndex}`} className="rounded border border-slate-800 bg-slate-950 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-200">
                  {detail.title || `Block ${detailIndex + 1}`}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-white"
                  onClick={() => deleteServiceDetail(serviceIndex, detailIndex)}
                >
                  Remove
                </Button>
              </div>
              <input
                value={detail.title}
                onChange={(e) => updateServiceDetail(serviceIndex, detailIndex, { title: e.target.value })}
                placeholder="Block title"
                className={inputClassName}
              />
              <textarea
                value={detail.description}
                onChange={(e) => updateServiceDetail(serviceIndex, detailIndex, { description: e.target.value })}
                placeholder="Block description"
                className={`${inputClassName} min-h-[80px]`}
              />
              <label className="flex items-start gap-3 rounded border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={Boolean(detail.inlineLinkedPage)}
                  onChange={(e) => updateServiceDetail(serviceIndex, detailIndex, { inlineLinkedPage: e.target.checked })}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-slate-100">Show linked page content inline</span>
                  <span className="block text-xs text-slate-400">When enabled, the linked page details display before “What We Offer” instead of this block appearing as a card.</span>
                </span>
              </label>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Optional linked page
                </label>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <select
                    value={detail.linkPageSlug ?? ""}
                    onChange={(e) => updateServiceDetail(serviceIndex, detailIndex, { linkPageSlug: e.target.value })}
                    className={inputClassName}
                  >
                    <option value="">No linked page</option>
                    {(draftCms.servicePages ?? []).map((page) => (
                      <option key={page.slug} value={page.slug}>
                        {page.title || page.slug || "Untitled page"}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-white"
                    onClick={() => {
                      const slug = getUniqueServicePageSlug(detail.title || service.title || "service-page");
                      addServicePage({
                        slug,
                        title: detail.title || "New service page",
                        description: detail.description,
                        content: detail.description,
                      });
                      updateServiceDetail(serviceIndex, detailIndex, { linkPageSlug: slug });
                      setPreviewPage("servicePage");
                      setPreviewSlug(slug);
                    }}
                  >
                    Create page
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No detail blocks yet.</p>
      )}
    </div>
  );

  const renderServicePagesEditor = () => (
    <EditorSection
      title="Service linked pages"
      description="Create editable pages that service page blocks can link to."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Button type="button" onClick={() => addServicePage()} className="bg-teal hover:bg-teal/90">
          Add service page
        </Button>
      </div>

      <div className="space-y-4">
        {(draftCms.servicePages ?? []).map((page, pageIndex) => (
          <div key={`${page.slug}-${pageIndex}`} className="rounded border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{page.title || page.slug || `Service page ${pageIndex + 1}`}</h3>
                <p className="text-xs text-slate-500">/services/&lt;service&gt;/{page.slug || "slug"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-white"
                  onClick={() => {
                    setPreviewPage("servicePage");
                    setPreviewSlug(page.slug);
                  }}
                >
                  Preview
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-white"
                  onClick={() => deleteServicePage(pageIndex)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <input
              value={page.slug}
              onChange={(e) => updateServicePage(pageIndex, { slug: e.target.value })}
              placeholder="Slug"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
            />
            <input
              value={page.title}
              onChange={(e) => updateServicePage(pageIndex, { title: e.target.value })}
              placeholder="Title"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
            />
            <textarea
              value={page.description}
              onChange={(e) => updateServicePage(pageIndex, { description: e.target.value })}
              placeholder="Description"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[80px]"
            />
            <input
              value={page.heroImageUrl ?? ""}
              onChange={(e) => updateServicePage(pageIndex, { heroImageUrl: e.target.value })}
              placeholder="Hero media URL"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
            />
            {renderMediaPicker(page.heroImageUrl, (asset) =>
              updateServicePage(pageIndex, { heroImageUrl: asset.url, heroMediaType: asset.type })
            )}
            <select
              value={page.heroMediaType ?? "image"}
              onChange={(e) => updateServicePage(pageIndex, { heroMediaType: e.target.value as ServicePage["heroMediaType"] })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
            >
              <option value="image">Hero is image</option>
              <option value="video">Hero is video</option>
            </select>
            <textarea
              value={page.content ?? ""}
              onChange={(e) => updateServicePage(pageIndex, { content: e.target.value })}
              placeholder="Intro content"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[100px]"
            />

            <div className="space-y-3 rounded border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-semibold">Page sections</h4>
                  <p className="text-xs text-slate-400">Add images and choose where each image sits on the page.</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="bg-teal hover:bg-teal/90"
                  onClick={() => addServicePageSection(pageIndex)}
                >
                  Add section
                </Button>
              </div>

              {(page.sections ?? []).length > 0 ? (
                <div className="space-y-3">
                  {(page.sections ?? []).map((section, sectionIndex) => (
                    <div key={`${section.title}-${sectionIndex}`} className="rounded border border-slate-800 bg-slate-950 p-3 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-200">
                          {section.title || `Section ${sectionIndex + 1}`}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-white"
                          onClick={() => deleteServicePageSection(pageIndex, sectionIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                      <input
                        value={section.title}
                        onChange={(e) => updateServicePageSection(pageIndex, sectionIndex, { title: e.target.value })}
                        placeholder="Section title"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                      />
                      <textarea
                        value={section.description}
                        onChange={(e) => updateServicePageSection(pageIndex, sectionIndex, { description: e.target.value })}
                        placeholder="Section description"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[90px]"
                      />
                      <input
                        value={section.imageUrl ?? ""}
                        onChange={(e) => updateServicePageSection(pageIndex, sectionIndex, { imageUrl: e.target.value })}
                        placeholder="Media URL"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                      />
                      {renderMediaPicker(section.imageUrl, (asset) =>
                        updateServicePageSection(pageIndex, sectionIndex, { imageUrl: asset.url, mediaType: asset.type })
                      )}
                      <select
                        value={section.mediaType ?? "image"}
                        onChange={(e) =>
                          updateServicePageSection(pageIndex, sectionIndex, {
                            mediaType: e.target.value as ServicePageSection["mediaType"],
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                      >
                        <option value="image">Media is image</option>
                        <option value="video">Media is video</option>
                      </select>
                      <input
                        value={section.imageAlt ?? ""}
                        onChange={(e) => updateServicePageSection(pageIndex, sectionIndex, { imageAlt: e.target.value })}
                        placeholder="Image alt text"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                      />
                      <select
                        value={section.imagePosition ?? "full"}
                        onChange={(e) =>
                          updateServicePageSection(pageIndex, sectionIndex, {
                            imagePosition: e.target.value as ServicePageSection["imagePosition"],
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                      >
                        <option value="full">Image above text</option>
                        <option value="left">Image left</option>
                        <option value="right">Image right</option>
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No sections yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </EditorSection>
  );

  useEffect(() => {
    if (previewPage === "service" && !previewSlug && draftCms.services.length > 0) {
      setPreviewSlug(getServiceSlug(draftCms.services[0]));
    }

    if (previewPage === "servicePage" && !previewSlug && (draftCms.servicePages ?? []).length > 0) {
      setPreviewSlug((draftCms.servicePages ?? [])[0]?.slug ?? "");
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
      case "servicePage":
        return <ServicePageDetail previewCms={draftCms} previewSlug={previewSlug} key={`service-page-${previewSlug}`} />;
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

      <main className="container mx-auto px-4 py-6 space-y-6">
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
            {renderMediaLibraryEditor()}

            {previewPage === "about" && (
              <EditorSection title="Edit About Us">
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
                  <input
                    value={draftCms.aboutUs.imageUrl ?? ""}
                    onChange={(e) => updateAboutUs("imageUrl", e.target.value)}
                    placeholder="About page image URL"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                  />
                  {renderImagePicker(draftCms.aboutUs.imageUrl, (asset) => updateAboutUs("imageUrl", asset.url))}
                  <input
                    value={draftCms.aboutUs.imageAlt ?? ""}
                    onChange={(e) => updateAboutUs("imageAlt", e.target.value)}
                    placeholder="About page image alt text"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                  />
                </div>
              </EditorSection>
            )}

            {previewPage === "service" && previewSlug && (
              <EditorSection title="Edit Service">
                {draftCms.services.map((service, index) => {
                  if (getServiceSlug(service) !== previewSlug) return null;
                  return (
                    <div key={`${service.title}-${index}`} className="space-y-3">
                      <input
                        value={service.title}
                        onChange={(e) => {
                          updateService(index, { title: e.target.value });
                          setPreviewSlug(getServiceSlug({ ...service, title: e.target.value }));
                        }}
                        placeholder="Title"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <input
                        value={service.icon}
                        onChange={(e) => updateService(index, { icon: e.target.value })}
                        placeholder="Icon"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <input
                        value={service.imageUrl ?? ""}
                        onChange={(e) => updateService(index, { imageUrl: e.target.value })}
                        placeholder="Service detail image URL"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      {renderImagePicker(service.imageUrl, (asset) => updateService(index, { imageUrl: asset.url }))}
                      <input
                        value={service.imageAlt ?? ""}
                        onChange={(e) => updateService(index, { imageAlt: e.target.value })}
                        placeholder="Service detail image alt text"
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
                      {renderServiceDetailsEditor(
                        service,
                        index,
                        "w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      )}
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
              </EditorSection>
            )}

            {previewPage === "servicePage" && previewSlug && (
              <EditorSection title="Edit Linked Service Page">
                {(draftCms.servicePages ?? []).map((page, pageIndex) => {
                  if (page.slug !== previewSlug) return null;
                  return (
                    <div key={`${page.slug}-${pageIndex}`} className="space-y-3">
                      <input
                        value={page.slug}
                        onChange={(e) => {
                          updateServicePage(pageIndex, { slug: e.target.value });
                          setPreviewSlug(e.target.value);
                        }}
                        placeholder="Slug"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <input
                        value={page.title}
                        onChange={(e) => updateServicePage(pageIndex, { title: e.target.value })}
                        placeholder="Title"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      <textarea
                        value={page.description}
                        onChange={(e) => updateServicePage(pageIndex, { description: e.target.value })}
                        placeholder="Description"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[80px]"
                      />
                      <input
                        value={page.heroImageUrl ?? ""}
                        onChange={(e) => updateServicePage(pageIndex, { heroImageUrl: e.target.value })}
                        placeholder="Hero media URL"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      {renderMediaPicker(page.heroImageUrl, (asset) =>
                        updateServicePage(pageIndex, { heroImageUrl: asset.url, heroMediaType: asset.type })
                      )}
                      <select
                        value={page.heroMediaType ?? "image"}
                        onChange={(e) => updateServicePage(pageIndex, { heroMediaType: e.target.value as ServicePage["heroMediaType"] })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      >
                        <option value="image">Hero is image</option>
                        <option value="video">Hero is video</option>
                      </select>
                      <textarea
                        value={page.content ?? ""}
                        onChange={(e) => updateServicePage(pageIndex, { content: e.target.value })}
                        placeholder="Intro content"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 min-h-[100px]"
                      />

                      <div className="space-y-3 rounded border border-slate-800 bg-slate-900/50 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="font-semibold">Page sections</h4>
                            <p className="text-xs text-slate-400">Add titles, text, images, and image placement for this page.</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-teal hover:bg-teal/90"
                            onClick={() => addServicePageSection(pageIndex)}
                          >
                            Add section
                          </Button>
                        </div>

                        {(page.sections ?? []).length > 0 ? (
                          <div className="space-y-3">
                            {(page.sections ?? []).map((section, sectionIndex) => (
                              <div key={`${section.title}-${sectionIndex}`} className="rounded border border-slate-800 bg-slate-950 p-3 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-slate-200">
                                    {section.title || `Section ${sectionIndex + 1}`}
                                  </p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="text-white"
                                    onClick={() => deleteServicePageSection(pageIndex, sectionIndex)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                                <input
                                  value={section.title}
                                  onChange={(e) => updateServicePageSection(pageIndex, sectionIndex, { title: e.target.value })}
                                  placeholder="Section title"
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                                />
                                <textarea
                                  value={section.description}
                                  onChange={(e) => updateServicePageSection(pageIndex, sectionIndex, { description: e.target.value })}
                                  placeholder="Section description"
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[90px]"
                                />
                                <input
                                  value={section.imageUrl ?? ""}
                                  onChange={(e) => updateServicePageSection(pageIndex, sectionIndex, { imageUrl: e.target.value })}
                                  placeholder="Media URL"
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                                />
                                {renderMediaPicker(section.imageUrl, (asset) =>
                                  updateServicePageSection(pageIndex, sectionIndex, { imageUrl: asset.url, mediaType: asset.type })
                                )}
                                <select
                                  value={section.mediaType ?? "image"}
                                  onChange={(e) =>
                                    updateServicePageSection(pageIndex, sectionIndex, {
                                      mediaType: e.target.value as ServicePageSection["mediaType"],
                                    })
                                  }
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                                >
                                  <option value="image">Media is image</option>
                                  <option value="video">Media is video</option>
                                </select>
                                <input
                                  value={section.imageAlt ?? ""}
                                  onChange={(e) => updateServicePageSection(pageIndex, sectionIndex, { imageAlt: e.target.value })}
                                  placeholder="Image alt text"
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                                />
                                <select
                                  value={section.imagePosition ?? "full"}
                                  onChange={(e) =>
                                    updateServicePageSection(pageIndex, sectionIndex, {
                                      imagePosition: e.target.value as ServicePageSection["imagePosition"],
                                    })
                                  }
                                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                                >
                                  <option value="full">Image above text</option>
                                  <option value="left">Image left</option>
                                  <option value="right">Image right</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">No sections yet.</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() => deleteServicePage(pageIndex)}
                      >
                        Delete linked page
                      </Button>
                    </div>
                  );
                })}
              </EditorSection>
            )}

            {previewPage === "article" && previewSlug && (
              <EditorSection title="Edit Article">
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
                      <input
                        value={article.imageUrl ?? ""}
                        onChange={(e) => updateArticle(index, { imageUrl: e.target.value })}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      {renderImagePicker(article.imageUrl, (asset) => updateArticle(index, { imageUrl: asset.url }))}
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
              </EditorSection>
            )}

            {previewPage === "custom" && previewSlug && (
              <EditorSection title="Edit Custom Page">
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
                      <input
                        value={page.imageUrl ?? ""}
                        onChange={(e) => updateCustomPage(index, { imageUrl: e.target.value })}
                        placeholder="Page image URL"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
                      />
                      {renderImagePicker(page.imageUrl, (asset) => updateCustomPage(index, { imageUrl: asset.url }))}
                      <input
                        value={page.imageAlt ?? ""}
                        onChange={(e) => updateCustomPage(index, { imageAlt: e.target.value })}
                        placeholder="Page image alt text"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700"
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
              </EditorSection>
            )}

            {(previewPage === "home" || previewPage === "articles") && (
              <div className="space-y-6">
                <EditorSection title="Site settings">
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
                <div className="space-y-3 rounded border border-slate-800 bg-slate-950 p-4">
                  <div>
                    <h3 className="font-semibold">Company logo</h3>
                    <p className="text-sm text-slate-400">Upload or choose the logo used in the fixed navigation bar and brand areas.</p>
                  </div>
                  {draftCms.logoUrl ? (
                    <img src={draftCms.logoUrl} alt="Current company logo" className="h-20 w-20 rounded bg-white object-contain p-2" />
                  ) : null}
                  <input
                    value={draftCms.logoUrl ?? ""}
                    onChange={(e) => updateDraft("logoUrl", e.target.value)}
                    placeholder="Logo image URL"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onLogoSelected}
                    disabled={uploadingMedia}
                    className="w-full text-sm file:mr-4 file:border-0 file:bg-teal file:px-4 file:py-2 file:text-white"
                  />
                  {renderImagePicker(draftCms.logoUrl, (asset) => updateDraft("logoUrl", asset.url))}
                </div>
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
                <div className="space-y-3 rounded border border-slate-800 bg-slate-950 p-4">
                  <h3 className="font-semibold">Caregivers section</h3>
                  <input
                    value={draftCms.caregiversHeading}
                    onChange={(e) => updateDraft("caregiversHeading", e.target.value)}
                    placeholder="Caregivers heading"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                  />
                  {draftCms.caregiversCopy.map((line, index) => (
                    <div key={`caregiver-copy-${index}`} className="flex items-start gap-3">
                      <textarea
                        value={line}
                        onChange={(e) => updateCaregiverCopy(index, e.target.value)}
                        placeholder={`Caregivers copy ${index + 1}`}
                        className="min-h-[80px] flex-1 px-3 py-2 bg-slate-900 border border-slate-700"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-white"
                        onClick={() =>
                          updateDraft(
                            "caregiversCopy",
                            draftCms.caregiversCopy.filter((_, i) => i !== index)
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-teal hover:bg-teal/90"
                      onClick={() => updateDraft("caregiversCopy", [...draftCms.caregiversCopy, ""])}
                    >
                      Add copy line
                    </Button>
                  </div>
                  <input
                    value={draftCms.caregiversButtonText}
                    onChange={(e) => updateDraft("caregiversButtonText", e.target.value)}
                    placeholder="Caregivers button text"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                  />
                </div>
                <div className="space-y-3 rounded border border-slate-800 bg-slate-950 p-4">
                  <h3 className="font-semibold">Resources section</h3>
                  <input
                    value={draftCms.resourcesHeading}
                    onChange={(e) => updateDraft("resourcesHeading", e.target.value)}
                    placeholder="Resources heading"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                  />
                  <textarea
                    value={draftCms.resourcesIntro}
                    onChange={(e) => updateDraft("resourcesIntro", e.target.value)}
                    placeholder="Resources intro"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[80px]"
                  />
                </div>
                <div className="space-y-3 rounded border border-slate-800 bg-slate-950 p-4">
                  <h3 className="font-semibold">Homepage images</h3>
                  <input
                    value={draftCms.homeImages?.hero ?? ""}
                    onChange={(e) => updateHomeImage("hero", e.target.value)}
                    placeholder="Hero image URL"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                  />
                  {renderImagePicker(draftCms.homeImages?.hero, (asset) => updateHomeImage("hero", asset.url))}
                  <input
                    value={draftCms.homeImages?.story ?? ""}
                    onChange={(e) => updateHomeImage("story", e.target.value)}
                    placeholder="Story image URL"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                  />
                  {renderImagePicker(draftCms.homeImages?.story, (asset) => updateHomeImage("story", asset.url))}
                  {(draftCms.homeImages?.caregivers ?? defaultSiteContent.homeImages.caregivers).map((url, index) => (
                    <div key={`caregiver-image-${index}`} className="space-y-2 rounded border border-slate-800 bg-slate-900/50 p-3">
                      <input
                        value={url}
                        onChange={(e) => updateCaregiverImage(index, e.target.value)}
                        placeholder={`Caregiver image ${index + 1} URL`}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                      />
                      {renderImagePicker(url, (asset) => updateCaregiverImage(index, asset.url))}
                    </div>
                  ))}
                </div>
              </div>
            </EditorSection>

            <EditorSection title="Navigation links">
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
            </EditorSection>

            <EditorSection
              title="Services"
              description="Add, edit, or remove service cards. New services generate detail pages automatically."
            >
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
                    <input
                      value={service.imageUrl ?? ""}
                      onChange={(e) => updateService(index, { imageUrl: e.target.value })}
                      placeholder="Service detail image URL"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                    />
                    {renderImagePicker(service.imageUrl, (asset) => updateService(index, { imageUrl: asset.url }))}
                    <input
                      value={service.imageAlt ?? ""}
                      onChange={(e) => updateService(index, { imageAlt: e.target.value })}
                      placeholder="Service detail image alt text"
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
                    {renderServiceDetailsEditor(
                      service,
                      index,
                      "w-full px-3 py-2 bg-slate-900 border border-slate-700"
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" onClick={addService} className="bg-teal hover:bg-teal/90">
                Add service card
              </Button>
            </EditorSection>

            {renderServicePagesEditor()}

            <EditorSection
              title="Articles"
              description="Add article pages that appear in the Resources section and create detail pages automatically."
            >
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
                    <input
                      value={article.imageUrl ?? ""}
                      onChange={(e) => updateArticle(index, { imageUrl: e.target.value })}
                      placeholder="Image URL"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700"
                    />
                    {renderImagePicker(article.imageUrl, (asset) => updateArticle(index, { imageUrl: asset.url }))}
                    <textarea
                      value={article.description}
                      onChange={(e) => updateArticle(index, { description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[80px]"
                    />
                    <textarea
                      value={article.content ?? ""}
                      onChange={(e) => updateArticle(index, { content: e.target.value })}
                      placeholder="Article page content"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 min-h-[120px]"
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={Boolean(article.featured)}
                        onChange={(e) => updateArticle(index, { featured: e.target.checked })}
                      />
                      Featured article
                    </label>
                  </div>
                ))}
              </div>
              <Button type="button" onClick={addArticle} className="bg-teal hover:bg-teal/90">
                Add article page
              </Button>
            </EditorSection>

            <EditorSection title="Footer & About">
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
            </EditorSection>
          </div>
      )}
          </div>

          <div className="space-y-6 xl:max-h-[calc(100vh-160px)] xl:overflow-y-auto xl:pr-2">
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
                  <p className="text-sm text-slate-600">Switch between the homepage, About, Resources, service pages, linked service pages, articles, or custom pages.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-slate-700">Preview page</span>
                    <select
                      value={previewPage}
                      onChange={(event) => {
                        const next = event.target.value as PreviewPage;
                        setPreviewPage(next);
                        setPreviewSlug("");
                      }}
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
                    >
                      <option value="home">Home</option>
                      <option value="about">About</option>
                      <option value="articles">Resources</option>
                      <option value="service">Service detail</option>
                      <option value="servicePage">Service linked page</option>
                      <option value="article">Article detail</option>
                      <option value="custom">Custom page</option>
                    </select>
                  </label>

                  {(previewPage === "service" || previewPage === "servicePage" || previewPage === "article" || previewPage === "custom") && (
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
                        {previewPage === "servicePage" && (
                          (draftCms.servicePages ?? []).length > 0 ? (
                            (draftCms.servicePages ?? []).map((page) => (
                              <option key={page.slug} value={page.slug}>
                                {page.title || page.slug || "Untitled service page"}
                              </option>
                            ))
                          ) : (
                            <option value="">No service linked pages available</option>
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
