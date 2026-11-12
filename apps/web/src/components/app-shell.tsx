"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  Bot,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Layers3,
  Megaphone,
  PlugZap,
  Settings2,
  Users
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/workspace/events", icon: CalendarDays },
  { label: "Campaigns", href: "/workspace/campaigns", icon: Megaphone },
  { label: "Attendees", href: "/workspace/attendees", icon: Users },
  { label: "Payments", href: "/workspace/payments", icon: CreditCard },
  { label: "Agent Runs", href: "/workspace/agent-runs", icon: Bot },
  { label: "Templates", href: "/workspace/templates", icon: Layers3 },
  { label: "Integrations", href: "/workspace/integrations", icon: PlugZap },
  { label: "Settings", href: "/workspace/settings", icon: Settings2 }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="app-canvas min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sidebar-surface border-b border-white/10 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:pt-6">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--signal))] text-sm font-bold text-white shadow-lg shadow-emerald-950/30">O</span>
            <span>
              <span className="block text-lg leading-none">Orchestraiq</span>
              <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">OpsPilot OS</span>
            </span>
          </Link>
          <Link href="/login" className="rounded-md px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white lg:mt-7 lg:inline-block">
            Account
          </Link>
        </div>
        <nav className="grid grid-cols-3 gap-1 border-t border-white/10 px-3 py-3 sm:grid-cols-5 lg:grid-cols-1 lg:border-t-0 lg:px-3 lg:py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-center text-[11px] font-medium transition lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-left lg:text-sm ${isActive ? "nav-link-active" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mx-4 mb-5 mt-2 hidden rounded-lg border border-white/10 bg-white/5 p-3 lg:block">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <span className="agent-orb relative grid h-2.5 w-2.5 place-items-center rounded-full bg-[hsl(var(--signal))]" />
            OpsPilot is ready
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">Create an event brief to begin an agent workflow.</p>
          <div className="agent-progress relative mt-3 h-1 overflow-hidden rounded-full bg-white/10" />
        </div>
      </aside>
      <section className="min-w-0">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">{children}</div>
      </section>
    </main>
  );
}
