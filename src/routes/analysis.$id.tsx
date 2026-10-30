import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle, PriorityBadge, StatusBadge, Notice } from "@/components/civic";
import { useComplaints } from "@/hooks/use-complaints";
import { analyze } from "@/lib/complaints";

export const Route = createFileRoute("/analysis/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Analysis ${params.id} — CivicAI` },
      { name: "description", content: "Summary, category, priority and recommended action for a complaint." },
      { property: "og:title", content: `Complaint analysis — CivicAI` },
      { property: "og:description", content: "Automated priority scoring and duplicate detection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analysis,
});

function Analysis() {
  const { id } = Route.useParams();
  const { list, ready } = useComplaints();
  if (!ready) return null;
  const c = list.find((x) => x.id === id);
  if (!c) return <p>Complaint {id} not found. <Link to="/track" className="text-accent underline">Search again</Link></p>;
  const a = analyze(c, list);

  return (
    <div className="space-y-6">
      <PageTitle title="Complaint Analysis" sub={<>{c.id} · <StatusBadge status={c.status} /></>} />
      <Notice>Analysis is rule-based (keyword matching). No AI model is connected yet.</Notice>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface space-y-3 p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-primary">Original complaint</h2>
          <p className="font-semibold">{c.title}</p>
          <p className="text-muted-foreground">{c.description}</p>
          <p className="text-sm">📍 {c.location} · Reported as <b>{c.category}</b></p>
          {c.image && <img src={c.image} alt="Complaint" className="max-h-64 rounded-lg object-cover" />}
        </div>
        <div className="card-surface space-y-3 p-6">
          <h2 className="font-display text-lg font-bold text-primary">Priority</h2>
          <p className="font-display text-5xl font-bold">{a.score}<span className="text-lg text-muted-foreground">/100</span></p>
          <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-brand" style={{ width: `${a.score}%` }} /></div>
          <PriorityBadge level={a.level} score={a.score} />
          <p className="text-sm text-muted-foreground">{a.explanation}</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Box title="Summary">{a.summary}</Box>
        <Box title="Detected category">{a.detected}{a.detected !== c.category && <span className="block text-sm text-muted-foreground">Differs from reported: {c.category}</span>}</Box>
        <Box title="Recommended action">{a.action}<span className="block text-sm text-muted-foreground">Suggested team: {a.team}</span></Box>
      </div>
      <Box title="Possible duplicates">
        {a.duplicates.length === 0 ? "No similar complaints found." : (
          <ul className="space-y-2">
            {a.duplicates.map((d) => (
              <li key={d.id}><Link to="/analysis/$id" params={{ id: d.id }} className="text-accent underline">{d.id}</Link> — {d.title} ({d.location})</li>
            ))}
          </ul>
        )}
      </Box>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-surface p-6">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
