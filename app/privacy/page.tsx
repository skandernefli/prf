import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Cookies",
  description:
    "Privacy information for Skander Nefli's portfolio website, including hosting, contact links, and cookies.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/">
        ← Back to portfolio
      </Link>
      <p className="legal-eyebrow">PRIVACY &amp; COOKIES</p>
      <h1>Privacy information</h1>
      <p className="legal-updated">Last updated: November 2026</p>

      <section>
        <h2>Who is responsible for this site?</h2>
        <p>
          Skander Nefli, based in the Netherlands, is responsible for this
          portfolio website. For privacy questions or requests, email{" "}
          <a href="mailto:skander.nefli@gmail.com">
            skander.nefli@gmail.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Information processed when you visit</h2>
        <p>
          This site is hosted on Vercel. To deliver and protect the site, the
          hosting provider may process technical request information such as
          your IP address, browser and device details, requested pages, and
          timestamps. This site does not receive or keep a separate visitor
          profile from those hosting operations. Vercel handles its service
          data under its own policies; see{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel&apos;s privacy policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Contact and external links</h2>
        <p>
          The contact links open your email, phone, LinkedIn, or WhatsApp
          application. This website does not submit a contact form. If you
          contact me, the information you choose to send is handled through
          your email or messaging provider and by me to respond to you.
        </p>
        <p>
          LinkedIn and WhatsApp are separate services. When you follow an
          external link, their providers may receive technical information
          about your visit and process it under their own privacy policies.
        </p>
      </section>

      <section>
        <h2>Cookies and analytics</h2>
        <p>
          This website currently does not use analytics, advertising, or
          marketing trackers and does not set cookies for those purposes. No
          cookie-consent banner is needed for the site&apos;s current
          configuration.
        </p>
        <p>
          Privacy-friendly analytics may be considered later. If analytics is
          enabled, this notice will be updated before tracking starts, and
          tracking will be gated behind consent whenever required. The
          intended configuration will not store raw IP addresses or use
          session replay; country estimates would require transient IP
          processing and may use pseudonymous session data.
        </p>
      </section>

      <section>
        <h2>Your privacy rights</h2>
        <p>
          Depending on the applicable law and circumstances, you may have the
          right to request access, correction, deletion, restriction, or
          portability of personal data, or to object to processing. Contact me
          at{" "}
          <a href="mailto:skander.nefli@gmail.com">
            skander.nefli@gmail.com
          </a>{" "}
          to make a request. You may also lodge a complaint with the Dutch
          Data Protection Authority (
          <a
            href="https://autoriteitpersoonsgegevens.nl/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Autoriteit Persoonsgegevens
          </a>
          ).
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          This notice will be updated if the site&apos;s data practices or
          services change.
        </p>
      </section>
    </main>
  );
}
