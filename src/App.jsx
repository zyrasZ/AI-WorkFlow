import { AnimatePresence, motion } from "framer-motion";

import LandingPage from "./pages/Landing/LandingPage";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ProjectManagement from "./pages/Dashboard/ProjectManagement";
import Settings from "./pages/Settings/Settings";
import Documentation from "./pages/Docs/Documentation";
import CanvasView from "./components/canvas/CanvasView";
import { pageVariants } from "./components/canvas/nodeTypes";

import { useAppNavigation } from "./hooks/useAppNavigation";
import { useOAuthCallback } from "./hooks/useOAuthCallback";
import { apiClient } from "./lib/api";

export default function App() {
  const {
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
    navigateToSignIn,
    navigateToSignUp,
    navigateBackToSignIn,
    navigateToSettings,
    navigateToDocumentation,
    navigateBack,
    navigateToCanvas,
    handleSignIn,
    handleLogout,
  } = useAppNavigation();

  // Handle Google OAuth redirect on mount
  useOAuthCallback({
    onSuccess: () => handleSignIn(),
    onError: () => navigateToSignIn(),
  });

  // Navigate to canvas: update nav state then load project data
  const handleOpenProject = async (project) => {
    navigateToCanvas(project);
    try {
      const response = await apiClient.getWorkflow(project.id);
      const workflow = response.data;
      const nodes = workflow.metadata?.nodes || workflow.nodes || [];
      const edges = workflow.metadata?.edges || workflow.edges || [];
      setCurrentProject({ ...project, nodes, edges, _loaded: true });
    } catch (err) {
      console.error("❌ Failed to load project:", err);
      setCurrentProject({ ...project, nodes: [], edges: [], _loaded: true });
    }
  };

  return (
    <>
      {/* ── Auth & marketing pages ── */}
      <AnimatePresence mode="wait">
        {showLanding && (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 100,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <LandingPage
              onEnter={handleSignIn}
              onNavigateToDocs={navigateToDocumentation}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showDocumentation && (
          <motion.div
            key="documentation"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 95,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Documentation onBack={navigateBack} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showSignIn && (
          <motion.div
            key="signin"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: "absolute", inset: 0, zIndex: 95 }}
          >
            <SignIn
              onSignIn={handleSignIn}
              onNavigateToSignUp={navigateToSignUp}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showSignUp && (
          <motion.div
            key="signup"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: "absolute", inset: 0, zIndex: 95 }}
          >
            <SignUp
              onSignUp={handleSignIn}
              onNavigateToSignIn={navigateBackToSignIn}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Project management ── */}
      <AnimatePresence mode="wait">
        {showProjectManagement && !currentProject && (
          <motion.div
            key="project-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", inset: 0, zIndex: 90 }}
          >
            <ProjectManagement
              key={projectManagementKey}
              onOpenProject={handleOpenProject}
              onBack={navigationHistory.length > 1 ? navigateBack : null}
              onLogout={handleLogout}
              onSettings={navigateToSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings ── */}
      <AnimatePresence mode="wait">
        {showSettings && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", inset: 0, zIndex: 95 }}
          >
            <Settings onBack={navigateBack} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Canvas workspace ── */}
      {currentProject && (
        <CanvasView
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
          navigationHistory={navigationHistory}
          onBack={navigateBack}
          onNavigateToCanvas={handleOpenProject}
        />
      )}
    </>
  );
}
