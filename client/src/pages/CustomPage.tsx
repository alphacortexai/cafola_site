import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { defaultSiteContent, type CustomPage as CmsCustomPage, type SiteContent } from "@shared/cms";
import { Phone } from "lucide-react";

type CustomPageProps = {
  previewCms?: SiteContent;
  previewSlug?: string;
};

const getNavHref = (item: string, cms: SiteContent) => {
  if (item === "Services") return "/#services";
  if (item === "Resources") return "/articles";
  if (item === "About Us") return "/about";
  if (item === "Careers") return "/#careers";
  if (item === "Contact") return "/#contact";
  const custom = cms.customPages.find((page) => page.title === item);
  if (custom) return `/pages/${custom.slug}`;
  return "#";
};

export default function CustomPage({ previewCms, previewSlug }: CustomPageProps) {
  const [, params] = useRoute("/pages/:slug");
  const [cms, setCms] = useState<SiteContent>(previewCms ?? defaultSiteContent);

  useEffect(() => {
    if (previewCms) {
      setCms(previewCms);
      return;
    }

    const loadCms = async () => {
      try {
        const response = await fetch("/api/cms");
        if (!response.ok) throw new Error("Failed to load CMS");
        const payload = (await response.json()) as SiteContent;
        setCms(payload);
      } catch {
        // fallback to defaults
      }
    };

    void loadCms();
  }, [previewCms]);

  const slug = previewSlug ?? params?.slug;
  const page = cms.customPages.find((item) => item.slug === slug);

  if (!page) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif text-navy">Page not found</h1>
          <Link href="/" className="text-teal no-underline hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-3xl font-serif font-bold text-teal no-underline">
            {cms.brandName}
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            {cms.navItems.map((item) => (
              <a key={item} href={getNavHref(item, cms)} className="text-gray-700 font-sans font-bold hover:text-teal no-underline text-sm uppercase tracking-wide">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${cms.phone}`} className="font-bold text-sm no-underline hover:underline flex items-center gap-2" style={{ color: "#007e8a" }}>
              <Phone className="w-4 h-4" />
              {cms.phone}
            </a>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-orange font-bold">{page.title}</p>
            <h1 className="text-4xl font-serif text-navy mt-4">{page.title}</h1>
            <p className="mt-4 text-gray-600 text-lg">{page.description}</p>
          </div>
          <div className="prose max-w-none text-gray-700 whitespace-pre-line">{page.content}</div>
        </div>
      </main>
    </div>
  );
}
