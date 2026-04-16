import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { defaultSiteContent, type SiteContent, type Service } from "@shared/cms";
import { Button } from "@/components/ui/button";
import { ChevronRight, Phone, Mail, MapPin } from "lucide-react";

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

  // Find the service based on slug (using title as a simple slug for now)
  const service = cms.services.find(
    (s) => s.title.toLowerCase().replace(/\s+/g, "-") === slug
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
            <div className="text-xs text-gray-600 hidden sm:block">{cms.companyDescriptor}</div>
          </div>

          <nav className="hidden md:flex gap-8 items-center">
            {cms.navItems.map((item) => (
              <a key={item} href={item === "Services" ? "/#services" : "#"} className="text-gray-700 font-sans hover:underline no-underline" style={{ color: "#6c757d" }}>{item}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href="tel:+18776977537" className="font-semibold text-sm no-underline hover:underline" style={{ color: "#007e8a" }}>{cms.phone}</a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-navy py-16 md:py-24 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-teal/20" />
          <div className="container relative z-10">
            <nav className="flex items-center gap-2 text-sm mb-6 text-gray-300">
              <a href="/" className="hover:text-white no-underline">Home</a>
              <ChevronRight className="w-4 h-4" />
              <a href="/#services" className="hover:text-white no-underline">Services</a>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{service.title}</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-serif mb-6">{service.title}</h1>
            <p className="text-xl md:text-2xl max-w-3xl font-serif leading-relaxed">
              Providing professional, compassionate {service.title.toLowerCase()} tailored to your family's unique needs.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-serif mb-8 text-navy">How We Can Help</h2>
              <div className="prose prose-lg max-w-none text-gray-700 font-sans space-y-6">
                <p>
                  At {cms.brandName}, we understand that every individual has different needs. Our {service.title.toLowerCase()} is designed to provide the right level of support while promoting independence and quality of life.
                </p>
                <p>
                  {service.description} Our dedicated caregivers are trained to provide this support with the utmost respect and professionalism.
                </p>
                
                <h3 className="text-2xl font-serif text-navy mt-12 mb-4">Our {service.title} Includes:</h3>
                <ul className="space-y-3 list-none pl-0">
                  {[
                    "Personalized care planning",
                    "Carefully matched caregivers",
                    "Regular quality assurance visits",
                    "24/7 support and coordination",
                    "Family education and resources"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-orange flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-gray-50 p-8 border-l-4 border-teal mt-12">
                  <p className="italic text-lg">
                    "The care provided by {cms.brandName} has been a blessing for our family. Their attention to detail and genuine compassion made all the difference."
                  </p>
                  <p className="font-bold mt-4 text-navy">— A Grateful Family Member</p>
                </div>
              </div>
            </div>

            {/* Sidebar / CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-navy text-white p-8">
                  <h3 className="text-2xl font-serif mb-6">Start Care Now</h3>
                  <form className="space-y-4">
                    <input type="text" placeholder="First Name" className="w-full px-4 py-3 bg-white text-navy border-0 font-sans" />
                    <input type="text" placeholder="Last Name" className="w-full px-4 py-3 bg-white text-navy border-0 font-sans" />
                    <input type="tel" placeholder="Phone" className="w-full px-4 py-3 bg-white text-navy border-0 font-sans" />
                    <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-white text-navy border-0 font-sans" />
                    <input type="text" placeholder="Zip Code" className="w-full px-4 py-3 bg-white text-navy border-0 font-sans" />
                    <button className="w-full bg-orange text-white py-4 font-bold hover:bg-orange/90 transition-colors">
                      Submit
                    </button>
                  </form>
                  <p className="text-xs mt-4 text-gray-400">
                    By submitting this form you are consenting to be contacted by {cms.brandName}.
                  </p>
                </div>

                <div className="border border-gray-200 p-8">
                  <h3 className="text-xl font-serif mb-6 text-navy">Need help right now?</h3>
                  <div className="space-y-4">
                    <a href={`tel:${cms.phone}`} className="flex items-center gap-3 text-teal hover:underline no-underline font-bold">
                      <Phone className="w-5 h-5" />
                      {cms.phone}
                    </a>
                    <div className="flex items-start gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                      <span>{cms.footerAddress.join(", ")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Services */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-serif mb-12 text-center text-navy">Explore Our Other Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cms.services
                .filter((s) => s.title !== service.title)
                .slice(0, 3)
                .map((s, idx) => (
                  <div key={idx} className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-4">{s.icon}</div>
                    <h3 className="text-xl font-serif mb-3 text-teal">{s.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">{s.description}</p>
                    <a 
                      href={`/services/${s.title.toLowerCase().replace(/\s+/g, "-")}`} 
                      className="text-teal font-bold text-sm hover:underline no-underline inline-flex items-center gap-1"
                    >
                      Learn more <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="font-sans text-sm">
              <div className="text-xl font-serif font-bold mb-4 text-white">{cms.brandName}</div>
              {cms.footerAddress.map((line) => <p key={line} className="mb-1">{line}</p>)}
              <p className="mt-4">Phone: <a href={`tel:${cms.phone}`} className="text-orange hover:underline no-underline">{cms.phone}</a></p>
            </div>
            <div className="font-sans text-sm">
              <h4 className="font-bold mb-4 text-white uppercase tracking-wider">Quick Links</h4>
              {cms.footerLinks.map((link) => <a key={link} href="#" className="block text-orange hover:underline no-underline mb-2">{link}</a>)}
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            © 2026 {cms.brandName}. Personalized in-home care and assistance.
          </div>
        </div>
      </footer>
    </div>
  );
}
