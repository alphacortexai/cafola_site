import { Link } from "wouter";
import { defaultSiteContent, type SiteContent } from "@shared/cms";
import { HeaderPhones } from "@/components/SiteContact";

type SiteHeaderProps = {
  cms: SiteContent;
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
          className={`${compact ? "h-9 w-9 md:h-11 md:w-11" : "h-9 w-9 sm:h-10 sm:w-10 md:h-14 md:w-14"} shrink-0 object-contain`}
        />
      ) : null}
      <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-teal">{cms.brandName}</span>
    </Link>
  );
}

export default function SiteHeader({ cms }: SiteHeaderProps) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-3 md:py-4 flex items-center justify-between gap-2 sm:gap-4">
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

          <HeaderPhones cms={cms} />
        </div>
      </header>
      <div className="h-[72px] md:h-[88px]" />
    </>
  );
}
