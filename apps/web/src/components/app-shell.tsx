import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Events", href: "/dashboard" },
  { label: "Campaigns", href: "/dashboard" },
  { label: "Attendees", href: "/dashboard" },
  { label: "Payments", href: "/dashboard" },
  { label: "Agent Runs", href: "/dashboard" },
  { label: "Templates", href: "/dashboard" },
  { label: "Integrations", href: "/dashboard" },
  { label: "Organization Settings", href: "/dashboard" }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-card lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/dashboard" className="text-lg font-semibold tracking-normal">
            Orchestraiq
          </Link>
          <p className="hidden text-sm text-muted-foreground lg:mt-1 lg:block">OpsPilot command center</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:grid lg:overflow-visible lg:px-3 lg:py-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </section>
    </main>
  );
}
