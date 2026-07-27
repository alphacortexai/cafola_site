import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  defaultSiteContent,
  type ServicePage,
  type ServicePageSection,
  type SiteContent,
} from "@shared/cms";
import SiteHeader from "@/components/SiteHeader";
import { ChevronRight, Phone } from "lucide-react";

type ServicePageDetailProps = {
  previewCms?: SiteContent;
  previewSlug?: string;
};

const getNavHref = (item: string, cms: SiteContent) => {
  if (item === "Services") return "/#services";
  if (item === "Resources") return "/articles";
  if (item === "About Us") return "/about";
  if (item === "Careers") return "/#careers";
  if (item === "Contact") return "/#contact";
  const custom = cms.customPages.find(page => page.title === item);
  if (custom) return `/pages/${custom.slug}`;
  return "#";
};

const getServiceSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function SectionMedia({ section }: { section: ServicePageSection }) {
  if (!section.imageUrl) return null;

  if (section.mediaType === "video") {
    return (
      <video
        src={section.imageUrl}
        className="w-full aspect-[16/10] object-cover"
        controls
      />
    );
  }

  return (
    <img
      src={section.imageUrl}
      alt={section.imageAlt || section.title}
      className="w-full aspect-[16/10] object-cover"
      loading="lazy"
    />
  );
}

function PageSection({ section }: { section: ServicePageSection }) {
  const position = section.imagePosition ?? "full";

  if (position === "left" || position === "right") {
    return (
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className={position === "right" ? "md:order-2" : undefined}>
          <SectionMedia section={section} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-serif text-navy">{section.title}</h2>
          <p className="description-text text-gray-700 whitespace-pre-line">
            {section.description}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <SectionMedia section={section} />
      <div className="max-w-3xl">
        <h2 className="text-3xl font-serif text-navy">{section.title}</h2>
        <p className="mt-4 description-text text-gray-700 whitespace-pre-line">
          {section.description}
        </p>
      </div>
    </section>
  );
}

export default function ServicePageDetail({
  previewCms,
  previewSlug,
}: ServicePageDetailProps) {
  const [, params] = useRoute("/services/:serviceSlug/:pageSlug");
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

  const page = useMemo<ServicePage | null>(() => {
    const slug = previewSlug ?? params?.pageSlug;
    if (!slug) return null;
    return (cms.servicePages ?? []).find(item => item.slug === slug) ?? null;
  }, [cms.servicePages, params?.pageSlug, previewSlug]);

  const parentService = useMemo(() => {
    if (!page) return null;
    return (
      cms.services.find(service =>
        (service.details ?? []).some(
          detail => detail.linkPageSlug === page.slug
        )
      ) ?? null
    );
  }, [cms.services, page]);

  if (!page) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif text-navy">
            Service page not found
          </h1>
          <Link href="/" className="text-teal no-underline hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader cms={cms} />

      <main>
        <section className="bg-navy py-16 md:py-24 text-white">
          <div className="container">
            <nav className="flex flex-wrap items-center gap-2 text-xs mb-6 text-gray-400 uppercase tracking-widest font-bold">
              <Link href="/" className="hover:text-white no-underline">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/#services" className="hover:text-white no-underline">
                Services
              </Link>
              {parentService ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <Link
                    href={`/services/${getServiceSlug(parentService.title)}`}
                    className="hover:text-white no-underline"
                  >
                    {parentService.title}
                  </Link>
                </>
              ) : null}
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{page.title}</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
              {page.title}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl font-serif leading-relaxed opacity-90">
              {page.description}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
          {page.heroMediaType === "video" && page.heroImageUrl ? (
            <video
              src={page.heroImageUrl}
              className="w-full aspect-[16/7] object-cover mb-10"
              controls
            />
          ) : (
            <img
              src={
                page.heroImageUrl ||
                cms.servicePageDefaultImageUrl ||
                defaultSiteContent.servicePageDefaultImageUrl
              }
              alt={page.title}
              className="w-full aspect-[16/7] object-cover mb-10"
            />
          )}
          {page.content ? (
            <p className="description-text text-gray-700 whitespace-pre-line max-w-4xl">
              {page.content}
            </p>
          ) : null}
          <div className="mt-14 space-y-16">
            {(page.sections ?? []).map((section, index) => (
              <PageSection
                key={`${section.title}-${index}`}
                section={section}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
