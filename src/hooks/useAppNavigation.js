import { useState, useCallback, useEffect } from "react";
import { getGmailToken, listenForAuthChanges, supabase } from "../lib/supabase";

/**
 * Manages all top-level navigation state and handlers.
 * Returns page visibility flags + all navigate* callbacks.
 */
export function useAppNavigation() {
  // Tự động khởi tạo phiên làm việc local để người dùng vào thẳng Canvas / Projects
  if (typeof window !== "undefined") {
    if (!localStorage.getItem("office_weave_token")) {
      localStorage.setItem("office_weave_token", "dev_token_office_weave_2026");
    }
    if (!localStorage.getItem("user_data")) {
      localStorage.setItem(
        "user_data",
        JSON.stringify({
          id: "user_dev_01",
          email: "developer@workflow.ai",
          name: "Developer",
          provider: "local",
        }),
      );
    }
  }

  const [showLanding, setShowLanding] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showProjectManagement, setShowProjectManagement] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState(["projects"]);
  const [projectManagementKey, setProjectManagementKey] = useState(0);

  // ── Supabase auth listener ────────────────────────────────────────────────
  useEffect(() => {
    listenForAuthChanges();
    getGmailToken().then((token) => {
      if (token) console.log("✅ Gmail token available on mount");
    });

    const handleAuthChanged = (e) => {
      const userData = e.detail;
      if (userData?.email && localStorage.getItem("office_weave_token")) {
        setShowLanding(false);
        setShowSignIn(false);
        setShowSignUp(false);
        setShowProjectManagement(true);
        setProjectManagementKey((k) => k + 1);
        setNavigationHistory(["projects"]);
        window.history.replaceState({ page: "projects" }, "", "#/projects");
      }
    };

    window.addEventListener("auth-changed", handleAuthChanged);
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, []);

  // ── Browser history (popstate) ────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", ""),
    );
    const isOAuthCallback = !!(
      params.get("access_token") || hashParams.get("access_token")
    );

    if (!window.history.state && !isOAuthCallback) {
      window.history.replaceState({ page: "landing" }, "", "#/");
    }

    const handlePopState = (e) => {
      const page = e.state?.page;
      if (!page) return;

      if (page === "landing") {
        setShowLanding(true);
        setShowSignIn(false);
        setShowProjectManagement(false);
        setShowSettings(false);
        setShowDocumentation(false);
        setCurrentProject(null);
        setNavigationHistory(["landing"]);
      } else if (page === "signin") {
        setShowLanding(false);
        setShowSignIn(true);
        setShowProjectManagement(false);
        setShowSettings(false);
        setShowDocumentation(false);
        setCurrentProject(null);
        setNavigationHistory(["landing", "signin"]);
      } else if (page === "projects") {
        setShowLanding(false);
        setShowSignIn(false);
        setShowProjectManagement(true);
        setShowSettings(false);
        setShowDocumentation(false);
        setCurrentProject(null);
        setNavigationHistory((prev) => {
          const idx = prev.indexOf("projects");
          return idx >= 0 ? prev.slice(0, idx + 1) : ["landing", "projects"];
        });
      } else if (page === "settings") {
        setShowLanding(false);
        setShowSignIn(false);
        setShowProjectManagement(false);
        setShowSettings(true);
        setShowDocumentation(false);
        setCurrentProject(null);
        setNavigationHistory(["landing", "projects", "settings"]);
      } else if (page === "docs") {
        setShowLanding(false);
        setShowSignIn(false);
        setShowProjectManagement(false);
        setShowSettings(false);
        setShowDocumentation(true);
        setCurrentProject(null);
        setNavigationHistory(["landing", "docs"]);
      } else if (page === "canvas") {
        setShowLanding(false);
        setShowSignIn(false);
        setShowProjectManagement(false);
        setShowSettings(false);
        setShowDocumentation(false);
        setNavigationHistory(["landing", "projects", "canvas"]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const navigateToSignIn = useCallback(() => {
    setShowLanding(false);
    setShowSignIn(true);
    setShowSignUp(false);
    setNavigationHistory((prev) => [...prev, "signin"]);
    window.history.pushState({ page: "signin" }, "", "#/signin");
  }, []);

  const navigateToSignUp = useCallback(() => {
    setShowSignIn(false);
    setShowSignUp(true);
    setNavigationHistory((prev) => [...prev, "signup"]);
    window.history.pushState({ page: "signup" }, "", "#/signup");
  }, []);

  const navigateBackToSignIn = useCallback(() => {
    setShowSignUp(false);
    setShowSignIn(true);
    setNavigationHistory((prev) => [...prev, "signin"]);
    window.history.pushState({ page: "signin" }, "", "#/signin");
  }, []);

  const navigateToSettings = useCallback(() => {
    setShowProjectManagement(false);
    setShowSettings(true);
    setShowDocumentation(false);
    setCurrentProject(null);
    setNavigationHistory((prev) => [...prev, "settings"]);
    window.history.pushState({ page: "settings" }, "", "#/settings");
  }, []);

  const navigateToDocumentation = useCallback(() => {
    setShowLanding(false);
    setShowProjectManagement(false);
    setShowSettings(false);
    setShowDocumentation(true);
    setCurrentProject(null);
    setNavigationHistory((prev) => [...prev, "docs"]);
    window.history.pushState({ page: "docs" }, "", "#/docs");
  }, []);

  const navigateBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleSignIn = useCallback(() => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowLanding(false);
    setShowProjectManagement(true);
    setProjectManagementKey((k) => k + 1);
    setNavigationHistory(["projects"]);
    window.history.replaceState({ page: "projects" }, "", "#/projects");
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut error:", e.message);
    }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("office_weave_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("gmail_access_token");
    localStorage.removeItem("gmail_refresh_token");

    setShowProjectManagement(false);
    setShowLanding(true);
    setCurrentProject(null);
    setNavigationHistory(["landing"]);
    window.history.pushState({ page: "landing" }, "", "#/");
  }, []);

  const navigateToCanvas = useCallback((project) => {
    setCurrentProject(project);
    setShowProjectManagement(false);
    setNavigationHistory((prev) => [...prev, "canvas"]);
    window.history.pushState(
      { page: "canvas", projectId: project.id },
      "",
      `#/project/${project.id}`,
    );
  }, []);

  return {
    // Page flags
    showLanding,
    showSignIn,
    showSignUp,
    showProjectManagement,
    showSettings,
    showDocumentation,
    currentProject,
    setCurrentProject,
    navigationHistory,
    projectManagementKey,

    // Handlers
    navigateToSignIn,
    navigateToSignUp,
    navigateBackToSignIn,
    navigateToSettings,
    navigateToDocumentation,
    navigateBack,
    navigateToCanvas,
    handleSignIn,
    handleLogout,
  };
}
