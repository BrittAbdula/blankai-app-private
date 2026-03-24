type AnalyticsValue = string | number | boolean;

type AnalyticsProps = Record<string, AnalyticsValue | null | undefined>;

function cleanProps(props: AnalyticsProps) {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined && value !== null),
  ) as Record<string, AnalyticsValue>;
}

export function trackEvent(name: string, props: AnalyticsProps = {}) {
  if (typeof window === "undefined") return;

  const payload = cleanProps(props);
  const win = window as Window & {
    gtag?: (...args: unknown[]) => void;
    umami?: { track?: (eventName: string, eventData?: Record<string, AnalyticsValue>) => void };
  };

  if (typeof win.umami?.track === "function") {
    win.umami.track(name, payload);
  }

  if (typeof win.gtag === "function") {
    win.gtag("event", name, payload);
  }
}
