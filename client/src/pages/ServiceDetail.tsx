import { type FormEvent, useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { defaultSiteContent, type ServicePage, type ServicePageSection, type SiteContent } from "@shared/cms";
import SiteHeader from "@/components/SiteHeader";
import { ChevronRight, Phone, MapPin, CheckCircle2 } from "lucide-react";

type ServiceDetailProps = {
  previewCms?: SiteContent;
  previewSlug?: string;
};


function SectionMedia({ section }: { section: ServicePageSection }) {
  if (!section.imageUrl) return null;

  if (section.mediaType === "video") {
    return <video src={section.imageUrl} className="w-full aspect-[16/10] object-cover" controls />;
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

function InlinePageSection({ section }: { section: ServicePageSection }) {
  const position = section.imagePosition ?? "full";

  if (position === "left" || position === "right") {
    return (
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className={position === "right" ? "md:order-2" : undefined}>
          <SectionMedia section={section} />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl md:text-3xl font-serif text-navy">{section.title}</h3>
          <p className="description-text text-gray-700 whitespace-pre-line">{section.description}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <SectionMedia section={section} />
      <div className="max-w-3xl">
        <h3 className="text-2xl md:text-3xl font-serif text-navy">{section.title}</h3>
        <p className="mt-4 description-text text-gray-700 whitespace-pre-line">{section.description}</p>
      </div>
    </section>
  );
}

function InlineServicePage({ page }: { page: ServicePage }) {
  return (
    <section className="mb-14 rounded-sm border border-gray-100 bg-gray-50 p-6 md:p-8">
      <div className="mb-8 max-w-4xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-orange">Service details</p>
        <h2 className="text-3xl md:text-4xl font-serif text-navy">{page.title}</h2>
        {page.description ? <p className="mt-4 description-text text-gray-700">{page.description}</p> : null}
        {page.content ? <p className="mt-6 description-text text-gray-700 whitespace-pre-line">{page.content}</p> : null}
      </div>
      {(page.sections ?? []).length > 0 ? (
        <div className="space-y-12">
          {(page.sections ?? []).map((section, index) => (
            <InlinePageSection key={`${section.title}-${index}`} section={section} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

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

export default function ServiceDetail({ previewCms, previewSlug }: ServiceDetailProps) {
  const [, params] = useRoute("/services/:slug");
  const slug = previewSlug ?? params?.slug;
  const [cms, setCms] = useState<SiteContent>(previewCms ?? defaultSiteContent);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    talkToUs: "",
  });
  const [formStatus, setFormStatus] = useState<string>("");

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
        // Fallback to default
      }
    };
    void loadCms();
  }, [previewCms]);

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("Sending...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          message: `Service request for: ${service?.title ?? "Unknown service"}${formData.talkToUs.trim() ? `

Talk to us: ${formData.talkToUs.trim()}` : ""}`,
          source: `service-${slug ?? "unknown"}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not submit form");
      }

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        talkToUs: "",
      });
      setFormStatus("Thanks! We received your request.");
    } catch {
      setFormStatus("Sorry, we could not submit your request.");
    }
  };

  // Find the service based on slug
  const service = cms.services.find(
    (s) => s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );
  const inlineServicePages = (service?.details ?? [])
    .filter((detail) => detail.inlineLinkedPage && detail.linkPageSlug)
    .map((detail) => (cms.servicePages ?? []).find((page) => page.slug === detail.linkPageSlug))
    .filter((page): page is ServicePage => Boolean(page));
  const visibleDetails = (service?.details ?? []).filter(
    (detail) => !(detail.inlineLinkedPage && detail.linkPageSlug)
  );

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif mb-4">Service Not Found</h1>
          <a href="/" className="text-teal hover:underline font-bold">Return Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader cms={cms} />

      <main>
        {/* Hero Section */}
        <section className="bg-navy py-16 md:py-24 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-teal/10" />
          <div className="container relative z-10">
            <nav className="flex items-center gap-2 text-xs mb-6 text-gray-400 uppercase tracking-widest font-bold">
              <a href="/" className="hover:text-white no-underline">Home</a>
              <ChevronRight className="w-4 h-4" />
              <a href="/#services" className="hover:text-white no-underline">Services</a>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{service.title}</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">{service.title}</h1>
            <p className="text-xl md:text-2xl max-w-3xl font-serif leading-relaxed opacity-90">
              {service.description}
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none text-gray-700 font-sans space-y-8">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.imageAlt || service.title}
                    className="mb-12 w-full aspect-[16/8] object-cover shadow-xl"
                  />
                ) : null}
                <div className="bg-gray-50 p-8 border-l-4 border-teal mb-12">
                  <p className="description-text text-navy">
                    {service.longDescription}
                  </p>
                </div>
                
                {inlineServicePages.map((page) => (
                  <InlineServicePage key={page.slug} page={page} />
                ))}

                {visibleDetails.length > 0 && (
                  <>
                    <h2 className="text-3xl md:text-4xl font-serif mb-8 text-navy">What We Offer</h2>
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                      {visibleDetails.map((detail, i) => {
                        const linkedPage = detail.linkPageSlug
                          ? (cms.servicePages ?? []).find((page) => page.slug === detail.linkPageSlug)
                          : null;
                        return (
                          <div key={i} className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="flex flex-col items-center gap-3 mb-3">
                              <CheckCircle2 className="w-5 h-5 text-orange flex-shrink-0" />
                              <h3 className="text-xl font-serif text-navy">{detail.title}</h3>
                            </div>
                            <p className="description-text text-gray-600">
                              {detail.description}
                            </p>
                            {linkedPage ? (
                              <Link
                                href={`/services/${slug}/${linkedPage.slug}`}
                                className="mt-5 inline-flex items-center gap-2 text-teal font-bold text-sm tracking-wide no-underline hover:underline"
                              >
                                Learn More <ChevronRight className="w-4 h-4" />
                              </Link>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="mt-16 p-8 bg-navy text-white">
                  <h3 className="text-2xl font-serif mb-4">Our Commitment</h3>
                  <p className="description-text text-gray-300">
                    At {cms.brandName}, we focus on promoting independence, dignity, and self-worth. Our qualified team works to ensure continuity of care structured to facilitate complication prevention and complete healing.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar / CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white border-t-8 border-orange shadow-2xl p-8">
                  <h3 className="text-2xl font-serif mb-6 text-navy">Start Care Now</h3>
                  <form className="space-y-4" onSubmit={submitContact}>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">First Name</label>
                      <input
                        required
                        type="text"
                        value={formData.firstName}
                        onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(event) => setFormData((prev) => ({ ...prev, lastName: event.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Talk to us</label>
                      <textarea
                        rows={4}
                        value={formData.talkToUs}
                        onChange={(event) => setFormData((prev) => ({ ...prev, talkToUs: event.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans"
                        placeholder="Tell us about your care needs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans"
                      />
                    </div>
                    <button type="submit" className="w-full bg-orange text-white py-4 font-bold uppercase tracking-widest hover:bg-orange/90 transition-all shadow-lg mt-4">
                      Submit Request
                    </button>
                    {formStatus && <p className="text-xs text-gray-500">{formStatus}</p>}
                  </form>
                  <p className="text-[10px] mt-4 text-gray-400 leading-relaxed">
                    By submitting this form you are consenting to be contacted by {cms.brandName} regarding our services.
                  </p>
                </div>

                <div className="bg-gray-50 p-8 border border-gray-100">
                  <h3 className="text-xl font-serif mb-6 text-navy">Need help right now?</h3>
                  <div className="space-y-6">
                    <a href={`tel:${cms.phone}`} className="flex items-center gap-3 text-teal hover:underline no-underline font-bold text-lg">
                      <Phone className="w-5 h-5" />
                      {cms.phone}
                    </a>
                    <div className="flex items-start gap-3 text-gray-600 text-sm">
                      <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-orange" />
                      <span>{cms.footerAddress.join(", ")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Services */}
        <section className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="container">
            <h2 className="text-3xl font-serif mb-12 text-center text-navy">Explore Our Other Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cms.services
                .filter((s) => s.title !== service.title)
                .slice(0, 3)
                .map((s, idx) => (
                  <div key={idx} className="bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                    <div className="text-4xl mb-6">{s.icon}</div>
                    <h3 className="text-xl font-serif mb-4 text-navy">{s.title}</h3>
                    <p className="description-text text-gray-600 mb-8 line-clamp-2">{s.description}</p>
                    <Link 
                      href={`/services/${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} 
                      className="mt-auto text-teal font-bold text-sm tracking-wide hover:underline no-underline inline-flex items-center gap-2 cursor-pointer"
                    >
                      Learn More <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy text-white pt-16 pb-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-1">
              <div className="text-2xl font-serif font-bold mb-6 text-white">{cms.brandName}</div>
              <div className="space-y-2 text-gray-400 text-sm font-sans">
                {cms.footerAddress.map((line) => <p key={line}>{line}</p>)}
                <p className="pt-4 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange" />
                  <a href={`tel:${cms.phone}`} className="text-white hover:text-orange no-underline font-bold">{cms.phone}</a>
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold mb-8 text-gray-500">Quick Links</h4>
              <div className="space-y-4">
                {cms.footerLinks.map((link) => (
                  <a key={link} href="#" className="block text-orange hover:text-white no-underline font-bold text-sm transition-colors">{link}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-xs">
            © 2026 {cms.brandName}. All rights reserved. Personalized in-home care and assistance.
          </div>
        </div>
      </footer>
    </div>
  );
}
