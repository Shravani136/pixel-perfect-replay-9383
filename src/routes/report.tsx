import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTitle, Notice } from "@/components/civic";
import { useComplaints } from "@/hooks/use-complaints";
import { CATEGORIES, nextId, type Complaint } from "@/lib/complaints";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Problem — CivicAI" },
      { name: "description", content: "Submit a civic complaint with category, location and photo." },
      { property: "og:title", content: "Report a Problem — CivicAI" },
      { property: "og:description", content: "Submit a civic complaint in under a minute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Report,
});

const schema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().trim().min(20, "Please describe the problem in at least 20 characters").max(1000),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Choose a category" }) }),
  location: z.string().trim().min(3, "Enter a location").max(150),
});

function Report() {
  const { list, commit } = useComplaints();
  const [form, setForm] = useState({ title: "", description: "", category: "", location: "" });
  const [image, setImage] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ ok: boolean; id?: string | undefined }>();

  const onImage = (f?: File) => {
    if (!f) return setImage(undefined);
    if (f.size > 1_000_000) return setErrors((e) => ({ ...e, image: "Image must be under 1 MB" }));
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    const now = new Date().toISOString();
    const c: Complaint = {
      id: nextId(list),
      ...parsed.data,
      image,
      createdAt: now,
      status: "Pending",
      team: "Unassigned",
      history: [{ date: now, status: "Pending", note: "Complaint received." }],
    };
    const ok = commit([c, ...list]);
    setResult({ ok, id: ok ? c.id : undefined });
    if (ok) setForm({ title: "", description: "", category: "", location: "" });
  };

  if (result?.ok)
    return (
      <div className="card-surface mx-auto max-w-lg p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h1 className="mt-4 font-display text-2xl font-bold">Complaint submitted</h1>
        <p className="mt-2 text-muted-foreground">Your complaint ID is</p>
        <p className="mt-1 font-display text-3xl font-bold text-primary">{result.id}</p>
        <p className="mt-3 text-sm text-muted-foreground">Saved in this browser (demo mode). Keep this ID to track progress.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/analysis/$id" params={{ id: result.id! }}>View analysis</Link></Button>
          <Button asChild variant="outline"><Link to="/track" search={{ id: result.id }}>Track</Link></Button>
          <Button variant="ghost" onClick={() => { setResult(undefined); setImage(undefined); }}>Report another</Button>
        </div>
      </div>
    );

  const F = ({ name, label, children }: { name: string; label: string; children: React.ReactNode }) => (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {errors[name] && <span className="text-sm text-destructive">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Report a Problem" sub="Tell us what's wrong and where. It takes less than a minute." />
      <form onSubmit={submit} className="card-surface space-y-5 p-6" noValidate>
        {result && !result.ok && <p className="text-sm text-destructive">Could not save your complaint. Please try again.</p>}
        {F({ name: "title", label: "Complaint title", children: <input className="field" value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Large pothole near bus stop" /> })}
        {F({ name: "description", label: "Description", children: <textarea className="field min-h-32" value={form.description} maxLength={1000} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is the problem, since when, and how does it affect people?" /> })}
        <div className="grid gap-5 sm:grid-cols-2">
          {F({ name: "category", label: "Category", children: (
            <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          ) })}
          {F({ name: "location", label: "Location", children: <input className="field" value={form.location} maxLength={150} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Street, area, ward" /> })}
        </div>
        {F({ name: "image", label: "Photo (optional)", children: <input type="file" accept="image/*" className="field" onChange={(e) => onImage(e.target.files?.[0])} /> })}
        {image && <img src={image} alt="Preview" className="h-40 rounded-lg object-cover" />}
        <Button type="submit" size="lg" className="w-full">Submit Complaint</Button>
      </form>
      <div className="mt-4"><Notice>Demo mode: complaints are saved in this browser only until a database is connected.</Notice></div>
    </div>
  );
}
