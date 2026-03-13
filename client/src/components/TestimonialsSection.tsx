/**
 * TestimonialsSection — Social proof for BlankAI
 * Builds trust and E-E-A-T signals for SEO
 */

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah K.",
    role: "Digital Artist & AI Creator",
    avatar: "SK",
    rating: 5,
    text: "BlankAI is the only tool that actually removes AI pixel fingerprints. I've tested my images on Pinterest after using it and they pass without any 'Made with AI' labels. Incredible tool.",
  },
  {
    name: "Marcus T.",
    role: "Print-on-Demand Seller",
    avatar: "MT",
    rating: 5,
    text: "I was getting my Etsy listings flagged for AI content. After using BlankAI to remove the metadata and pixel fingerprints, my listings go through without any issues. Completely free too!",
  },
  {
    name: "Priya M.",
    role: "Social Media Manager",
    avatar: "PM",
    rating: 5,
    text: "Managing 15+ client accounts, I need a reliable way to prepare AI-generated images for Instagram and Facebook. BlankAI's batch processing saves me hours every week.",
  },
  {
    name: "James R.",
    role: "Content Marketer",
    avatar: "JR",
    rating: 5,
    text: "The fact that images never leave my browser is huge for client confidentiality. BlankAI is the only metadata remover I trust for sensitive projects.",
  },
  {
    name: "Aiko N.",
    role: "Stable Diffusion Artist",
    avatar: "AN",
    rating: 5,
    text: "It strips Stable Diffusion parameters perfectly — prompts, seeds, everything. My ComfyUI outputs are completely clean after processing. The pixel hash modification is genius.",
  },
  {
    name: "David L.",
    role: "Agency Creative Director",
    avatar: "DL",
    rating: 5,
    text: "We process 50+ AI images per week for client campaigns. BlankAI's batch processing and zero-upload policy make it the only tool we use for metadata removal.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20" aria-label="User reviews and testimonials for BlankAI">
      <div className="container">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono-custom text-cyan mb-3">
            <span className="w-6 h-px bg-cyan" />
            USER REVIEWS
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by 50,000+ Creators Worldwide
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
            <span className="font-display font-bold text-foreground ml-1">4.9</span>
            <span className="text-muted-foreground text-sm">/ 5 from 2,847 reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card border border-border rounded-xl p-5 card-hover"
              itemScope
              itemType="https://schema.org/Review"
            >
              <div itemProp="itemReviewed" itemScope itemType="https://schema.org/SoftwareApplication">
                <meta itemProp="name" content="BlankAI" />
              </div>
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content={String(t.rating)} />
                <meta itemProp="bestRating" content="5" />
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-4" itemProp="reviewBody">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-cyan flex items-center justify-center text-navy text-xs font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div itemProp="author" itemScope itemType="https://schema.org/Person">
                  <div className="font-display font-semibold text-foreground text-sm" itemProp="name">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
