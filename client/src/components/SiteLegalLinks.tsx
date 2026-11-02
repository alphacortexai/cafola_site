import { Link } from "wouter";

export function SiteLegalLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-6 ${className}`}>
      <Link href="/privacy" className="hover:text-white no-underline">
        Privacy Policy
      </Link>
      <a href="/sitemap.xml" className="hover:text-white no-underline">
        Sitemap
      </a>
    </div>
  );
}
