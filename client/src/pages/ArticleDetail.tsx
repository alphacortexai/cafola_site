import { defaultSiteContent, type SiteContent } from "@shared/cms";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";

const FALLBACK_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663269964698/nXeqdbNLjMDKrnNe.jpg";

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:slug");
  const [cms, setCms] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    const loadCms = async () => {
      try {
        const response = await fetch("/api/cms");
        if (!response.ok) throw new Error("Failed");
        const payload = (await response.json()) as SiteContent;
        setCms(payload);
      } catch {
        // fallback to defaults
      }
    };

    void loadCms();
  }, []);

  const article = useMemo(() => {
    if (!params?.slug) return null;
    return cms.articles.find((item) => item.slug === params.slug) ?? null;
  }, [cms.articles, params?.slug]);

  if (!article) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif text-navy">Article not found</h1>
          <Link href="/articles" className="text-teal no-underline hover:underline">Back to articles</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-3xl font-serif font-bold text-teal no-underline">{cms.brandName}</Link>
          <Link href="/articles" className="text-sm font-bold uppercase tracking-wider text-navy no-underline hover:underline">All Articles</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <p className="text-xs uppercase tracking-wider text-orange font-bold mb-3">{article.section ?? "Resources"}</p>
        <h1 className="text-4xl font-serif text-navy mb-4">{article.title}</h1>
        <p className="text-lg text-gray-600 mb-8">{article.description}</p>
        <img src={article.imageUrl ?? FALLBACK_IMAGE} alt={article.title} className="w-full aspect-[16/7] object-cover mb-8" />
        <p className="text-gray-700 leading-8 whitespace-pre-line">{article.content ?? article.description}</p>
      </main>
    </div>
  );
}
