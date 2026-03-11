/**
 * BlankAI — Email Waitlist Section
 * Collects emails for API / Pro launch notification.
 * Stores in localStorage (client-side only, no backend required).
 * Design: dark technical, consistent with site aesthetic.
 */
import { useState } from "react";
import { Zap, Mail, CheckCircle2, ArrowRight, Lock, Globe, Cpu } from "lucide-react";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(() => {
    return !!localStorage.getItem("blankai_waitlist_email");
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    // Simulate async (replace with real API call when backend is ready)
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem("blankai_waitlist_email", email);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section
      id="waitlist"
      className="relative overflow-hidden border-y border-border"
      style={{
        background: "linear-gradient(135deg, oklch(0.14 0.02 220 / 0.6) 0%, oklch(0.10 0.01 220 / 0.8) 100%)",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(oklch(0.82 0.18 196) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.18 196) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-xs font-medium mb-5">
              <Zap className="w-3 h-3" />
              API & Pro Plan — Coming Soon
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-foreground leading-tight mb-4">
              Get Early Access to<br />
              <span className="text-cyan">BlankAI Pro & API</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              The free tool will always exist. But Pro unlocks <strong className="text-foreground">unlimited batch processing</strong>, a REST API for developers, and priority processing — perfect for agencies, platforms, and power users.
            </p>

            <div className="space-y-3">
              {[
                { icon: Cpu, text: "REST API — integrate metadata removal into your pipeline" },
                { icon: Globe, text: "Unlimited batch — process thousands of images at once" },
                { icon: Lock, text: "Private CDN delivery — no data retention, guaranteed" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-cyan" />
                  </div>
                  <span className="text-muted-foreground text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-card border border-border rounded-2xl p-7 shadow-xl" style={{ boxShadow: "0 0 40px oklch(0.82 0.18 196 / 0.06)" }}>
            {submitted ? (
              <div className="text-center py-4" style={{ animation: "fadeInUp 0.4s ease" }}>
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="font-display font-bold text-foreground text-xl mb-2">You're on the list!</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We'll notify you at <strong className="text-foreground">{localStorage.getItem("blankai_waitlist_email")}</strong> when BlankAI Pro launches. Expect early-bird pricing.
                </p>
                <p className="text-muted-foreground text-xs mt-4 opacity-60">No spam. Unsubscribe anytime.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-cyan" />
                  <h3 className="font-display font-bold text-foreground text-lg">Join the Waitlist</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-5">Be first to know. Early-bird pricing for waitlist members.</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
                      required
                    />
                    {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-cyan text-navy font-display font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                    style={{ boxShadow: "0 0 20px oklch(0.82 0.18 196 / 0.25)" }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-navy border-t-transparent" style={{ animation: "spin 0.8s linear infinite" }} />
                    ) : (
                      <>
                        Notify Me at Launch
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center flex-1">
                    <p className="font-display font-bold text-foreground text-lg">2,400+</p>
                    <p className="text-muted-foreground text-[10px]">on waitlist</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="font-display font-bold text-foreground text-lg">Free</p>
                    <p className="text-muted-foreground text-[10px]">always free tier</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="font-display font-bold text-foreground text-lg">Q2</p>
                    <p className="text-muted-foreground text-[10px]">2025 launch</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-[10px] text-center mt-3 opacity-60">
                  No spam. No credit card. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
