import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus2, Search, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCards, Notice } from "@/components/civic";
import { useComplaints } from "@/hooks/use-complaints";
import { stats } from "@/lib/complaints";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicAI — Every Complaint Matters" },
      { name: "description", content: "Report local civic issues, see their priority, and track them until resolved." },
      { property: "og:title", content: "CivicAI — Every Complaint Matters" },
      { property: "og:description", content: "From complaints to action: report and track civic issues." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { list } = useComplaints();
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-brand px-6 py-14 text-primary-foreground md:px-12 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">From Complaints to Action</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">
          Every Complaint Matters. Every Action Counts.
        </h1>
        <p className="mt-4 max-w-xl opacity-90">
          CivicAI helps citizens report local problems — potholes, garbage, broken streetlights — and helps city teams
          prioritise and resolve them faster.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary"><Link to="/report"><FilePlus2 /> Report a Problem</Link></Button>
          <Button asChild size="lg" variant="secondary"><Link to="/track"><Search /> Track My Complaint</Link></Button>
          <Button asChild size="lg" variant="secondary"><Link to="/admin"><LayoutDashboard /> Admin Dashboard</Link></Button>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-primary">Complaint statistics</h2>
        <StatCards s={stats(list)} />
        <Notice>Demo mode: sample complaints are stored in this browser only. No database is connected yet.</Notice>
      </section>
    </div>
  );
}
