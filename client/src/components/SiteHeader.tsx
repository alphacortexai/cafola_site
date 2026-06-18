import { Phone } from "lucide-react";
import { Link } from "wouter";
import { defaultSiteContent, type SiteContent } from "@shared/cms";

type SiteHeaderProps = {
  cms: SiteContent;
  showTopBar?: boolean;
};

const getNavHref = (item: string, cms: SiteContent) => {
  if (item === "Services") return "/#services";
  if (item === "Resources") return "/articles";
  if (item === "About Us") return "/about";
  if (item === "Careers") return "/#careers";
  if (item === "Contact") return "/#contact";
  const custom = (cms.customPages ?? []).find((page) => page.title === item);
  if (custom) return `/pages/${custom.slug}`;
  return "#";
};

export function BrandLogo({ cms, compact = false }: { cms: SiteContent; compact?: boolean }) {
  const logoUrl = cms.logoUrl ?? defaultSiteContent.logoUrl;

  return (
    <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${cms.brandName} logo`}
          className={`${compact ? "h-9 w-9 md:h-11 md:w-11" : "h-10 w-10 md:h-14 md:w-14"} shrink-0 object-contain`}
        />
      ) : null}
      <span className="text-2xl md:text-3xl font-serif font-bold text-teal">{cms.brandName}</span>
    </Link>
  );
}

export default function SiteHeader({ cms, showTopBar = false }: SiteHeaderProps) {
  return (
    <>
      {showTopBar ? (
        <div className="bg-navy text-white py-2 hidden md:block">
          <div className="container flex justify-end gap-6 text-xs font-sans">
            <a href="#" className="hover:text-orange no-underline">Medical & Community Partners</a>
            <a href="#" className="hover:text-orange no-underline">Franchise Opportunities</a>
          </div>
        </div>
      ) : null}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo cms={cms} />
            <div className="text-[10px] md:text-xs text-gray-600 leading-tight hidden sm:block uppercase tracking-wider font-bold">
              {cms.companyDescriptor}
            </div>
          </div>

          <nav className="hidden lg:flex gap-8 items-center">
            {(cms.navItems ?? []).map((item) => (
              <a key={item} href={getNavHref(item, cms)} className="text-gray-700 font-sans font-bold hover:text-teal no-underline text-sm uppercase tracking-wide">
                {item}
              </a>
            ))}
          </nav>

          <a href={`tel:${cms.phone}`} className="font-bold text-xs md:text-base flex items-center gap-2 no-underline text-teal shrink-0">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">{cms.phone}</span>
          </a>
        </div>
      </header>
      <div className={showTopBar ? "h-[72px] md:h-[104px]" : "h-[72px] md:h-[88px]"} />
    </>
  );
}
