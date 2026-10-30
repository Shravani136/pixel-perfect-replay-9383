import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, ShieldCheck, X, ListChecks, Clock, Loader, CheckCircle2 } from "lucide-react";
import type { Status } from "@/lib/complaints";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report" },
  { to: "/track", label: "Track" },
  { to: "/admin", label: "Admin" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span>Civic<span className="text-accent">AI</span></span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="nav-link" activeProps={{ className: "nav-link-active" }} activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="container-page flex flex-col pb-3 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="nav-link" activeProps={{ className: "nav-link-active" }} activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t py-6 text-center text-sm text-muted-foreground">
      CivicAI · Every Complaint Matters. Every Action Counts.
    </footer>
  );
}

export function StatCards({ s }: { s: { total: number; pending: number; inProgress: number; resolved: number } }) {
  const items = [
    { label: "Total", value: s.total, icon: ListChecks, tone: "text-primary" },
    { label: "Pending", value: s.pending, icon: Clock, tone: "text-warning" },
    { label: "In Progress", value: s.inProgress, icon: Loader, tone: "text-accent" },
    { label: "Resolved", value: s.resolved, icon: CheckCircle2, tone: "text-success" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="card-surface p-5">
          <i.icon className={`h-5 w-5 ${i.tone}`} />
          <p className="mt-3 font-display text-3xl font-bold">{i.value}</p>
          <p className="text-sm text-muted-foreground">{i.label}</p>
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const cls = status === "Resolved" ? "badge-success" : status === "In Progress" ? "badge-accent"       : status === "Submitted" ? "badge-muted" : "badge-warning";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function PriorityBadge({ level, score }: { level: string; score: number }) {
  const cls = level === "High" ? "badge-danger" : level === "Medium" ? "badge-warning" : "badge-muted";
  return <span className={`badge ${cls}`}>{level} · {score}</span>;
}

export function PageTitle({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-bold text-primary md:text-4xl">{title}</h1>
      {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground">{children}</div>;
}
