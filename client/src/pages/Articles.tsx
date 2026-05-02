import { defaultSiteContent, type SiteContent } from "@shared/cms";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Articles() {
  const [cms, setCms] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-3xl font-serif font-bold text-teal no-underline">
            {cms.brandName}
          </Link>
          <Link href="/" className="text-sm font-bold uppercase tracking-wider text-navy no-underline hover:underline">
            Return home
          </Link>
        </div>
      </header>

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
              {article.featured ? (
                <p className="text-xs font-bold uppercase tracking-wider text-orange mb-3">
                  Featured
                </p>
              ) : null}
              <h2 className="text-2xl font-serif text-navy mb-3">{article.title}</h2>
              <p className="text-gray-600 leading-relaxed">{article.description}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
