"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

interface Org {
  id: string;
  onchain_id: string;
  name: string;
  industry: string;
  status: string;
  explorer_url: string;
  created_at: string;
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      setOrgs((data as Org[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-slate-500 text-sm">Loading organizations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Organizations</h1>
          <p className="text-sm text-slate-400">Manage your on-chain organizations</p>
        </div>
        <Link href="/organization/new">
          <Button>
            <Plus className="w-4 h-4" /> New Organization
          </Button>
        </Link>
      </div>

      {!orgs.length ? (
        <Card className="text-center py-16">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-4">No organizations yet.</p>
          <Link href="/organization/new">
            <Button>Create your first organization</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgs.map((org) => (
            <Link key={org.id} href={`/organization/${org.id}`}>
              <Card hover className="group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <Badge variant={org.status === "ACTIVE" ? "success" : "muted"}>
                    {org.status}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">
                  {org.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3">{org.industry}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-mono truncate">{org.onchain_id}</span>
                  {org.explorer_url && (
                    <span
                      role="link"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(org.explorer_url, "_blank");
                      }}
                      className="text-teal-500 hover:text-teal-400 flex items-center gap-0.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
