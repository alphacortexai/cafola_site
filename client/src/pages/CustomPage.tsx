import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { defaultSiteContent, type CustomPage as CmsCustomPage, type SiteContent } from "@shared/cms";
import SiteHeader from "@/components/SiteHeader";
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
      <SiteHeader cms={cms} />

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
