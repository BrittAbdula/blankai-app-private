import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BackToTopButton from "@/components/BackToTopButton";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ImageDiff from "./pages/ImageDiff";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ExifViewer from "./pages/ExifViewer";
import LandingPage from "./pages/LandingPage";
import HubPage from "./pages/HubPage";
import { HUBS, landingPages, type HubKey } from "./data/landingPages";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/image-diff"} component={ImageDiff} />
      <Route path={"/exif-viewer"} component={ExifViewer} />
      {(Object.keys(HUBS) as HubKey[]).map((key) => (
        <Route key={key} path={HUBS[key].path}>
          <HubPage hubKey={key} />
        </Route>
      ))}
      {landingPages.map((page) => (
        <Route key={page.slug} path={`/${page.slug}`}>
          <LandingPage slug={page.slug} />
        </Route>
      ))}
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
          <BackToTopButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
