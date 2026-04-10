import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, MapPin, Phone } from "lucide-react";
import { useState } from "react";

/**
 * Right at Home Clone - Home Page
 * 
 * Design Philosophy: Professional Care & Trust
 * - Serif typography (Merriweather) for trustworthiness
 * - Teal color palette for healthcare professionalism
 * - Warm photography and generous spacing for accessibility
 * - Focus on clarity and emotional connection
 */

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchLocation, setSearchLocation] = useState("");

  const testimonials = [
    {
      quote: "These caregivers make it possible for my husband and I to stay in our home. I'm so thankful for Right at Home and their caregivers.",
      author: "Norma",
      role: "Client",
      location: "Right at Home Norfolk, Nebraska",
    },
    {
      quote: "We have been exceptionally pleased with the services provided by Right at Home. They have provided education-based care to a loved one with advancing dementia with dignity and respect.",
      author: "Michelle",
      role: "Client's Family Member",
      location: "Right at Home Clemson, South Carolina",
    },
    {
      quote: "The caregivers are so nice. They just help us with anything we need. The office staff is also great. I appreciate that they always return phone calls timely.",
      author: "Donna",
      role: "Client's Family Member",
      location: "Right at Home Tulsa East and West, Oklahoma",
    },
  ];

  const services = [
    {
      title: "Companion Care",
      description: "Help with light housekeeping, grocery shopping, transportation…",
      icon: "🏠",
    },
    {
      title: "Personal Care",
      description: "There for physical assistance, hygiene, mobility…",
      icon: "👤",
    },
    {
      title: "Nursing Services",
      description: "In-home medical care, ostomy care…",
      icon: "⚕️",
    },
    {
      title: "Specialty Care",
      description: "Support for conditions like Alzheimer's, diabetes, Parkinson's…",
      icon: "🏥",
    },
  ];

  const articles = [
    {
      title: "Caring for a Loved One With Aphasia",
      description: "Learn more about aphasia, the limitations it can cause, and how you can help a loved one.",
      featured: true,
    },
    {
      title: "How To Use Chair Yoga To Improve Your Senior Loved One's Health",
      description: "Chair yoga is a simple, accessible way for older adults to enhance flexibility, balance, and overall well-being.",
    },
    {
      title: "Colon Cancer Screenings for Older Adults",
      description: "Are you or a loved one over age 45 and wondering if it's time for a colon cancer screening?",
    },
    {
      title: "How Oral Health Affects Senior Nutrition and Why It Matters for Aging at Home",
      description: "Good nutrition is the cornerstone of healthy aging, but did you know your smile plays a bigger role?",
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-serif font-bold" style={{ color: '#007e8a' }}>Right at Home</div>
            <div className="text-xs text-gray-600">In-Home Care & Assistance</div>
          </div>
          
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#" className="text-gray-700 font-sans hover:underline" style={{ color: '#6c757d' }}>Services</a>
            <a href="#" className="text-gray-700 font-sans hover:underline" style={{ color: '#6c757d' }}>Resources</a>
            <a href="#" className="text-gray-700 font-sans hover:underline" style={{ color: '#6c757d' }}>About Us</a>
            <a href="#" className="text-gray-700 font-sans hover:underline" style={{ color: '#6c757d' }}>Careers</a>
            <a href="#" className="text-gray-700 font-sans hover:underline" style={{ color: '#6c757d' }}>Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="#" className="font-semibold text-sm hidden md:block" style={{ color: '#007e8a' }}>Find a location</a>
            <a href="tel:+18776977537" className="font-semibold text-sm" style={{ color: '#007e8a' }}>(877) 697-7537</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden" style={{ background: 'linear-gradient(to right, #2c3e50, #007e8a)' }}>
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url("https://d2xsxph8kpxj0f.cloudfront.net/310519663269964698/G33c7Gr9Vjm6QbN5AtWjKi/hero-caregiver-senior-WfcaNGv39maDGZSj2Hmu4v.webp")',
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 to-teal/70" />

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">
            Right at Home
          </h1>
          <p className="text-xl md:text-2xl font-serif text-white mb-8">
            Let's start talking about living.®
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Enter ZIP code/City, State"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1 px-4 py-3 rounded-none border-0 font-sans"
            />
            <button className="text-white px-6 py-3 font-sans font-semibold rounded-none hover:opacity-90" style={{ backgroundColor: '#ff8c42' }}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-4" style={{ color: '#2c3e50' }}>
            What We Can Do for You
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto font-sans">
            We believe there's more to caring for people than just providing in-home assistance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-gray-50 p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-serif mb-3" style={{ color: '#007e8a' }}>{service.title}</h3>
                <p className="text-gray-700 font-sans text-sm mb-4">{service.description}</p>
                <a href="#" className="font-bold text-sm hover:underline" style={{ color: '#007e8a' }}>Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col justify-center items-start">
              <h3 className="text-3xl font-serif mb-6" style={{ color: '#2c3e50' }}>
                Already know which services you need?
              </h3>
              <button className="text-white px-8 py-4 font-sans font-semibold rounded-none transition-colors hover:opacity-90" style={{ backgroundColor: '#007e8a' }}>
                Connect with us
              </button>
            </div>
            <div className="flex flex-col justify-center items-start">
              <h3 className="text-3xl font-serif mb-6" style={{ color: '#2c3e50' }}>
                Not sure what types of care you need?
              </h3>
              <button className="px-8 py-4 font-sans font-semibold rounded-none transition-colors hover:text-white" style={{ border: '2px solid #007e8a', color: '#007e8a' }} onMouseEnter={(e) => { const target = e.target as HTMLButtonElement; target.style.backgroundColor = '#007e8a'; target.style.color = 'white'; }} onMouseLeave={(e) => { const target = e.target as HTMLButtonElement; target.style.backgroundColor = 'transparent'; target.style.color = '#007e8a'; }}>
                Let's find out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12" style={{ color: '#2c3e50' }}>
            Hear What Others Are Saying
          </h2>

          <div className="max-w-3xl mx-auto">
            {/* Testimonial Card */}
            <div className="bg-white p-8 md:p-12 rounded-none" style={{ border: '4px solid rgba(255, 140, 66, 0.3)' }}>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-orange text-orange" style={{ color: '#ff8c42' }} />
                ))}
              </div>
              <p className="text-xl font-sans text-gray-800 mb-6 italic">
                "{testimonials[currentTestimonial].quote}"
              </p>
              <div className="border-t border-gray-200 pt-6">
                <p className="font-serif font-bold text-lg" style={{ color: '#2c3e50' }}>
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="text-gray-600 font-sans text-sm">
                  {testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].location}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevTestimonial}
                className="text-white p-3 rounded-none transition-colors hover:opacity-90"
                style={{ backgroundColor: '#007e8a' }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className="w-3 h-3 rounded-full transition-colors"
                    style={{ backgroundColor: idx === currentTestimonial ? '#007e8a' : '#d1d5db' }}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="text-white p-3 rounded-none transition-colors hover:opacity-90"
                style={{ backgroundColor: '#007e8a' }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-6" style={{ color: '#2c3e50' }}>Our Story</h2>
              <p className="text-gray-700 font-sans text-lg mb-4 leading-relaxed">
                Home—there's no place like it. It's where your memories are. Where you raised your family and where friends have gathered for life's celebrations. It's been your basecamp through good times and bad. And it's where you want to stay.
              </p>
              <p className="text-gray-700 font-sans text-lg mb-6 leading-relaxed">
                At Right at Home, our intention is to help you do just that. Why? Because we exist to be your guide to living successfully at home, wherever home may be. It's our purpose.
              </p>
              <p className="text-gray-700 font-sans text-lg mb-8 leading-relaxed">
                Aging, disability, illness or injury can make living at home a challenge. We believe that no one should have to face the long list of complex decisions and unforeseen changes alone. We are experts, providing not just care, but coaching and experience to help navigate every step of the journey.
              </p>
              <button className="px-8 py-4 font-sans font-semibold rounded-none transition-colors" style={{ border: '2px solid #007e8a', color: '#007e8a' }} onMouseEnter={(e) => { const target = e.target as HTMLButtonElement; target.style.backgroundColor = '#007e8a'; target.style.color = 'white'; }} onMouseLeave={(e) => { const target = e.target as HTMLButtonElement; target.style.backgroundColor = 'transparent'; target.style.color = '#007e8a'; }}>
                Learn More
              </button>
            </div>
            <div className="bg-cover bg-center h-96 rounded-none"
              style={{
                backgroundImage: 'url("https://d2xsxph8kpxj0f.cloudfront.net/310519663269964698/G33c7Gr9Vjm6QbN5AtWjKi/story-section-image-gtFgEp5xjw8psZqcTXPwhD.webp")',
              }}
            />
          </div>
        </div>
      </section>

      {/* Caregivers Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-6" style={{ color: '#2c3e50' }}>
                Our Nationally Recognized Caregivers
              </h2>
              <p className="text-gray-700 font-sans text-lg mb-4">
                Each year, we honor caregivers who go above and beyond. Read about our <a href="#" className="font-bold" style={{ color: '#007e8a' }}>Caregivers of the Year</a>.
              </p>
              <p className="text-gray-700 font-sans text-lg mb-8">
                If you're as passionate as we are about helping people living at home stay healthy and comfortable, we want you to feel Right at Home, too. We invite you to visit our careers page.
              </p>
              <button className="text-white px-8 py-4 font-sans font-semibold rounded-none transition-colors hover:opacity-90" style={{ backgroundColor: '#007e8a' }}>
                Learn more
              </button>
            </div>
            <div className="bg-cover bg-center rounded-none overflow-hidden"
              style={{
                backgroundImage: 'url("https://d2xsxph8kpxj0f.cloudfront.net/310519663269964698/G33c7Gr9Vjm6QbN5AtWjKi/caregivers-team-ZzfisTWAAxN9z2m87AfHPa.webp")',
                height: '400px',
              }}
            />
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12" style={{ color: '#2c3e50' }}>
            Latest Resources for Seniors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, idx) => (
              <div key={idx} className={`bg-white rounded-none overflow-hidden ${article.featured ? "md:col-span-2 md:row-span-2" : ""}`}>
                <div className={`h-40 ${article.featured ? "md:h-64" : ""} rounded-none mb-4`} style={{ background: 'linear-gradient(135deg, #007e8a, #2c3e50)' }} />
                <div className="p-6">
                  <h3 className={`font-serif mb-3 ${article.featured ? "text-2xl" : "text-lg"}`} style={{ color: '#2c3e50' }}>
                    {article.title}
                  </h3>
                  <p className="text-gray-600 font-sans text-sm mb-4">
                    {article.description}
                  </p>
                  <a href="#" className="font-bold text-sm hover:underline" style={{ color: '#007e8a' }}>
                    {article.featured ? "Learn more" : "Read more"} →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="#" className="font-bold text-lg hover:underline" style={{ color: '#007e8a' }}>
              Latest articles →
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-8" style={{ color: '#2c3e50' }}>
            Sign Up for the Caring Right at Home® E-Newsletter
          </h2>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                className="px-4 py-3 border border-gray-300 rounded-none font-sans"
              />
              <input
                type="text"
                placeholder="Last name"
                className="px-4 py-3 border border-gray-300 rounded-none font-sans"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-none font-sans"
            />
            <label className="flex items-start gap-3 font-sans text-sm text-gray-700">
              <input type="checkbox" className="mt-1" />
              <span>
                By checking this box and submitting this form, you are consenting to receive marketing emails from Right at Home. You can revoke your consent at any time. <a href="#" className="font-bold" style={{ color: '#007e8a' }}>Privacy Policy</a>.
              </span>
            </label>
            <button className="w-full text-white px-8 py-4 font-sans font-semibold rounded-none transition-colors hover:opacity-90" style={{ backgroundColor: '#007e8a' }}>
              Sign up
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: '#2c3e50' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="font-sans text-sm">
              <p className="font-semibold mb-2">6700 Mercy Rd</p>
              <p className="mb-4">Ste 400<br />Omaha, NE 68106</p>
              <p className="mb-2">Phone: <a href="tel:+18776977537" className="hover:opacity-80" style={{ color: '#ff8c42' }}>(877) 697-7537</a></p>
              <p>Fax: (402) 697-0289</p>
            </div>
            <div className="font-sans text-sm">
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>Find Care</a>
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>Find Jobs</a>
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>Contact Us</a>
              <a href="#" className="block hover:opacity-80" style={{ color: '#ff8c42' }}>FAQ</a>
            </div>
            <div className="font-sans text-sm">
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>Family Room</a>
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>Privacy Policy</a>
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>Accessibility</a>
              <a href="#" className="block hover:opacity-80" style={{ color: '#ff8c42' }}>Sitemap</a>
            </div>
            <div className="font-sans text-sm">
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>Canada</a>
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>United Kingdom</a>
              <a href="#" className="block hover:opacity-80 mb-2" style={{ color: '#ff8c42' }}>Australia</a>
              <a href="#" className="block hover:opacity-80" style={{ color: '#ff8c42' }}>Ireland</a>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <p className="font-sans text-sm text-center text-gray-300">
              © 2026 Right at Home, LLC a global franchise network where most offices are independently owned and operated.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
