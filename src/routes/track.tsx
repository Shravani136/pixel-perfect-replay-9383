import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PageTitle, StatusBadge } from "@/components/civic";
import { useComplaints } from "@/hooks/use-complaints";

export const Route = createFileRoute("/track")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Track My Complaint — CivicAI" },
      { name: "description", content: "Check status and progress of your complaint using its ID." },
      { property: "og:title", content: "Track My Complaint — CivicAI" },
      { property: "og:description", content: "See status and progress history of your complaint." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Track,
});

function Track() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: "/track" });
  const { list, ready } = useComplaints();
  const [q, setQ] = useState(id ?? "");
  useEffect(() => setQ(id ?? ""), [id]);
  const c = id ? list.find((x) => x.id.toLowerCase() === id.trim().toLowerCase()) : undefined;
  const latest = c?.history[c.history.length - 1];

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Track My Complaint" sub="Enter your complaint ID, e.g. CIV-1001." />
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); navigate({ search: { id: q.trim() || undefined } }); }}>
        <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="CIV-1001" maxLength={20} />
        <Button type="submit">Search</Button>
      </form>
      {ready && id && !c && <p className="mt-6 text-destructive">No complaint found with ID "{id}".</p>}
      {c && (
        <div className="card-surface mt-6 space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">{c.id} · {c.category}</p>
              <h2 className="font-display text-xl font-bold">{c.title}</h2>
              <p className="text-sm">📍 {c.location}</p>
            </div>
            <StatusBadge status={c.status} />
          </div>
          <p className="text-muted-foreground">{c.description}</p>
          <p className="text-sm">Assigned team: <b>{c.team}</b></p>
          {latest && <div className="rounded-lg bg-secondary p-4 text-sm"><b>Latest update:</b> {latest.note}</div>}
          <div>
            <h3 className="mb-3 font-semibold">Progress history</h3>
            <ol className="space-y-4 border-l-2 border-accent/40 pl-5">
              {c.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-accent" />
                  <p className="text-sm font-semibold">{h.status} <span className="font-normal text-muted-foreground">· {new Date(h.date).toLocaleString()}</span></p>
                  <p className="text-sm">{h.note}</p>
                </li>
              ))}
            </ol>
          </div>
          <Link to="/analysis/$id" params={{ id: c.id }} className="text-sm text-accent underline">View analysis</Link>
        </div>
      )}
    </div>
  );
}
