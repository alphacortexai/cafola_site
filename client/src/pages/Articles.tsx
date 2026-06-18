import { defaultSiteContent, type SiteContent } from "@shared/cms";
import SiteHeader from "@/components/SiteHeader";
import { useEffect, useState } from "react";
import { Link } from "wouter";

type ArticlesProps = {
  previewCms?: SiteContent;
};

const DEFAULT_ARTICLE_IMAGES = [
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663269964698/nXeqdbNLjMDKrnNe.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663269964698/RlyEdRBUevkWVZSQ.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663269964698/ONOUdGEpIDXDmimL.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663269964698/nXeqdbNLjMDKrnNe.jpg",
];

const getNavHref = (item: string, cms: SiteContent) => {
  if (item === "Services") return "/#services";
  if (item === "Resources") return "/articles";
  if (item === "About Us") return "/about";
  if (item === "Careers") return "/#careers";
  if (item === "Contact") return "/#contact";
  const custom = cms.customPages.find((page) => page.title === item);
  if (custom) return `/pages/${custom.slug}`;
  return "/";
};

export default function Articles({ previewCms }: ArticlesProps) {
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
        // Use defaults
      }
    };

    void loadCms();
  }, [previewCms]);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader cms={cms} />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif text-navy mb-4">Articles & Resources</h1>
        <p className="text-gray-600 mb-10 max-w-3xl">
          Browse the latest articles from our care team. This content is managed in the Admin CMS Articles section.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cms.articles.map((article, index) => (
            <article
              key={`${article.title}-${index}`}
              className="border border-gray-200 p-6 bg-white"
            >
              <img
                src={article.imageUrl ?? DEFAULT_ARTICLE_IMAGES[index % DEFAULT_ARTICLE_IMAGES.length]}
                alt={article.title}
                className="w-full aspect-[16/9] object-cover mb-4"
                loading="lazy"
              />
              {article.featured ? (
                <p className="text-xs font-bold uppercase tracking-wider text-orange mb-3">
                  Featured
                </p>
              ) : null}
              <h2 className="text-2xl font-serif text-navy mb-3">{article.title}</h2>
              <p className="text-gray-600 leading-relaxed">{article.description}</p>
              <Link href={`/articles/${article.slug}`} className="inline-block mt-4 text-teal font-bold uppercase text-xs tracking-wider no-underline hover:underline">
                Read more
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
