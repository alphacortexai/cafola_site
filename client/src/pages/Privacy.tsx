import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { SiteContactList } from "@/components/SiteContact";
import { ContentLoading, useSiteContent } from "@/hooks/useSiteContent";
import { resolveSiteContact } from "@shared/cms";

export default function Privacy() {
  const { cms, ready } = useSiteContent();
  const contact = resolveSiteContact(cms);

  if (!ready) return <ContentLoading />;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader cms={cms} />
      <main className="container py-12 max-w-3xl">
        <p className="text-sm uppercase tracking-widest text-orange font-bold">CAFOLA</p>
        <h1 className="text-4xl font-serif text-navy mt-3">Privacy Policy</h1>
        <div className="mt-8 space-y-6 description-text text-gray-700">
          <p>
            CAFOLA collects only the details you choose to send through the contact and
            newsletter forms: your name, email address, phone number, and message. We use
            that information to reply to care enquiries and, when you opt in, to send
            updates you asked for.
          </p>
          <p>
            Form submissions are stored in our private records. They are not sold, rented,
            or shown on the public website. Staff sign-in is required before anyone can
            open those records.
          </p>
          <p>
            The public site loads Google Tag Manager so we can measure visits and, when
            you arrive from an advertisement, understand which campaign brought you here.
            Google receives standard visit data such as pages viewed and a browser
            identifier. You can control ad cookies in your browser settings.
          </p>
          <p>
            We do not ask for passwords, payment card numbers, or medical record numbers
            through this website. Please do not include sensitive medical details in a
            web form; our team will collect those privately after we reply.
          </p>
          <p>
            To review or delete a message you sent, email{" "}
            <a className="text-teal font-bold" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            . This policy applies to {contact.website}.
          </p>
          <p>
            <Link href="/" className="text-teal font-bold no-underline hover:underline">
              Back to the homepage
            </Link>
          </p>
        </div>
      </main>
      <footer className="bg-navy text-white py-10">
        <div className="container">
          <SiteContactList cms={cms} />
        </div>
      </footer>
    </div>
  );
}
