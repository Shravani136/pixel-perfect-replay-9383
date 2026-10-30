import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageTitle, StatCards, StatusBadge, PriorityBadge, Notice } from "@/components/civic";
import { useComplaints } from "@/hooks/use-complaints";
import { analyze, CATEGORIES, hotspots, stats, STATUSES, TEAMS, type Status, type Team } from "@/lib/complaints";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CivicAI" },
      { name: "description", content: "Review, prioritise, assign and resolve civic complaints." },
      { property: "og:title", content: "Admin Dashboard — CivicAI" },
      { property: "og:description", content: "Manage civic complaints and spot hotspots." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { list, commit } = useComplaints();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [st, setSt] = useState("");
  const [sel, setSel] = useState<string>();
  const [note, setNote] = useState("");

  const rows = useMemo(
    () =>
      list
        .filter((c) => (!cat || c.category === cat) && (!st || c.status === st))
        .filter((c) => `${c.id} ${c.title} ${c.location}`.toLowerCase().includes(q.toLowerCase()))
        .map((c) => ({ c, a: analyze(c, list) }))
        .sort((x, y) => y.a.score - x.a.score),
    [list, q, cat, st],
  );
  const selected = rows.find((r) => r.c.id === sel) ?? (sel ? { c: list.find((c) => c.id === sel)!, a: undefined } : undefined);
  const spots = hotspots(list.filter((c) => c.status !== "Resolved"));

  const update = (patch: { status?: Status; team?: Team }) => {
    if (!selected?.c) return;
    const c = selected.c;
    const status = patch.status ?? c.status;
    const team = patch.team ?? c.team;
    const msg = note.trim() || (patch.team ? `Assigned to ${team}.` : `Status changed to ${status}.`);
    const next = list.map((x) =>
      x.id === c.id ? { ...x, status, team, history: [...x.history, { date: new Date().toISOString(), status, note: msg.slice(0, 300) }] } : x,
    );
    if (commit(next)) { toast.success("Complaint updated"); setNote(""); }
    else toast.error("Update failed — not saved");
  };

  return (
    <div className="space-y-8">
      <PageTitle title="Admin Dashboard" sub="Complaints sorted by priority score." />
      <Notice>Demo mode: no login or database yet. Changes are saved in this browser only.</Notice>
      <StatCards s={stats(list)} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <input className="field" placeholder="Search ID, title, location" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="field" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="field" value={st} onChange={(e) => setSt(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            {rows.length === 0 && <p className="text-muted-foreground">No complaints match.</p>}
            {rows.map(({ c, a }) => (
              <button key={c.id} onClick={() => setSel(c.id)}
                className={`card-surface flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left transition hover:border-accent ${sel === c.id ? "border-accent" : ""}`}>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{c.id} · {c.category} · {c.team}</p>
                  <p className="truncate font-semibold">{c.title}</p>
                  <p className="text-sm text-muted-foreground">📍 {c.location}</p>
                </div>
                <div className="flex gap-2"><PriorityBadge level={a.level} score={a.score} /><StatusBadge status={c.status} /></div>
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card-surface p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-primary">Hotspots (open issues)</h2>
            <ul className="space-y-2">
              {spots.map(([area, n]) => (
                <li key={area} className="text-sm">
                  <div className="flex justify-between"><span>{area}</span><b>{n}</b></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-gradient-brand" style={{ width: `${(n / (spots[0]?.[1] ?? 1)) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </div>

          {selected?.c ? (
            <div className="card-surface space-y-4 p-5">
              <div>
                <p className="text-xs text-muted-foreground">{selected.c.id}</p>
                <h2 className="font-display text-lg font-bold">{selected.c.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selected.c.description}</p>
              </div>
              {selected.a && (
                <div className="rounded-lg bg-secondary p-3 text-sm space-y-1">
                  <p><b>Priority:</b> {selected.a.score}/100 ({selected.a.level})</p>
                  <p>{selected.a.explanation}</p>
                  <p><b>Suggested:</b> {selected.a.action}</p>
                  <p className="text-xs text-muted-foreground">Rule-based analysis, not AI.</p>
                </div>
              )}
              <label className="block space-y-1 text-sm"><span className="font-medium">Assign team</span>
                <select className="field" value={selected.c.team} onChange={(e) => update({ team: e.target.value as Team })}>
                  {TEAMS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="block space-y-1 text-sm"><span className="font-medium">Update note (optional)</span>
                <input className="field" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Crew dispatched" />
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <Button key={s} size="sm" variant={selected.c.status === s ? "default" : "outline"} onClick={() => update({ status: s })}>{s}</Button>
                ))}
              </div>
              <Link to="/analysis/$id" params={{ id: selected.c.id }} className="text-sm text-accent underline">Full analysis</Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a complaint to see details and take action.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
