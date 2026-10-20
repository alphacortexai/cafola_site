import { Globe, Mail, Phone } from "lucide-react";
import { resolveSiteContact, toTelHref, type SiteContent } from "@shared/cms";

export function HeaderPhones({ cms }: { cms: SiteContent }) {
  const { phones } = resolveSiteContact(cms);

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      {phones.map((phone) => (
        <a
          key={phone}
          href={toTelHref(phone)}
          className="font-bold text-[10px] sm:text-xs md:text-sm flex items-center gap-1 sm:gap-1.5 no-underline text-navy hover:text-teal"
          aria-label={`Call ${phone}`}
        >
          <Phone className="w-3.5 h-3.5 text-orange shrink-0" />
          <span className="leading-none whitespace-nowrap">{phone}</span>
        </a>
      ))}
    </div>
  );
}

export function SiteContactList({
  cms,
  tone = "dark",
}: {
  cms: SiteContent;
  tone?: "dark" | "light";
}) {
  const { phones, email, website } = resolveSiteContact(cms);
  const linkClass =
    tone === "dark"
      ? "text-white hover:text-orange no-underline font-bold break-all"
      : "text-teal hover:underline no-underline font-bold break-all";
  const iconClass = tone === "dark" ? "w-4 h-4 text-orange shrink-0" : "w-5 h-5 text-orange shrink-0";

  return (
    <div className={tone === "dark" ? "space-y-3 text-sm font-sans" : "space-y-4 text-base font-sans"}>
      {phones.map((phone) => (
        <p key={phone} className="flex items-center gap-2">
          <Phone className={iconClass} />
          <a href={toTelHref(phone)} className={linkClass}>
            {phone}
          </a>
        </p>
      ))}
      <p className="flex items-center gap-2">
        <Mail className={iconClass} />
        <a href={`mailto:${email}`} className={linkClass}>
          {email}
        </a>
      </p>
      <p className="flex items-center gap-2">
        <Globe className={iconClass} />
        <a href={website} className={linkClass}>
          {website}
        </a>
      </p>
    </div>
  );
}
