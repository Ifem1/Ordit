"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { createOrganization } from "@/lib/genlayer/orditContract";
import { hashClaimPacket } from "@/lib/ordit/hash";
import { getUserWalletAddress } from "@/lib/ordit/walletAddress";
import { Building2, CheckCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  industry: z.string().min(1, "Select an industry"),
});

type FormData = z.infer<typeof schema>;

const INDUSTRIES = [
  "Finance", "Healthcare", "Technology", "Retail", "Manufacturing",
  "Energy", "Real Estate", "Media", "Education", "Government", "Other",
].map((i) => ({ value: i, label: i }));

export default function NewOrganizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const walletAddress = await getUserWalletAddress();

      // Generate org_id client-side — the contract stores whatever we pass
      const orgId = crypto.randomUUID();

      // Generate metadata hash
      const metadataHash = await hashClaimPacket({
        org_id: orgId,
        dataset_id: "",
        dashboard_id: "",
        insight_text: data.name,
        metrics: data.industry,
        assumptions: "",
        business_context: "",
        nonce: orgId,
      });

      await createOrganization(
        { org_id: orgId, name: data.name, industry: data.industry, metadata_hash: metadataHash, created_at: new Date().toISOString() },
        walletAddress,
      );

      setSuccess(true);
      setTimeout(() => router.push("/organization"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center max-w-sm border-emerald-500/20">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Organization Created</h2>
          <p className="text-slate-400 text-sm">Registered directly on the Ordit contract.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">New Organization</h1>
        <p className="text-sm text-slate-400">
          Creates an organization on the GenLayer OrditContract.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>

          <Input
            label="Organization Name"
            placeholder="Acme Analytics Inc."
            error={errors.name?.message}
            {...register("name")}
          />

          <Select
            label="Industry"
            options={INDUSTRIES}
            placeholder="Select industry"
            error={errors.industry?.message}
            {...register("industry")}
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Organization
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
