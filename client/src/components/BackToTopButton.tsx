import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setVisible(window.scrollY > 560);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-cyan/20 bg-background/80 text-cyan shadow-[0_16px_40px_rgba(4,10,20,0.24)] backdrop-blur-md transition-all duration-200 hover:border-cyan/35 hover:bg-background hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 sm:bottom-6 sm:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-4.5 w-4.5" />
    </button>
  );
}
