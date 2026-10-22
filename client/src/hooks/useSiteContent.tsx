import { useEffect, useState } from "react";
import { defaultSiteContent, type SiteContent } from "@shared/cms";

export function useSiteContent(previewCms?: SiteContent) {
  const [cms, setCms] = useState<SiteContent>(previewCms ?? defaultSiteContent);
  const [ready, setReady] = useState(Boolean(previewCms));

  useEffect(() => {
    if (previewCms) {
      setCms(previewCms);
      setReady(true);
      return;
    }

    let cancelled = false;

    const loadCms = async () => {
      try {
        const response = await fetch("/api/cms");
        if (!response.ok) throw new Error("Failed to load CMS");
        const payload = (await response.json()) as SiteContent;
        if (!cancelled) setCms(payload);
      } catch {
        // Keep the bundled content if the live CMS cannot be loaded.
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void loadCms();

    return () => {
      cancelled = true;
    };
  }, [previewCms]);

  return { cms, ready };
}

export function ContentLoading() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <p className="font-serif text-2xl text-navy">Loading...</p>
    </div>
  );
}
