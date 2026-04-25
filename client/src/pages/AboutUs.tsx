import { type FormEvent, useEffect, useState } from "react";
import { defaultSiteContent, type SiteContent } from "@shared/cms";
import { ChevronRight, Phone, MapPin, Users, Award, Heart } from "lucide-react";
import { Link } from "wouter";

export default function AboutUs() {
  const [cms, setCms] = useState<SiteContent>(defaultSiteContent);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<string>("");

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

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("Sending...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "about-us",
        }),
      });

      if (!response.ok) {
        throw new Error("Could not submit form");
      }

      setFormData({ firstName: "", lastName: "", email: "", message: "" });
      setFormStatus("Thanks! We received your message.");
    } catch {
      setFormStatus("Sorry, we could not submit your message.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-serif font-bold no-underline" style={{ color: "#007e8a" }}>{cms.brandName}</Link>
            <div className="text-xs text-gray-600 hidden sm:block uppercase tracking-wider font-bold">{cms.companyDescriptor}</div>
          </div>

          <nav className="hidden lg:flex gap-8 items-center">
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
              <Link href="/" className="hover:text-white no-underline">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">About Us</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">About {cms.brandName}</h1>
            <p className="text-xl md:text-2xl max-w-3xl font-serif leading-relaxed opacity-90">
              {cms.aboutUs.headline}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-24">
          <div className="container grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div className="bg-gray-50 p-8 border-l-4 border-teal">
                <p className="text-lg text-navy font-serif italic leading-relaxed">
                  {cms.aboutUs.description}
                </p>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-orange flex-shrink-0" />
                  <h2 className="text-3xl font-serif text-navy">Our Experience</h2>
                </div>
                <p className="text-gray-700 font-sans text-lg leading-relaxed">
                  {cms.aboutUs.experience}
                </p>
              </div>

              {/* Scope of Service */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-orange flex-shrink-0" />
                  <h2 className="text-3xl font-serif text-navy">Scope of Service</h2>
                </div>
                <p className="text-gray-700 font-sans text-lg leading-relaxed">
                  {cms.aboutUs.scopeOfService}
                </p>
              </div>

              {/* Our Staff */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-orange flex-shrink-0" />
                  <h2 className="text-3xl font-serif text-navy">Our Staff</h2>
                </div>
                <p className="text-gray-700 font-sans text-lg leading-relaxed mb-6">
                  {cms.aboutUs.staffDescription}
                </p>
              </div>

              {/* Culture & Family */}
              <div className="bg-white border-l-4 border-orange p-8">
                <h3 className="text-2xl font-serif text-navy mb-4">Culture & Family Connections</h3>
                <p className="text-gray-700 font-sans text-lg leading-relaxed mb-4">
                  {cms.aboutUs.cultureAndFamily}
                </p>
                <p className="text-gray-700 font-sans text-lg leading-relaxed">
                  {cms.aboutUs.staffMatching}
                </p>
              </div>

              {/* Locations */}
              <div>
                <h2 className="text-3xl font-serif text-navy mb-8">Our Locations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cms.aboutUs.locations.map((location, i) => (
                    <div key={i} className="bg-gray-50 p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-serif text-lg text-navy font-bold">{location}</p>
                          <p className="text-gray-600 font-sans text-sm mt-2">Kampala, Uganda</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-navy text-white p-8 mt-12">
                <h3 className="text-2xl font-serif mb-4">Ready to Learn More?</h3>
                <p className="text-gray-300 mb-6">
                  Contact us today to discuss how {cms.brandName} can provide the care and support your loved one deserves.
                </p>
                <a href={`tel:${cms.phone}`} className="inline-block bg-orange text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-orange/90 transition-all no-underline">
                  Call Us Today
                </a>
              </div>
            </div>

            {/* Sidebar / CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white border-t-8 border-orange shadow-2xl p-8">
                  <h3 className="text-2xl font-serif mb-6 text-navy">Get in Touch</h3>
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
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-500">Message</label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal outline-none transition-colors text-navy font-sans"
                        rows={4}
                      />
                    </div>
                    <button type="submit" className="w-full bg-orange text-white py-4 font-bold uppercase tracking-widest hover:bg-orange/90 transition-all shadow-lg mt-4">
                      Send Message
                    </button>
                    {formStatus && <p className="text-xs text-gray-500">{formStatus}</p>}
                  </form>
                </div>

                <div className="bg-gray-50 p-8 border border-gray-100">
                  <h3 className="text-xl font-serif mb-6 text-navy">Contact Info</h3>
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

                {/* Quick Stats */}
                <div className="bg-teal text-white p-8">
                  <h3 className="text-lg font-serif mb-6">Why Choose CAFOLA</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1" />
                      <span className="font-sans text-sm">10+ years of experience</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1" />
                      <span className="font-sans text-sm">24/7 nursing support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1" />
                      <span className="font-sans text-sm">Personalized care plans</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1" />
                      <span className="font-sans text-sm">Multilingual staff</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1" />
                      <span className="font-sans text-sm">Family-centered approach</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="container">
            <h2 className="text-3xl font-serif mb-12 text-center text-navy">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cms.services.map((service, idx) => (
                <Link key={idx} href={`/services/${service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="no-underline">
                  <div className="bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col">
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h3 className="text-lg font-serif mb-3 text-navy hover:text-teal transition-colors">{service.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">{service.description}</p>
                    <span className="text-teal font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2">
                      Learn more <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
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
