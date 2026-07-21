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
import { hashClaimPacket } from "@/lib/ordit/hash";
import { getUserWalletAddress } from "@/lib/ordit/walletAddress";
import { getOrganizationsForWallet } from "@/lib/ordit/contractQueries";
import { Database, CheckCircle } from "lucide-react";

const schema = z.object({
  org_id: z.string().min(1, "Select an organization"),
  name: z.string().min(2, "Dataset name required"),
  source: z.string().min(1, "Source required"),
  schema_summary: z.string().min(10, "Provide a schema summary"),
});

type FormData = z.infer<typeof schema>;

export default function NewDatasetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orgs, setOrgs] = useState<{ value: string; label: string }[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    getUserWalletAddress()
      .then((wallet) => getOrganizationsForWallet(wallet))
      .then((data) => setOrgs(data.map((o) => ({ value: o.id, label: o.name }))))
      .catch(() => setOrgs([]));
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const walletAddress = await getUserWalletAddress();

      const datasetId = crypto.randomUUID();

      const metadataHash = await hashClaimPacket({
        org_id: data.org_id,
        dataset_id: datasetId,
        dashboard_id: "",
        insight_text: data.schema_summary,
        metrics: data.source,
        assumptions: "",
        business_context: "",
        nonce: datasetId,
      });

      await registerDataset(
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
          <p className="text-slate-400 text-sm">Registered directly on the Ordit contract.</p>
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
