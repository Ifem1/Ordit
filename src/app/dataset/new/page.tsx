"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { registerDataset } from "@/lib/genlayer/orditContract";
import { syncDataset } from "@/lib/ordit/contractSync";
import { hashClaimPacket } from "@/lib/ordit/hash";
import { getUserWalletAddress } from "@/lib/ordit/walletAddress";
import { createClient } from "@/lib/supabase/client";
import { Database, CheckCircle, Upload } from "lucide-react";

const schema = z.object({
  org_id: z.string().min(1, "Select an organization"),
  name: z.string().min(2, "Dataset name required"),
  source: z.string().min(1, "Source required"),
  schema_summary: z.string().min(10, "Provide a schema summary"),
});

type FormData = z.infer<typeof schema>;

export default function NewDatasetPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orgs, setOrgs] = useState<{ value: string; label: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    supabase
      .from("organizations")
      .select("id, name, onchain_id")
      .then(({ data }) => {
        if (data) setOrgs(data.map((o) => ({ value: o.onchain_id, label: o.name })));
      });
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const walletAddress = await getUserWalletAddress();

      const datasetId = crypto.randomUUID();

      let fileUrl = "";
      if (file) {
        const path = `datasets/${user.id}/${Date.now()}_${file.name}`;
        const { data: uploadData } = await supabase.storage.from("evidence").upload(path, file);
        if (uploadData) {
          const { data: urlData } = supabase.storage.from("evidence").getPublicUrl(path);
          fileUrl = urlData.publicUrl;
        }
      }

      const metadataHash = await hashClaimPacket({
        org_id: data.org_id,
        dataset_id: datasetId,
        dashboard_id: "",
        insight_text: data.schema_summary,
        metrics: data.source,
        assumptions: "",
        business_context: fileUrl,
        nonce: Date.now().toString(),
      });

      const { tx_hash } = await registerDataset(
        {
          dataset_id: datasetId,
          org_id: data.org_id,
          name: data.name,
          source: data.source,
          schema_summary: data.schema_summary,
          metadata_hash: metadataHash,
          registered_at: new Date().toISOString(),
        },
        walletAddress,
      );

      const dataset = { id: datasetId, org_id: data.org_id, name: data.name, source: data.source, schema_summary: data.schema_summary, metadata_hash: metadataHash, status: "ACTIVE" as const, created_at: Date.now(), registered_at: new Date().toISOString() };

      // Fetch supabase org id
      const { data: orgRow } = await supabase
        .from("organizations")
        .select("id")
        .eq("onchain_id", data.org_id)
        .single();

      await syncDataset(dataset, tx_hash, orgRow?.id ?? "");

      setSuccess(true);
      setTimeout(() => router.push("/dataset"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register dataset");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center max-w-sm border-emerald-500/20">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Dataset Registered</h2>
          <p className="text-slate-400 text-sm">Registered on GenLayer and mirrored to Supabase.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Register Dataset</h1>
        <p className="text-sm text-slate-400">Calls <code className="text-indigo-400">register_dataset</code> on the OrditContract.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center mb-2">
            <Database className="w-5 h-5 text-teal-400" />
          </div>

          <Select
            label="Organization"
            options={orgs}
            placeholder="Select organization"
            error={errors.org_id?.message}
            {...register("org_id")}
          />
          <Input label="Dataset Name" placeholder="Q3 Sales Data" error={errors.name?.message} {...register("name")} />
          <Input label="Source" placeholder="Salesforce CRM, internal DB..." error={errors.source?.message} {...register("source")} />
          <Textarea
            label="Schema Summary"
            placeholder="Describe columns, row counts, date ranges..."
            rows={4}
            error={errors.schema_summary?.message}
            {...register("schema_summary")}
          />

          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Upload File (optional)</label>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 border-dashed cursor-pointer hover:border-indigo-500/40 transition-colors">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">
                {file ? file.name : "CSV, Excel, or PDF"}
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
            <Button type="submit" loading={loading}>Register Dataset</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

