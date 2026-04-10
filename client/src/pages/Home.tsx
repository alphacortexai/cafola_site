import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { defaultSiteContent, type SiteContent } from "@shared/cms";

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchLocation, setSearchLocation] = useState("");
  const [cms, setCms] = useState<SiteContent>(defaultSiteContent);
  const [rawCms, setRawCms] = useState(JSON.stringify(defaultSiteContent, null, 2));
  const [cmsStatus, setCmsStatus] = useState("CMS ready");

  const isAdminMode = useMemo(
    () => new URLSearchParams(window.location.search).get("admin") === "1",
    [],
  );

  useEffect(() => {
    const loadCms = async () => {
      try {
        const response = await fetch("/api/cms");
        if (!response.ok) throw new Error("Failed to load CMS");
        const payload = (await response.json()) as SiteContent;
        setCms(payload);
        setRawCms(JSON.stringify(payload, null, 2));
        setCmsStatus("CMS loaded");
      } catch {
        setCmsStatus("Using default CMS content");
      }
    };

    void loadCms();
  }, []);

  const saveCms = async () => {
    try {
      const parsed = JSON.parse(rawCms) as SiteContent;
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!response.ok) throw new Error("Failed to save CMS");
      setCms(parsed);
      setCmsStatus("CMS saved");
    } catch {
      setCmsStatus("Invalid JSON or save failed");
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % cms.testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + cms.testimonials.length) % cms.testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-serif font-bold" style={{ color: "#007e8a" }}>{cms.brandName}</div>
            <div className="text-xs text-gray-600">{cms.companyDescriptor}</div>
          </div>

          <nav className="hidden md:flex gap-8 items-center">
            {cms.navItems.map((item) => (
              <a key={item} href="#" className="text-gray-700 font-sans hover:underline" style={{ color: "#6c757d" }}>{item}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href="#" className="font-semibold text-sm hidden md:block" style={{ color: "#007e8a" }}>Find a location</a>
            <a href="tel:+18776977537" className="font-semibold text-sm" style={{ color: "#007e8a" }}>{cms.phone}</a>
          </div>
        </div>
      </header>

      <section className="relative h-96 md:h-[500px] overflow-hidden" style={{ background: "linear-gradient(to right, #2c3e50, #007e8a)" }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url("https://d2xsxph8kpxj0f.cloudfront.net/310519663269964698/G33c7Gr9Vjm6QbN5AtWjKi/hero-caregiver-senior-WfcaNGv39maDGZSj2Hmu4v.webp")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 to-teal/70" />

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">{cms.heroHeading}</h1>
          <p className="text-xl md:text-2xl font-serif text-white mb-8">{cms.heroSubheading}</p>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Enter ZIP code/City, State"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1 px-4 py-3 rounded-none border-0 font-sans"
            />
            <button className="text-white px-6 py-3 font-sans font-semibold rounded-none hover:opacity-90" style={{ backgroundColor: "#ff8c42" }}>
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-4" style={{ color: "#2c3e50" }}>{cms.servicesHeading}</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto font-sans">{cms.servicesIntro}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cms.services.map((service, idx) => (
              <div key={idx} className="bg-gray-50 p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-serif mb-3" style={{ color: "#007e8a" }}>{service.title}</h3>
                <p className="text-gray-700 font-sans text-sm mb-4">{service.description}</p>
                <a href="#" className="font-bold text-sm hover:underline" style={{ color: "#007e8a" }}>Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12" style={{ color: "#2c3e50" }}>
            Hear What Others Are Saying
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-none" style={{ border: "4px solid rgba(255, 140, 66, 0.3)" }}>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-orange text-orange" style={{ color: "#ff8c42" }} />
                ))}
              </div>
              <p className="text-xl font-sans text-gray-800 mb-6 italic">"{cms.testimonials[currentTestimonial]?.quote}"</p>
              <div className="border-t border-gray-200 pt-6">
                <p className="font-serif font-bold text-lg" style={{ color: "#2c3e50" }}>{cms.testimonials[currentTestimonial]?.author}</p>
                <p className="text-gray-600 font-sans text-sm">
                  {cms.testimonials[currentTestimonial]?.role}, {cms.testimonials[currentTestimonial]?.location}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={prevTestimonial} className="text-white p-3 rounded-none transition-colors hover:opacity-90" style={{ backgroundColor: "#007e8a" }}><ChevronLeft className="w-6 h-6" /></button>
              <div className="flex gap-2">
                {cms.testimonials.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentTestimonial(idx)} className="w-3 h-3 rounded-full transition-colors" style={{ backgroundColor: idx === currentTestimonial ? "#007e8a" : "#d1d5db" }} />
                ))}
              </div>
              <button onClick={nextTestimonial} className="text-white p-3 rounded-none transition-colors hover:opacity-90" style={{ backgroundColor: "#007e8a" }}><ChevronRight className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6" style={{ color: "#2c3e50" }}>{cms.storyHeading}</h2>
            {cms.storyParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-gray-700 font-sans text-lg mb-4 leading-relaxed">{paragraph}</p>
            ))}
          </div>
          <div className="bg-cover bg-center h-96" style={{ backgroundImage: 'url("https://d2xsxph8kpxj0f.cloudfront.net/310519663269964698/G33c7Gr9Vjm6QbN5AtWjKi/story-section-image-gtFgEp5xjw8psZqcTXPwhD.webp")' }} />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12" style={{ color: "#2c3e50" }}>{cms.resourcesHeading}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cms.articles.map((article, idx) => (
              <div key={idx} className={`bg-white rounded-none overflow-hidden ${article.featured ? "md:col-span-2 md:row-span-2" : ""}`}>
                <div className={`h-40 ${article.featured ? "md:h-64" : ""} rounded-none mb-4`} style={{ background: "linear-gradient(135deg, #007e8a, #2c3e50)" }} />
                <div className="p-6">
                  <h3 className={`font-serif mb-3 ${article.featured ? "text-2xl" : "text-lg"}`} style={{ color: "#2c3e50" }}>{article.title}</h3>
                  <p className="text-gray-600 font-sans text-sm mb-4">{article.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-8" style={{ color: "#2c3e50" }}>{cms.newsletterHeading}</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="First name" className="px-4 py-3 border border-gray-300 rounded-none font-sans" />
              <input type="text" placeholder="Last name" className="px-4 py-3 border border-gray-300 rounded-none font-sans" />
            </div>
            <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-none font-sans" />
            <button className="w-full text-white px-8 py-4 font-sans font-semibold rounded-none transition-colors hover:opacity-90" style={{ backgroundColor: "#007e8a" }}>
              Sign up
            </button>
          </form>
        </div>
      </section>

      {isAdminMode && (
        <section className="py-16 bg-slate-900 text-white">
          <div className="container mx-auto px-4 max-w-5xl space-y-4">
            <h2 className="text-3xl font-serif">CAFOLA CMS</h2>
            <p className="text-slate-300 text-sm">Edit site content as JSON and click Save. Status: {cmsStatus}</p>
            <textarea
              value={rawCms}
              onChange={(e) => setRawCms(e.target.value)}
              className="w-full min-h-[420px] p-4 bg-slate-950 border border-slate-700 font-mono text-sm"
            />
            <Button onClick={saveCms} className="bg-orange hover:bg-orange/90 text-white">Save CMS Content</Button>
          </div>
        </section>
      )}

      <footer className="text-white py-12" style={{ backgroundColor: "#2c3e50" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="font-sans text-sm">
              {cms.footerAddress.map((line) => <p key={line} className="mb-2">{line}</p>)}
              <p className="mb-2">Phone: <a href="tel:+18776977537" className="hover:opacity-80" style={{ color: "#ff8c42" }}>{cms.phone}</a></p>
            </div>
            <div className="font-sans text-sm">
              {cms.footerLinks.map((link) => <a key={link} href="#" className="block hover:opacity-80 mb-2" style={{ color: "#ff8c42" }}>{link}</a>)}
            </div>
          </div>
          <div className="border-t border-white/20 pt-8">
            <p className="font-sans text-sm text-center text-gray-300">© 2026 CAFOLA. Personalized in-home care and assistance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
