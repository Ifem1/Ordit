"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
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
import { syncInsightRequest, logAuditEvent } from "@/lib/ordit/contractSync";
import { buildClaimPacket, hashClaimPacket } from "@/lib/ordit/hash";
import { getUserWalletAddress } from "@/lib/ordit/walletAddress";
import { createClient } from "@/lib/supabase/client";
import { FileSearch, Upload, Cpu, Zap } from "lucide-react";

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

export default function NewInsightAuditPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<{ value: string; label: string }[]>([]);
  const [datasets, setDatasets] = useState<{ value: string; label: string }[]>([]);
  const [dashboards, setDashboards] = useState<{ value: string; label: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<"form" | "submitting" | "consensus" | "done">("form");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [activeOrg, setActiveOrg] = useState<string>("");

  useEffect(() => {
    supabase.from("organizations").select("id, name, onchain_id").then(({ data }) => {
      if (data) setOrgs(data.map((o) => ({ value: o.id, label: o.name })));
    });
  }, []);

  useEffect(() => {
    if (!activeOrg) return;
    setDatasets([]);
    setDashboards([]);
    supabase
      .from("datasets")
      .select("id, name, onchain_id")
      .eq("org_id", activeOrg)
      .then(({ data }) => {
        if (data) setDatasets(data.map((d) => ({ value: d.onchain_id, label: d.name })));
      });
    supabase
      .from("dashboards")
      .select("id, name, onchain_id")
      .eq("org_id", activeOrg)
      .then(({ data }) => {
        if (data) setDashboards(data.map((d) => ({ value: d.onchain_id, label: d.name })));
      });
  }, [activeOrg]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setStep("submitting");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const walletAddress = await getUserWalletAddress();

      // Resolve org onchain_id from Supabase UUID
      const { data: orgRow } = await supabase
        .from("organizations")
        .select("onchain_id")
        .eq("id", data.org_id)
        .single();
      const orgOnchainId = orgRow?.onchain_id ?? data.org_id;

      // Upload evidence files
      const evidenceManifest: string[] = [];
      for (const file of files) {
        const path = `evidence/${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("evidence").upload(path, file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("evidence").getPublicUrl(path);
          evidenceManifest.push(urlData.publicUrl);
        }
      }

      const packet = buildClaimPacket({
        ...data,
        org_id: orgOnchainId,
        evidence_manifest: evidenceManifest.join(","),
      });
      const claimHash = await hashClaimPacket(packet);

      setStep("consensus");

      const ts = new Date().toISOString();
      const { request, tx_hash } = await submitAndAuditInsight(
        {
          request_id: "",
          org_id: orgOnchainId,
          dataset_id: data.dataset_id,
          dashboard_id: data.dashboard_id,
          insight_text: data.insight_text,
          metrics: data.metrics,
          assumptions: data.assumptions,
          business_context: data.business_context,
          claim_hash: claimHash,
          evidence_manifest_hash: evidenceManifest.join(","),
          submitted_at: ts,
          adjudicated_at: ts,
        },
        walletAddress,
      );

      await syncInsightRequest(request, tx_hash, user.id, data.org_id);

      // Navigate to case file
      const { data: caseRow } = await supabase
        .from("insight_audit_requests")
        .select("id")
        .eq("onchain_id", request.id)
        .single();

      const supabaseRequestId = caseRow?.id ?? request.id;

      // Log audit events
      await logAuditEvent(supabaseRequestId, "INSIGHT_SUBMITTED", walletAddress, { org_id: orgOnchainId, dataset_id: data.dataset_id, dashboard_id: data.dashboard_id, claim_hash: claimHash }, tx_hash);
      await logAuditEvent(supabaseRequestId, "INSIGHT_ADJUDICATED", "GENLAYER_CONSENSUS", { verdict: request.status, decision_id: request.id }, tx_hash);

      setStep("done");

      router.push(`/case/${caseRow?.id ?? request.id}`);
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
    consensus: "GenLayer validators reaching consensus...",
    done: "Consensus complete, redirecting...",
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Submit Insight Audit</h1>
        <p className="text-sm text-slate-400">
          Calls <code className="text-indigo-400">submit_and_audit_insight</code> - GenLayer validators will determine whether your insight is supported by the data.
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
              <p className="text-xs text-slate-500">All fields are required for consensus</p>
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
              }}
            />
            <Select
              label="Dataset"
              options={datasets}
              placeholder="Select..."
              error={errors.dataset_id?.message}
              {...register("dataset_id")}
            />
            <Select
              label="Dashboard"
              options={dashboards}
              placeholder="Select..."
              error={errors.dashboard_id?.message}
              {...register("dashboard_id")}
            />
          </div>

          <Textarea
            label="AI-Generated Insight"
            placeholder="Paste the exact AI-generated insight or narrative here..."
            rows={5}
            error={errors.insight_text?.message}
            hint="This is the claim being audited by GenLayer consensus"
            {...register("insight_text")}
          />

          <Textarea
            label="Underlying Metrics"
            placeholder="Revenue: $4.2M (+18% YoY), Units sold: 12,400, Conversion: 3.2%..."
            rows={4}
            error={errors.metrics?.message}
            hint="The raw data that the AI insight is based on"
            {...register("metrics")}
          />

          <Textarea
            label="Stated Assumptions"
            placeholder="Seasonality not adjusted, CAC based on last 90 days only..."
            rows={3}
            error={errors.assumptions?.message}
            {...register("assumptions")}
          />

          <Textarea
            label="Business Context"
            placeholder="This report will be used to determine Q4 budget allocation..."
            rows={3}
            error={errors.business_context?.message}
            {...register("business_context")}
          />

          {/* Evidence upload */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">
              Evidence Files <span className="text-slate-600">(optional)</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 border-dashed cursor-pointer hover:border-teal-500/40 transition-colors">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">
                {files.length > 0
                  ? `${files.length} file(s) selected`
                  : "CSV, Excel, PDF reports"}
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
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

