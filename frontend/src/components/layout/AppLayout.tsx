import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { AiChatModal } from '../ai/AiChatModal';

export const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] dark:bg-[#0D1B11]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-[#2D6A4F]"></div>
          <p className="text-sm font-semibold text-[#4A4740] dark:text-[#A3C9A8]">Loading GreenLife System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-[#0D1B11] text-[#1C1A15] dark:text-[#F4F7F4] flex transition-colors duration-200 relative overflow-x-hidden w-full max-w-full">
      {/* Desktop Sidebar Navigation (hidden on mobile) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Area: lg:pl-64 aligns perfectly with Sidebar w-64 */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full min-w-0 max-w-full overflow-x-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAiAssistant={() => setAiAssistantOpen(true)}
        />

        {/* Safe bottom padding on mobile so content is not obscured by MobileBottomNav */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-7xl w-full mx-auto overflow-x-hidden">
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
