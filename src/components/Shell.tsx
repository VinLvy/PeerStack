import React, { useState } from 'react';
import {
  Bell,
  Code2,
  GitBranch,
  Home,
  LineChart,
  Lightbulb,
  Menu,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { AuditLogEntry, TabRoute, UserRole } from '../types';

interface ShellProps {
  activeTab: TabRoute;
  onTabChange: (tab: TabRoute) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  auditLogs: AuditLogEntry[];
  children: React.ReactNode;
}

const DESKTOP_TABS: Array<{ id: TabRoute; label: string }> = [
  { id: 'landing', label: 'Landing' },
  { id: 'mentee-pipeline', label: 'Mentee Pipeline' },
  { id: 'mentor-workspace', label: 'Mentor Workspace' },
  { id: 'hint-delivery', label: 'Hint Delivery' },
  { id: 'admin-and-metrics', label: 'Admin & Metrics' },
];

const MOBILE_TABS: Array<{ id: TabRoute; label: string; subtitle: string; icon: React.ReactNode }> = [
  { id: 'landing', label: 'Home', subtitle: 'Algorithms Hub', icon: <Home className="w-5 h-5" /> },
  {
    id: 'mentee-pipeline',
    label: 'Queue',
    subtitle: 'Submission Pipeline',
    icon: <GitBranch className="w-5 h-5" />,
  },
  {
    id: 'mentor-workspace',
    label: 'Review',
    subtitle: 'Mentor Review Desk',
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    id: 'hint-delivery',
    label: 'Hints',
    subtitle: 'Socratic Hints',
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    id: 'admin-and-metrics',
    label: 'Metrics',
    subtitle: 'Mastery Metrics',
    icon: <LineChart className="w-5 h-5" />,
  },
];

const ROLES: UserRole[] = ['Mentee', 'Mentor', 'Supervisor/Admin'];

export const Shell: React.FC<ShellProps> = ({
  activeTab,
  onTabChange,
  activeRole,
  onRoleChange,
  auditLogs,
  children,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentMobileTab = MOBILE_TABS.find((t) => t.id === activeTab) || MOBILE_TABS[0];

  const cycleRole = () => {
    const idx = ROLES.indexOf(activeRole);
    const next = ROLES[(idx + 1) % ROLES.length];
    onRoleChange(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8FF] text-[#1A1B23]">
      {/* Desktop Fixed Header */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <aside className="h-8 bg-[#F4F2FE] border-b border-[#CCC3D8]/40 px-8 flex items-center justify-between text-[#4A4455] font-mono text-[10px] tracking-wider">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#630ED4]">IF101 Algorithms Fall 2026 Cohort</span>
            <span aria-hidden="true">·</span>
            <span>Automated Socratic Guardrails &amp; Regex Redaction Active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-[#18181B] text-white font-mono text-[10px]">
              Java 21 LTS Dialectic
            </span>
          </div>
        </aside>

        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#CCC3D8]/40 px-8 shadow-[0_4px_20px_rgba(124,58,237,0.04)]">
          <div className="h-full max-w-[1440px] mx-auto flex items-center justify-between gap-6">
            {/* Brand Zone */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onTabChange('landing')}
                className="flex items-center gap-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded-md px-1"
              >
                <span className="text-lg font-bold tracking-tight text-[#1A1B23] whitespace-nowrap">
                  PeerStack
                </span>
                <span className="font-mono text-xs text-[#7C3AED] font-bold">.io</span>
              </button>
              <div className="h-4 w-px bg-[#CCC3D8]/60" />
              <span className="font-mono text-[11px] text-[#4A4455] whitespace-nowrap">
                IF101 Algorithms
              </span>
            </div>

            {/* 5 Nav Tabs */}
            <nav className="flex items-center gap-6 h-full" aria-label="Primary Workspace">
              {DESKTOP_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onTabChange(tab.id)}
                    className={`h-full flex items-center px-1 text-[13px] whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                      isActive
                        ? 'text-[#7C3AED] font-semibold border-[#7C3AED]'
                        : 'text-[#4A4455] border-transparent hover:text-[#1A1B23]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Role Switcher + Profile */}
            <div className="flex items-center gap-3 shrink-0 relative">
              <div
                className="inline-flex p-0.5 rounded-full bg-[#F4F2FE] border border-[#CCC3D8]/50 font-mono text-[11px] text-[#4A4455]"
                role="group"
                aria-label="Workspace role switcher"
              >
                {ROLES.map((role) => {
                  const selected = activeRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => onRoleChange(role)}
                      className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap shrink-0 ${
                        selected
                          ? 'bg-white text-[#1A1B23] font-semibold shadow-sm'
                          : 'text-[#4A4455] hover:text-[#1A1B23]'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>

              <div className="h-4 w-px bg-[#CCC3D8]/60" />

              <button
                type="button"
                aria-label="Toggle audit activity notifications"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-purple-500/20 text-white hover:opacity-95 transition-opacity"
              >
                <User className="w-4 h-4" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[#CCC3D8]/50 p-4 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E9E7F3]">
                    <span className="font-semibold text-xs text-[#1A1B23]">
                      Active Persona: {activeRole}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-[#5F5E61] hover:text-[#1A1B23]"
                      aria-label="Close activity menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-[#5F5E61] mb-2">RECENT GUARDRAIL EVENTS</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {auditLogs.slice(0, 4).map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2 rounded-xl bg-[#F4F2FE] text-xs flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#5F5E61]">
                          <span className="font-semibold text-[#630ED4]">{entry.actor}</span>
                          <span>{entry.timestamp}</span>
                        </div>
                        <span className="font-medium text-[#1A1B23]">{entry.action}</span>
                        <span className="text-[11px] text-[#4A4455]">{entry.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Top Header (< lg) */}
      <header className="lg:hidden fixed top-0 w-full z-50 bg-[#FBF8FF]/90 backdrop-blur-xl border-b border-[#E9E7F3]">
        <div className="h-14 px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => onTabChange('landing')}
              className="w-9 h-9 rounded-xl bg-[#630ED4] flex items-center justify-center shadow-sm text-white shrink-0"
              aria-label="PeerStack Home"
            >
              <Code2 className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#1A1B23] tracking-tight leading-none">
                  PeerStack
                </span>
                <span className="font-mono text-[10px] font-semibold text-[#630ED4]">IF101</span>
              </div>
              <span className="text-[11px] text-[#4A4455] truncate">{currentMobileTab.subtitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={cycleRole}
              aria-label="Switch active role"
              className="min-h-[40px] px-3 py-1 rounded-full bg-[#E9E7F3] hover:bg-[#E3E1ED] transition-colors text-xs font-medium text-[#1A1B23] whitespace-nowrap"
            >
              {activeRole === 'Supervisor/Admin' ? 'Admin' : activeRole}
            </button>
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label="View notifications"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#4A4455] hover:bg-[#EEECF8] relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#630ED4] ring-2 ring-[#FBF8FF]" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Open quick navigation"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-[#630ED4] text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Quick Drawer */}
        {mobileMenuOpen && (
          <div className="bg-white border-b border-[#E9E7F3] px-4 py-3 space-y-2 shadow-md">
            <div className="flex items-center justify-between text-xs font-mono text-[#5F5E61]">
              <span>ACTIVE ROLE: {activeRole}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#630ED4] font-semibold"
              >
                Close
              </button>
            </div>
            <div className="flex gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onRoleChange(role);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium transition-colors ${
                    activeRole === role
                      ? 'bg-[#630ED4] text-white'
                      : 'bg-[#F4F2FE] text-[#4A4455]'
                  }`}
                >
                  {role === 'Supervisor/Admin' ? 'Supervisor' : role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Notification Sheet */}
        {notifOpen && (
          <div className="bg-white border-b border-[#E9E7F3] px-4 py-3 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-[#630ED4]">
                GUARDRAIL EVENT LOG
              </span>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                className="text-xs text-[#5F5E61]"
              >
                Dismiss
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {auditLogs.slice(0, 3).map((entry) => (
                <div key={entry.id} className="p-2 rounded-xl bg-[#F4F2FE] text-xs">
                  <div className="flex justify-between font-mono text-[10px] text-[#5F5E61]">
                    <span>{entry.actor}</span>
                    <span>{entry.timestamp}</span>
                  </div>
                  <div className="font-medium text-[#1A1B23]">{entry.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full pt-16 lg:pt-28 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto w-full">{children}</div>
      </main>

      {/* Desktop Footer */}
      <footer className="hidden lg:block w-full bg-white border-t border-[#CCC3D8]/40 py-5 px-8 mt-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-[#4A4455] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-[#1A1B23]">PeerStack Socratic Shell</span>
            <span aria-hidden="true">·</span>
            <span>Department of Computer Science &amp; Engineering</span>
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px] text-[#5F5E61]">
            <span>OpenJDK 21.0.3</span>
            <span aria-hidden="true">·</span>
            <span>IF101 Fall 2026 Cohort Framework</span>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Pill Bottom Navigation (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-2 px-4">
        <div className="flex justify-center">
          <nav
            aria-label="Mobile navigation"
            className="pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-xl rounded-full shadow-[0_12px_36px_-6px_rgba(26,27,35,0.16)] border border-[#E9E7F3] p-1 flex items-center justify-between"
          >
            {MOBILE_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-1 min-h-[44px] flex flex-col items-center justify-center rounded-full py-1 transition-all gap-0.5 ${
                    isActive
                      ? 'bg-[#630ED4] text-white shadow-sm font-semibold'
                      : 'text-[#4A4455] hover:text-[#1A1B23]'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
