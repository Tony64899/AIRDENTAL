// AppShell — root layout for all protected pages.
// Renders: SideNav (left) + TopBar (top) + main content area.
// Every route inside <ProtectedRoute> is wrapped by this component.

import type { ReactNode } from 'react';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';
import { SessionTimeoutModal } from './SessionTimeoutModal';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    // Full viewport flex layout
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Left navigation */}
      <SideNav />

      {/* Right side: top bar + page content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />

        {/* Page content — each page controls its own scroll behavior */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ⚠️ HIPAA: Session timeout overlay — always present on protected pages */}
      <SessionTimeoutModal />
    </div>
  );
}
