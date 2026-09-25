import React, { useCallback, useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { AiChatModal } from "../ai/AiChatModal";

export const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] dark:bg-[#0D1B11]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-[#2D6A4F]"></div>
          <p className="text-sm font-semibold text-[#4A4740] dark:text-[#A3C9A8]">
            Loading GreenLife System...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="workspace min-h-screen relative w-full max-w-full">
      {/* Desktop Sidebar Navigation (hidden on mobile) */}
      <a href="#workspace-content" className="skip-link">
        Skip to content
      </a>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Workspace Area: lg:pl-64 aligns perfectly with Sidebar w-64 */}
      <div className="workspace-body">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAiAssistant={() => setAiAssistantOpen(true)}
        />

        {/* Safe bottom padding on mobile so content is not obscured by MobileBottomNav */}
        <main id="workspace-content" className="workspace-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Bottom Dock Navigation (visible only on mobile) */}
      <MobileBottomNav />

      {/* Interactive AI Business Assistant Modal */}
      <AiChatModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </div>
  );
};
