"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { submitAndAuditInsight } from "@/lib/genlayer/orditContract";
import { buildClaimPacket, hashClaimPacket } from "@/lib/ordit/hash";
import { getUserWalletAddress } from "@/lib/ordit/walletAddress";
import {
  getDashboardsForOrganizations,
  getDatasetsForOrganizations,
  getOrganizationsForWallet,
} from "@/lib/ordit/contractQueries";
import { FileSearch, Cpu, Zap, Link2, Plus, Trash2 } from "lucide-react";

const schema = z.object({
  org_id: z.string().min(1, "Select an organization"),
  dataset_id: z.string().min(1, "Select a dataset"),
  dashboard_id: z.string().min(1, "Select a dashboard"),
  insight_text: z.string().min(20, "Provide the AI-generated insight (min 20 chars)"),
  metrics: z.string().min(10, "Provide the underlying metrics"),
  assumptions: z.string().min(1, "List the assumptions"),
  business_context: z.string().min(10, "Provide business context"),
});

type FormData = z.infer<typeof schema>;
type EvidenceSource = { label: string; url: string };

export default function NewInsightAuditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<{ value: string; label: string }[]>([]);
  const [datasets, setDatasets] = useState<{ value: string; label: string; orgId: string }[]>([]);
  const [dashboards, setDashboards] = useState<{ value: string; label: string; orgId: string }[]>([]);
  const [evidenceSources, setEvidenceSources] = useState<EvidenceSource[]>([{ label: "Primary source", url: "" }]);
  const [step, setStep] = useState<"form" | "submitting" | "consensus" | "done">("form");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [activeOrg, setActiveOrg] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const wallet = await getUserWalletAddress();
        const ownedOrgs = await getOrganizationsForWallet(wallet);
        const orgIds = ownedOrgs.map((org) => org.id);
        const [orgDatasets, orgDashboards] = await Promise.all([
          getDatasetsForOrganizations(orgIds),
          getDashboardsForOrganizations(orgIds),
        ]);
        setOrgs(ownedOrgs.map((o) => ({ value: o.id, label: o.name })));
        setDatasets(orgDatasets.map((d) => ({ value: d.id, label: d.name, orgId: d.org_id })));
        setDashboards(orgDashboards.map((d) => ({ value: d.id, label: d.name, orgId: d.org_id })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connect a wallet to load contract data");
      }
    }
    load();
  }, []);

  const filteredDatasets = datasets.filter((d) => d.orgId === activeOrg);
  const filteredDashboards = dashboards.filter((d) => d.orgId === activeOrg);

  const updateEvidenceSource = (index: number, patch: Partial<EvidenceSource>) => {
    setEvidenceSources((sources) => sources.map((source, i) => (i === index ? { ...source, ...patch } : source)));
  };

  const validEvidenceSources = () =>
    evidenceSources
      .map((source) => ({ label: source.label.trim(), url: source.url.trim() }))
      .filter((source) => source.url.startsWith("https://") || source.url.startsWith("http://"));

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setStep("submitting");

    try {
      const walletAddress = await getUserWalletAddress();
      const sources = validEvidenceSources();
      if (!sources.length) throw new Error("Add at least one http(s) evidence source URL validators can fetch.");

      const evidenceSourceJson = JSON.stringify(sources);
      const packet = buildClaimPacket({
        ...data,
        evidence_manifest: evidenceSourceJson,
        evidence_sources: sources,
      });
      const claimHash = await hashClaimPacket(packet);

      setStep("consensus");

      const ts = new Date().toISOString();
      const { request } = await submitAndAuditInsight(
        {
          request_id: "",
          org_id: data.org_id,
          dataset_id: data.dataset_id,
          dashboard_id: data.dashboard_id,
          insight_text: data.insight_text,
          metrics: data.metrics,
          assumptions: data.assumptions,
          business_context: data.business_context,
          claim_hash: claimHash,
          evidence_manifest_hash: claimHash,
          evidence_source_urls: evidenceSourceJson,
          submitted_at: ts,
          adjudicated_at: ts,
        },
        walletAddress,
      );

      setStep("done");
      router.push(`/case/${request.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = {
    form: null,
    submitting: "Submitting insight to OrditContract...",
    consensus: "GenLayer validators fetching evidence and reaching consensus...",
    done: "Consensus complete, redirecting...",
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Submit Insight Audit</h1>
        <p className="text-sm text-slate-400">
          Validators fetch the evidence URLs inside GenVM before deciding whether the insight is supported.
        </p>
      </div>

      {step !== "form" && (
        <Card className="mb-6 border-indigo-500/20">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
            <p className="text-sm text-indigo-300">{stepLabels[step]}</p>
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Insight Audit Form</p>
              <p className="text-xs text-slate-500">Evidence must be reachable by GenLayer validators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Organization"
              options={orgs}
              placeholder="Select..."
              error={errors.org_id?.message}
              value={activeOrg}
              onChange={(e) => {
                const val = e.target.value;
                setActiveOrg(val);
                setValue("org_id", val, { shouldValidate: true });
                setValue("dataset_id", "");
                setValue("dashboard_id", "");
              }}
            />
            <Select label="Dataset" options={filteredDatasets} placeholder="Select..." error={errors.dataset_id?.message} {...register("dataset_id")} />
            <Select label="Dashboard" options={filteredDashboards} placeholder="Select..." error={errors.dashboard_id?.message} {...register("dashboard_id")} />
          </div>

          <Textarea label="AI-Generated Insight" placeholder="Paste the exact AI-generated insight or narrative here..." rows={5} error={errors.insight_text?.message} {...register("insight_text")} />
          <Textarea label="Claimed Metrics" placeholder="Revenue: $4.2M (+18% YoY), Units sold: 12,400..." rows={4} error={errors.metrics?.message} hint="These claims are checked against validator-fetched sources" {...register("metrics")} />
          <Textarea label="Stated Assumptions" placeholder="Seasonality not adjusted, CAC based on last 90 days only..." rows={3} error={errors.assumptions?.message} {...register("assumptions")} />
          <Textarea label="Business Context" placeholder="This report will be used to determine Q4 budget allocation..." rows={3} error={errors.business_context?.message} {...register("business_context")} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Evidence Sources</label>
              <button
                type="button"
                onClick={() => setEvidenceSources((sources) => [...sources, { label: "", url: "" }])}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add source
              </button>
            </div>
            {evidenceSources.map((source, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[160px_1fr_32px] gap-2">
                <Input
                  placeholder="Label"
                  value={source.label}
                  onChange={(e) => updateEvidenceSource(index, { label: e.target.value })}
                />
                <Input
                  placeholder="https://public-report-or-api.example/data"
                  value={source.url}
                  onChange={(e) => updateEvidenceSource(index, { url: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setEvidenceSources((sources) => sources.filter((_, i) => i !== index))}
                  className="h-10 rounded-lg border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center"
                  aria-label="Remove source"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link2 className="w-3 h-3" />
              Use public URLs, API endpoints, IPFS/Arweave gateways, or signed report links that validators can independently fetch.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading} className="gap-2">
              <Zap className="w-4 h-4" />
              Submit for Consensus
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
