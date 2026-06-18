import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ServiceDetail from "./pages/ServiceDetail";
import AboutUs from "./pages/AboutUs";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import CustomPage from "./pages/CustomPage";
import ServicePageDetail from "./pages/ServicePageDetail";

const Admin = lazy(() => import("./pages/Admin"));
const AdminEditor = lazy(() => import("./pages/AdminEditor"));

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/services/:serviceSlug/:pageSlug">
        <ServicePageDetail />
      </Route>
      <Route path="/services/:slug">
        <ServiceDetail />
      </Route>
      <Route path="/about">
        <AboutUs />
      </Route>
      <Route path="/articles">
        <Articles />
      </Route>
      <Route path="/articles/:slug">
        <ArticleDetail />
      </Route>
      <Route path="/pages/:slug">
        <CustomPage />
      </Route>
      <Route path="/admin/editor">
        <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading editor...</div>}>
          <AdminEditor />
        </Suspense>
      </Route>
      <Route path={"/admin"}>
        <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading admin...</div>}>
          <Admin />
        </Suspense>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
