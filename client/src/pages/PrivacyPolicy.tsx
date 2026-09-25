/**
 * BlankAI — Privacy Policy Page
 * Design: Dark technical aesthetic (same as Home)
 * Route: /privacy
 */

import { useEffect } from "react";
import { Lock, Server, Eye, Trash2, Mail, Globe } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function PrivacyPolicy() {
  usePageMeta({
    title: "Privacy Policy | BlankAI",
    description:
      "BlankAI Privacy Policy. We never store, upload, or access your images. All processing is 100% browser-based. Learn how we protect your privacy.",
    canonical: "https://blankai.app/privacy",
    ogTitle: "Privacy Policy | BlankAI",
    ogDescription:
      "BlankAI never stores or uploads your images. All processing is 100% browser-based and private.",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "September 25, 2026";
  const effectiveDate = "September 25, 2026";
  const contactEmail = "support@blankai.app";
  const siteUrl = "https://blankai.app";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader breadcrumb="Privacy Policy" />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-xs font-medium mb-5">
            <Lock className="w-3 h-3" />
            Legal Document
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4">
            Privacy Policy
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono-custom">
            <span>
              Last updated:{" "}
              <strong className="text-foreground">{lastUpdated}</strong>
            </span>
            <span className="text-border">·</span>
            <span>
              Effective:{" "}
              <strong className="text-foreground">{effectiveDate}</strong>
            </span>
          </div>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-2xl">
            BlankAI is built on a single principle:{" "}
            <strong className="text-foreground">
              your images never leave your device.
            </strong>{" "}
            This policy explains what we collect, what we don't, and how we
            protect your privacy.
          </p>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: Server,
              title: "Zero Server Uploads",
              desc: "All image processing happens 100% in your browser. We never receive, store, or transmit your images.",
              color: "text-green-400",
              bg: "bg-green-500/5 border-green-500/20",
            },
            {
              icon: Eye,
              title: "Minimal Data Collection",
              desc: "We use Google Analytics for page views and product events. Events never contain your images or their metadata.",
              color: "text-cyan",
              bg: "bg-cyan/5 border-cyan/20",
            },
            {
              icon: Trash2,
              title: "No Selling of Data",
              desc: "We don't sell or share data for advertising, and we don't build user profiles.",
              color: "text-blue-400",
              bg: "bg-blue-500/5 border-blue-500/20",
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className={`rounded-xl border p-4 ${bg}`}>
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <h3 className="font-display font-semibold text-foreground text-sm mb-1">
                {title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="prose-custom space-y-10">
          <Section id="overview" title="1. Overview">
            <p>
              BlankAI ("we," "us," or "our") operates the website located at{" "}
              <a href={siteUrl} className="text-cyan hover:underline">
                {siteUrl}
              </a>{" "}
              (the "Service"). This Privacy Policy describes how we handle
              information in connection with your use of the Service.
            </p>
            <p>
              BlankAI is a browser-based image processing tool. The core
              functionality — removing AI metadata, EXIF data, C2PA credentials,
              GPS tags, and other hidden image metadata — is executed entirely within
              your web browser using the HTML5 Canvas API and Web Crypto API.{" "}
              <strong>
                At no point during image processing are your images transmitted
                to our servers or any third-party server.
              </strong>
            </p>
          </Section>

          <Section
            id="no-image-data"
            title="2. Image Data — What We Don't Collect"
          >
            <p>
              We want to be unambiguous:{" "}
              <strong>
                BlankAI does not collect, receive, store, process, or transmit
                your images in any form.
              </strong>{" "}
              When you upload an image to BlankAI:
            </p>
            <ul>
              <li>
                The image is loaded directly into your browser's memory via the
                HTML5 File API.
              </li>
              <li>
                All processing (metadata scanning, canvas rendering, encoding
                and hash computation) occurs locally on your device.
              </li>
              <li>
                The processed image is returned to you as a downloadable file
                generated in your browser.
              </li>
              <li>
                No image data, metadata, or file content is sent over the
                network at any point.
              </li>
            </ul>
            <p>
              This architecture is by design. We cannot access your images even
              if we wanted to.
            </p>
          </Section>

          <Section
            id="information-collected"
            title="3. Information We Do Collect"
          >
            <p>
              While we don't collect image data, we do collect limited,
              non-personal information to operate and improve the Service:
            </p>

            <SubSection title="3.1 Analytics Data">
              <p>
                We use Google Analytics 4 to understand how the Service is used.
                It records pages visited, referring pages, approximate location
                (country or city level, derived from your IP address), device and
                browser type, and product events such as &quot;images
                processed&quot;, &quot;download clicked&quot; or &quot;metadata
                types found&quot; (for example, whether a GPS block was present).
                These events never include your images, file names, or the
                contents of any metadata. Google Analytics uses cookies to
                distinguish visits; see Section 4. You can opt out with Google&apos;s
                browser add-on at tools.google.com/dlpage/gaoptout or by blocking
                cookies for this site. If we enable an additional
                privacy-focused analytics service in the future, it will be
                listed in Section 5.
              </p>
            </SubSection>

            <SubSection title="3.2 Request Data">
              <p>
                The site is hosted on Cloudflare Pages. Cloudflare processes
                standard request data, such as IP address, browser type,
                requested URL and timestamps, to deliver the site and protect it
                from abuse. We do not run our own application servers and do not
                build personal profiles from this data.
              </p>
            </SubSection>

            <SubSection title="3.3 Local Storage">
              <p>
                BlankAI uses your browser's <code>localStorage</code> and{" "}
                <code>sessionStorage</code> to temporarily store processing
                state (e.g., passing a processed image to the Image Diff tool
                within the same session). This data never leaves your device and
                is cleared when you close your browser session or clear your
                browser storage.
              </p>
            </SubSection>
          </Section>

          <Section id="cookies" title="4. Cookies">
            <p>
              BlankAI does not use advertising or marketing cookies. The cookies
              set on this site are:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
                      Cookie
                    </th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
                      Purpose
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-xs">_ga, _ga_*</td>
                    <td className="py-2 pr-4">
                      Google Analytics: distinguishes visits and sessions
                    </td>
                    <td className="py-2">Up to 2 years</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">theme</td>
                    <td className="py-2 pr-4">
                      Stores your dark/light mode preference
                    </td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="third-parties" title="5. Third-Party Services">
            <p>
              BlankAI uses a small number of third-party services to operate.
              Each is listed below with a description of the data they may
              access:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
                      Service
                    </th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
                      Purpose
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Data Shared
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Cloudflare</td>
                    <td className="py-2 pr-4">CDN, DDoS protection, DNS</td>
                    <td className="py-2">IP address, request metadata</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Google Analytics</td>
                    <td className="py-2 pr-4">Usage analytics</td>
                    <td className="py-2">
                      IP address, device and browser data, pages visited,
                      product events (never images or metadata contents)
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Google Fonts</td>
                    <td className="py-2 pr-4">
                      Typography (Space Grotesk, Inter)
                    </td>
                    <td className="py-2">IP address (font request)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              We do not sell, rent, or share your personal data with any third
              party for marketing or advertising purposes.
            </p>
          </Section>

          <Section id="data-security" title="6. Data Security">
            <p>
              All connections to BlankAI are encrypted via HTTPS/TLS. Because
              image processing occurs entirely in your browser, the primary
              security boundary is your own device. We recommend using an
              up-to-date browser and operating system to ensure the security of
              your local processing environment.
            </p>
            <p>
              For the limited data that is collected (analytics and request
              data), we rely on the security practices of Google and Cloudflare
              and restrict account access to the people who run BlankAI.
            </p>
          </Section>

          <Section id="childrens-privacy" title="7. Children's Privacy">
            <p>
              BlankAI is not directed at children under the age of 13. We do not
              knowingly collect personal information from children under 13. If
              you believe a child has provided us with personal information,
              please contact us at{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-cyan hover:underline"
              >
                {contactEmail}
              </a>{" "}
              and we will promptly delete it.
            </p>
          </Section>

          <Section id="your-rights" title="8. Your Rights">
            <p>
              Depending on your jurisdiction, you may have the following rights
              regarding your personal data:
            </p>
            <ul>
              <li>
                <strong className="text-foreground">Right of Access:</strong>{" "}
                Request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-foreground">Right to Erasure:</strong>{" "}
                Request deletion of personal data associated with you.
              </li>
              <li>
                <strong className="text-foreground">
                  Right to Rectification:
                </strong>{" "}
                Request correction of inaccurate personal data.
              </li>
              <li>
                <strong className="text-foreground">Right to Object:</strong>{" "}
                Object to processing of your personal data.
              </li>
              <li>
                <strong className="text-foreground">
                  Right to Portability:
                </strong>{" "}
                Request a machine-readable copy of your data.
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-cyan hover:underline"
              >
                {contactEmail}
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section id="gdpr-ccpa" title="9. GDPR & CCPA Compliance">
            <p>
              For users in the European Economic Area (EEA), our legal basis for
              processing analytics data is{" "}
              <strong className="text-foreground">legitimate interests</strong>{" "}
              (improving the Service) under Article 6(1)(f) of the GDPR. You
              can object at any time by blocking analytics cookies or using the
              opt-out described in Section 3.1.
            </p>
            <p>
              For California residents under the California Consumer Privacy Act
              (CCPA): BlankAI does not sell personal information. You have the
              right to know what personal information is collected, to delete
              personal information, and to opt-out of the sale of personal
              information (which we do not engage in).
            </p>
          </Section>

          <Section id="changes" title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will update the "Last updated" date at the top of this page.
              For material changes, we will provide a more prominent notice.
              Your continued use of the Service after any changes constitutes
              your acceptance of the updated policy.
            </p>
          </Section>

          <Section id="contact" title="11. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>
            <div className="rounded-xl border border-border bg-card p-5 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-cyan" />
                <span className="font-display font-semibold text-foreground">
                  BlankAI Support
                </span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Email:{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-cyan hover:underline"
                  >
                    {contactEmail}
                  </a>
                </p>
                <p>
                  Website:{" "}
                  <a href={siteUrl} className="text-cyan hover:underline">
                    {siteUrl}
                  </a>
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">
            ← Back to BlankAI
          </a>
          <span className="text-border">·</span>
          <a href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <span className="text-border">·</span>
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-1 hover:text-cyan transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            {contactEmail}
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-cyan flex-shrink-0" />
        {title}
      </h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed text-[15px] pl-3 border-l border-border/50">
        {children}
      </div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h3 className="font-display font-semibold text-foreground text-sm mb-2">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
