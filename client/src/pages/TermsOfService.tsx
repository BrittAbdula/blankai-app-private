/**
 * BlankAI — Terms of Service Page
 * Design: Dark technical aesthetic (same as Home)
 * Route: /terms
 */

import { useEffect } from "react";
import { Link } from "wouter";
import { EyeOff, ArrowLeft, FileText, AlertTriangle, Mail } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function TermsOfService() {
  usePageMeta({
    title: "Terms of Service | BlankAI — AI Metadata Remover",
    description: "BlankAI Terms of Service. Free browser-based AI metadata remover. Read our usage terms, intellectual property policy, and liability disclaimer.",
    canonical: "https://blankai.app/terms",
    ogTitle: "Terms of Service | BlankAI",
    ogDescription: "BlankAI Terms of Service. Free browser-based AI metadata remover. Read our usage terms and policies.",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "March 11, 2025";
  const effectiveDate = "March 11, 2025";
  const contactEmail = "support@blankai.app";
  const siteUrl = "https://blankai.app";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-4 bg-border" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan/10 border border-cyan/30 flex items-center justify-center">
                <EyeOff className="w-3.5 h-3.5 text-cyan" />
              </div>
              <span className="font-display font-bold text-foreground text-sm">blankAI</span>
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-foreground text-sm font-medium">Terms of Service</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-cyan text-navy text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <FileText className="w-3 h-3" />
            Try Free
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-xs font-medium mb-5">
            <FileText className="w-3 h-3" />
            Legal Document
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4">
            Terms of Service
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono-custom">
            <span>Last updated: <strong className="text-foreground">{lastUpdated}</strong></span>
            <span className="text-border">·</span>
            <span>Effective: <strong className="text-foreground">{effectiveDate}</strong></span>
          </div>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-2xl">
            Please read these Terms of Service carefully before using BlankAI. By accessing or using the Service, you agree to be bound by these terms.
          </p>
        </div>

        {/* Important Notice */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-10 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-semibold text-sm mb-1">Important Notice</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              BlankAI is a tool for legitimate privacy protection and personal use. You are solely responsible for ensuring your use of this tool complies with applicable laws, platform terms of service, and intellectual property rights. Do not use BlankAI to circumvent copyright protection, deceive others, or violate any third-party terms.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-10">

          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By accessing or using BlankAI at <a href={siteUrl} className="text-cyan hover:underline">{siteUrl}</a> (the "Service"), you agree to be bound by these Terms of Service ("Terms") and our <Link href="/privacy" className="text-cyan hover:underline">Privacy Policy</Link>. If you do not agree to these Terms, do not use the Service.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you ("User," "you," or "your") and BlankAI ("we," "us," or "our"). We reserve the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section id="description" title="2. Description of Service">
            <p>
              BlankAI provides a free, browser-based tool that allows users to remove metadata (including EXIF data, GPS tags, C2PA content credentials, XMP/IPTC data, and AI-specific signatures) from digital images and modify pixel-level fingerprints. All processing occurs entirely within the user's web browser; no images are transmitted to or stored on our servers.
            </p>
            <p>
              The Service is provided "as is" and "as available." We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without notice.
            </p>
          </Section>

          <Section id="eligibility" title="3. Eligibility">
            <p>
              You must be at least 13 years of age to use the Service. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you represent that you have obtained parental or guardian consent to use the Service.
            </p>
          </Section>

          <Section id="permitted-use" title="4. Permitted Use">
            <p>
              Subject to these Terms, BlankAI grants you a limited, non-exclusive, non-transferable, revocable license to use the Service for lawful personal or commercial purposes, including:
            </p>
            <ul>
              <li>Removing metadata from images you own or have the right to modify.</li>
              <li>Protecting your personal privacy by removing location data from photos.</li>
              <li>Preparing images for publication on platforms where you wish to control metadata disclosure.</li>
              <li>Comparing images for quality assurance or verification purposes using the Image Diff tool.</li>
              <li>Integrating the Service into legitimate creative or commercial workflows.</li>
            </ul>
          </Section>

          <Section id="prohibited-use" title="5. Prohibited Use">
            <p>
              You agree not to use the Service for any of the following purposes:
            </p>
            <ul>
              <li><strong className="text-foreground">Copyright Infringement:</strong> Removing metadata from images you do not own or do not have the right to modify, particularly where such metadata constitutes copyright management information protected under the Digital Millennium Copyright Act (DMCA) or equivalent laws.</li>
              <li><strong className="text-foreground">Fraud or Deception:</strong> Using processed images to deceive others about the origin, authenticity, or provenance of content in a manner that constitutes fraud, misrepresentation, or defamation.</li>
              <li><strong className="text-foreground">Platform Violations:</strong> Using the Service to circumvent the terms of service of other platforms in ways that violate those platforms' policies.</li>
              <li><strong className="text-foreground">Illegal Content:</strong> Processing images that contain illegal content, including but not limited to child sexual abuse material (CSAM), non-consensual intimate imagery, or content that violates applicable laws.</li>
              <li><strong className="text-foreground">Malicious Activity:</strong> Attempting to reverse-engineer, scrape, overload, or otherwise interfere with the Service or its infrastructure.</li>
              <li><strong className="text-foreground">Automated Abuse:</strong> Using automated scripts, bots, or crawlers to access the Service in a manner that exceeds reasonable personal use.</li>
            </ul>
            <p>
              Violation of these prohibitions may result in termination of your access to the Service and, where applicable, referral to law enforcement authorities.
            </p>
          </Section>

          <Section id="intellectual-property" title="6. Intellectual Property">
            <p>
              The Service, including its design, code, branding, and content (excluding user-provided images), is owned by BlankAI and protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works of the Service without our express written permission.
            </p>
            <p>
              You retain all ownership rights in the images you process through the Service. By using the Service, you represent and warrant that you have all necessary rights, licenses, and permissions to process the images you submit.
            </p>
          </Section>

          <Section id="disclaimer" title="7. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that: (a) the Service will be uninterrupted or error-free; (b) defects will be corrected; (c) the Service is free of viruses or other harmful components; (d) the results obtained from using the Service will be accurate or reliable; or (e) processed images will be undetectable by all AI detection systems, as detection technology continuously evolves.
            </p>
          </Section>

          <Section id="limitation-liability" title="8. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BLANKAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
            </p>
            <p>
              IN NO EVENT SHALL BLANKAI'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO BLANKAI IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR (B) USD $10.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so the above limitations may not apply to you.
            </p>
          </Section>

          <Section id="indemnification" title="9. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless BlankAI and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with: (a) your access to or use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights, including intellectual property rights; or (d) any content you process through the Service.
            </p>
          </Section>

          <Section id="third-party-links" title="10. Third-Party Links and Services">
            <p>
              The Service may contain links to third-party websites or services. These links are provided for convenience only. BlankAI does not endorse and is not responsible for the content, privacy practices, or terms of any third-party websites. Your interactions with third-party websites are solely between you and those third parties.
            </p>
          </Section>

          <Section id="termination" title="11. Termination">
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, with or without cause or notice, including for violation of these Terms. Upon termination, all licenses granted to you under these Terms will immediately cease.
            </p>
            <p>
              You may stop using the Service at any time. Sections 6, 7, 8, 9, and 13 of these Terms will survive termination.
            </p>
          </Section>

          <Section id="governing-law" title="12. Governing Law and Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising out of or relating to these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration, except that either party may seek injunctive or other equitable relief in a court of competent jurisdiction for matters involving intellectual property rights.
            </p>
          </Section>

          <Section id="changes" title="13. Changes to Terms">
            <p>
              We may revise these Terms at any time by updating this page. The "Last updated" date at the top of this page will reflect when changes were made. For material changes, we will make reasonable efforts to provide notice (e.g., a notice on the Service). Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </Section>

          <Section id="contact" title="14. Contact Us">
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="rounded-xl border border-border bg-card p-5 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-cyan" />
                <span className="font-display font-semibold text-foreground">BlankAI Support</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Email: <a href={`mailto:${contactEmail}`} className="text-cyan hover:underline">{contactEmail}</a></p>
                <p>Website: <a href={siteUrl} className="text-cyan hover:underline">{siteUrl}</a></p>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">← Back to BlankAI</Link>
          <span className="text-border">·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <span className="text-border">·</span>
          <a href={`mailto:${contactEmail}`} className="flex items-center gap-1 hover:text-cyan transition-colors">
            <Mail className="w-3.5 h-3.5" />
            {contactEmail}
          </a>
        </div>
      </main>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
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
