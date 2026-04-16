import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { defaultSiteContent, type SiteContent } from "@shared/cms";
import { ChevronRight, Phone, MapPin, CheckCircle2 } from "lucide-react";

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:slug");
  const slug = params?.slug;
  const [cms, setCms] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
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
  }, []);

  // Find the service based on slug
  const service = cms.services.find(
    (s) => s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="text-2xl font-serif font-bold no-underline hover:no-underline" style={{ color: "#007e8a" }}>{cms.brandName}</a>
            <div className="text-xs text-gray-600 hidden sm:block uppercase tracking-wider font-bold">{cms.companyDescriptor}</div>
          </div>

          <nav className="hidden md:flex gap-8 items-center">
            {cms.navItems.map((item) => (
              <a key={item} href={item === "Services" ? "/#services" : "#"} className="text-gray-700 font-sans font-bold hover:text-teal no-underline text-sm uppercase tracking-wide">{item}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href={`tel:${cms.phone}`} className="font-bold text-sm no-underline hover:underline flex items-center gap-2" style={{ color: "#007e8a" }}>
              <Phone className="w-4 h-4" />
              {cms.phone}
            </a>
          </div>
        </div>
      </header>

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
                <div className="bg-gray-50 p-8 border-l-4 border-teal mb-12">
                  <p className="text-xl leading-relaxed text-navy font-serif italic">
                    {service.longDescription}
                  </p>
                </div>
                
                {service.details && service.details.length > 0 && (
                  <>
                    <h2 className="text-3xl md:text-4xl font-serif mb-8 text-navy">What We Offer</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {service.details.map((detail, i) => (
                        <div key={i} className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-orange flex-shrink-0" />
                            <h3 className="text-xl font-serif text-navy">{detail.title}</h3>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {detail.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-16 p-8 bg-navy text-white">
                  <h3 className="text-2xl font-serif mb-4">Our Commitment</h3>
                  <p className="text-gray-300 leading-relaxed">
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
                  <form className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">First Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Last Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Phone</label>
                      <input type="tel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Email</label>
                      <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans" />
                    </div>
                    <button className="w-full bg-orange text-white py-4 font-bold uppercase tracking-widest hover:bg-orange/90 transition-all shadow-lg mt-4">
                      Submit Request
                    </button>
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
                    <p className="text-gray-600 text-sm mb-8 line-clamp-2 leading-relaxed">{s.description}</p>
                    <a 
                      href={`/services/${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} 
                      className="mt-auto text-teal font-bold text-xs uppercase tracking-widest hover:underline no-underline inline-flex items-center gap-2"
                    >
                      Learn more <ChevronRight className="w-4 h-4" />
                    </a>
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
