export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Database, Plus, ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function DatasetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: datasets } = await supabase
    .from("datasets")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Datasets</h1>
          <p className="text-sm text-slate-400">Registered data sources for insight auditing</p>
        </div>
        <Link href="/dataset/new">
          <Button><Plus className="w-4 h-4" /> Register Dataset</Button>
        </Link>
      </div>

      {!datasets?.length ? (
        <Card className="text-center py-16">
          <Database className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-4">No datasets registered yet.</p>
          <Link href="/dataset/new"><Button>Register your first dataset</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {datasets.map((d) => (
            <Card key={d.id} hover>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{d.name}</p>
                    <Badge variant={d.status === "ACTIVE" ? "success" : "muted"}>{d.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {(d.organizations as { name?: string } | null)?.name ?? "—"} · Source: {d.source}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
                  <span className="font-mono">{d.onchain_id}</span>
                  {d.explorer_url && (
                    <a href={d.explorer_url} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-400">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
