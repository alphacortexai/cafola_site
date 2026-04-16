import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Phone, MapPin, CheckCircle2, Award } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { defaultSiteContent, type SiteContent } from "@shared/cms";
import { Link } from "wouter";

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
      {/* Top Bar */}
      <div className="bg-navy text-white py-2 hidden md:block">
        <div className="container flex justify-end gap-6 text-xs font-sans">
          <a href="#" className="hover:text-orange no-underline">Medical & Community Partners</a>
          <a href="#" className="hover:text-orange no-underline">Franchise Opportunities</a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl md:text-3xl font-serif font-bold no-underline" style={{ color: "#007e8a" }}>{cms.brandName}</Link>
            <div className="text-[10px] md:text-xs text-gray-600 leading-tight hidden sm:block uppercase tracking-wider font-bold">{cms.companyDescriptor}</div>
          </div>

          <nav className="hidden lg:flex gap-8 items-center">
            {cms.navItems.map((item) => {
              let href = "#";
              if (item === "Services") href = "#services";
              if (item === "About Us") href = "/about";
              return (
                <a key={item} href={href} className="text-gray-700 font-sans font-bold hover:text-teal no-underline text-sm uppercase tracking-wide">{item}</a>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 md:gap-8">
            <a href="#" className="font-bold text-sm hidden md:block no-underline hover:underline" style={{ color: "#007e8a" }}>Find a location</a>
            <a href={`tel:${cms.phone}`} className="font-bold text-sm md:text-base flex items-center gap-2 no-underline" style={{ color: "#007e8a" }}>
              <Phone className="w-4 h-4" />
              {cms.phone}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://d2xsxph8kpxj0f.cloudfront.net/310519663269964698/G33c7Gr9Vjm6QbN5AtWjKi/hero-caregiver-senior-WfcaNGv39maDGZSj2Hmu4v.webp")',
          }}
        />
        <div className="absolute inset-0 bg-navy/40" />
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-tight">
              {cms.brandName} <br />
              <span className="text-3xl md:text-5xl opacity-90">{cms.heroSubheading}</span>
            </h1>
            
            <div className="mt-12 bg-white p-2 flex flex-col md:flex-row gap-2 max-w-lg shadow-2xl">
              <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-gray-200">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Enter ZIP code/City, State"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full py-4 border-0 focus:ring-0 font-sans text-navy outline-none"
                />
              </div>
              <button className="bg-teal text-white px-8 py-4 font-sans font-bold uppercase tracking-widest hover:bg-teal-dark transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-6 text-navy">{cms.servicesHeading}</h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto font-sans text-lg">{cms.servicesIntro}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cms.services.map((service, idx) => (
              <div key={idx} className="group flex flex-col h-full border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 bg-white">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <h3 className="text-2xl font-serif mb-4 text-navy group-hover:text-teal transition-colors">{service.title}</h3>
                <p className="text-gray-600 font-sans text-sm mb-8 flex-grow leading-relaxed">{service.description}</p>
                  <Link 
                  href={`/services/${service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}")}`} 
                  className="font-bold text-sm uppercase tracking-widest text-teal hover:underline no-underline inline-flex items-center gap-2"
                >
                  Learn more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Card Section */}
      <section className="py-20 md:py-32 bg-white border-t border-gray-100">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-orange text-xs font-bold uppercase tracking-widest">About CAFOLA</span>
              <h2 className="text-4xl md:text-5xl font-serif mb-6 text-navy mt-2">Professional Care with a Personal Touch</h2>
              <p className="text-gray-700 font-sans text-lg leading-relaxed mb-6">
                {cms.aboutUs.headline}
              </p>
              <p className="text-gray-600 font-sans text-base leading-relaxed mb-8">
                {cms.aboutUs.description}
              </p>
              <Link href="/about" className="inline-block border-2 border-teal text-teal px-10 py-4 font-bold uppercase tracking-widest hover:bg-teal hover:text-white transition-all duration-300 no-underline">
                Learn More About Us
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-teal/20 to-navy/20 p-12 rounded-none aspect-square flex flex-col items-center justify-center text-center">
                <Award className="w-16 h-16 text-teal mb-6" />
                <h3 className="text-3xl font-serif text-navy mb-4">10+ Years</h3>
                <p className="text-gray-700 font-sans text-lg">of Professional Nursing Care Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Two Column */}
      <section className="bg-gray-50 py-16">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-teal p-12 text-white flex flex-col items-center text-center">
            <h3 className="text-3xl font-serif mb-6">Already know which services you need?</h3>
            <button className="mt-auto bg-white text-teal px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
              Connect with us
            </button>
          </div>
          <div className="bg-navy p-12 text-white flex flex-col items-center text-center">
            <h3 className="text-3xl font-serif mb-6">Not sure what types of care you need?</h3>
            <button className="mt-auto bg-orange text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-orange/90 transition-colors">
              Let's find out
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 text-navy">
            Hear What Others Are Saying
          </h2>

          <div className="max-w-4xl mx-auto relative">
            <div className="bg-white p-10 md:p-20 shadow-xl border-t-8 border-orange">
              <div className="flex gap-1 mb-8 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-orange text-orange" />
                ))}
              </div>
              <p className="text-2xl md:text-3xl font-serif text-navy mb-10 italic text-center leading-relaxed">
                "{cms.testimonials[currentTestimonial]?.quote}"
              </p>
              <div className="text-center">
                <p className="font-serif font-bold text-xl text-navy">{cms.testimonials[currentTestimonial]?.author}</p>
                <p className="text-gray-500 font-sans text-sm uppercase tracking-widest mt-2">
                  {cms.testimonials[currentTestimonial]?.role} • {cms.testimonials[currentTestimonial]?.location}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-12">
              <button onClick={prevTestimonial} className="bg-teal text-white p-4 hover:bg-teal-dark transition-colors shadow-lg"><ChevronLeft className="w-6 h-6" /></button>
              <div className="flex gap-3">
                {cms.testimonials.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentTestimonial(idx)} className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentTestimonial ? "bg-teal w-8" : "bg-gray-300"}`} />
                ))}
              </div>
              <button onClick={nextTestimonial} className="bg-teal text-white p-4 hover:bg-teal-dark transition-colors shadow-lg"><ChevronRight className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-serif mb-8 text-navy">{cms.storyHeading}</h2>
            <div className="space-y-6">
              {cms.storyParagraphs.map((paragraph, i) => (
                <p key={i} className="text-gray-700 font-sans text-lg leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <button className="mt-10 border-2 border-teal text-teal px-10 py-4 font-bold uppercase tracking-widest hover:bg-teal hover:text-white transition-all duration-300">
              Learn More
            </button>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-[4/3] bg-cover bg-center shadow-2xl" style={{ backgroundImage: 'url("https://d2xsxph8kpxj0f.cloudfront.net/310519663269964698/G33c7Gr9Vjm6QbN5AtWjKi/story-section-image-gtFgEp5xjw8psZqcTXPwhD.webp")' }} />
            <div className="absolute -bottom-8 -left-8 bg-orange p-8 text-white hidden md:block shadow-xl">
              <p className="text-4xl font-serif font-bold">25+</p>
              <p className="text-sm uppercase tracking-widest font-bold">Years of Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Caregivers Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-8 text-navy">Our Nationally Recognized Caregivers</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg mb-12">
            Each year, we honor caregivers who go above and beyond to provide exceptional care and support to our clients and their families.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 aspect-square flex items-center justify-center border border-gray-100">
                <span className="text-gray-400 font-serif italic">Caregiver Photo {i}</span>
              </div>
            ))}
          </div>
          <button className="bg-teal text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-teal-dark transition-colors">
            Meet Our Caregivers
          </button>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 md:py-32 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-serif text-navy mb-4">{cms.resourcesHeading}</h2>
              <p className="text-gray-600 text-lg">Expert advice and practical tips for navigating the aging journey.</p>
            </div>
            <a href="#" className="text-teal font-bold uppercase tracking-widest hover:underline no-underline flex items-center gap-2">
              Latest articles <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cms.articles.map((article, idx) => (
              <div key={idx} className={`group flex flex-col bg-white border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${article.featured ? "lg:col-span-2 lg:flex-row" : ""}`}>
                <div className={`bg-navy/10 relative overflow-hidden ${article.featured ? "lg:w-1/2 aspect-video lg:aspect-auto" : "aspect-video"}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-teal/20 to-navy/20 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className={`p-8 flex flex-col ${article.featured ? "lg:w-1/2" : ""}`}>
                  {article.featured && <span className="text-orange text-xs font-bold uppercase tracking-widest mb-4 block">Featured Article</span>}
                  <h3 className={`font-serif text-navy mb-4 group-hover:text-teal transition-colors ${article.featured ? "text-3xl" : "text-xl"}`}>{article.title}</h3>
                  <p className="text-gray-600 font-sans text-sm mb-8 line-clamp-3 leading-relaxed">{article.description}</p>
                  <a href="#" className="mt-auto text-teal font-bold text-sm uppercase tracking-widest hover:underline no-underline inline-flex items-center gap-2">
                    Read more <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 md:py-32 bg-navy text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-serif mb-6">{cms.newsletterHeading}</h2>
          <p className="text-gray-300 text-lg mb-12">Stay informed with the latest senior care news and resources delivered to your inbox.</p>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-left">
                <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-gray-400">First name</label>
                <input type="text" className="w-full px-4 py-4 bg-white/10 border border-white/20 focus:border-orange outline-none transition-colors text-white font-sans" />
              </div>
              <div className="text-left">
                <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-gray-400">Last name</label>
                <input type="text" className="w-full px-4 py-4 bg-white/10 border border-white/20 focus:border-orange outline-none transition-colors text-white font-sans" />
              </div>
            </div>
            <div className="text-left">
              <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-gray-400">Email Address</label>
              <input type="email" className="w-full px-4 py-4 bg-white/10 border border-white/20 focus:border-orange outline-none transition-colors text-white font-sans" />
            </div>
            <div className="flex items-start gap-3 text-left">
              <input type="checkbox" id="consent" className="mt-1 w-4 h-4 accent-orange" />
              <label htmlFor="consent" className="text-sm text-gray-400 leading-relaxed">
                By checking this box and submitting this form, you are consenting to receive marketing emails from {cms.brandName}. You can revoke your consent at any time.
              </label>
            </div>
            <button className="w-full md:w-auto bg-orange text-white px-16 py-5 font-sans font-bold uppercase tracking-widest hover:bg-orange/90 transition-all shadow-lg">
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

      {/* Footer */}
      <footer className="bg-navy text-white pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="text-3xl font-serif font-bold mb-6 text-white">{cms.brandName}</div>
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

            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold mb-8 text-gray-500">Our Services</h4>
              <div className="space-y-4">
                {cms.services.map((s) => (
                  <Link key={s.title} href={`/services/${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="block text-gray-400 hover:text-white no-underline text-sm transition-colors">{s.title}</Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold mb-8 text-gray-500">Connect</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-orange transition-colors cursor-pointer">F</div>
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-orange transition-colors cursor-pointer">T</div>
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-orange transition-colors cursor-pointer">L</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500 font-sans">
            <p>© 2026 {cms.brandName}. All rights reserved. Personalized in-home care and assistance.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white no-underline">Privacy Policy</a>
              <a href="#" className="hover:text-white no-underline">Accessibility</a>
              <a href="#" className="hover:text-white no-underline">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
