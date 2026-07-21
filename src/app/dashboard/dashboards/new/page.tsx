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
import Select from "@/components/ui/Select";
import { registerDashboard } from "@/lib/genlayer/orditContract";
import { hashClaimPacket } from "@/lib/ordit/hash";
import { getUserWalletAddress } from "@/lib/ordit/walletAddress";
import { getOrganizationsForWallet } from "@/lib/ordit/contractQueries";
import { MonitorDot, CheckCircle } from "lucide-react";

const schema = z.object({
  org_id: z.string().min(1, "Select an organization"),
  name: z.string().min(2, "Dashboard name required"),
  report_type: z.string().min(1, "Report type required"),
  reporting_period: z.string().min(1, "Reporting period required"),
});

type FormData = z.infer<typeof schema>;

const REPORT_TYPES = [
  "Revenue Report", "Sales Report", "Marketing Analytics", "Operations Dashboard",
  "Financial Summary", "Customer Analytics", "Product Analytics", "Executive Summary", "Other",
].map((r) => ({ value: r, label: r }));

export default function NewDashboardPage() {
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

      const dashboardId = crypto.randomUUID();

      const metadataHash = await hashClaimPacket({
        org_id: data.org_id,
        dataset_id: "",
        dashboard_id: dashboardId,
        insight_text: data.name,
        metrics: data.report_type,
        assumptions: data.reporting_period,
        business_context: "",
        nonce: dashboardId,
      });

      await registerDashboard(
        {
          dashboard_id: dashboardId,
          org_id: data.org_id,
          name: data.name,
          report_type: data.report_type,
          reporting_period: data.reporting_period,
          metadata_hash: metadataHash,
          registered_at: new Date().toISOString(),
        },
        walletAddress,
      );
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/dashboards"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center max-w-sm border-emerald-500/20">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Dashboard Registered</h2>
          <p className="text-slate-400 text-sm">Registered directly on the Ordit contract.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Register Dashboard</h1>
        <p className="text-sm text-slate-400">Calls <code className="text-indigo-400">register_dashboard</code> on the OrditContract.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center mb-2">
            <MonitorDot className="w-5 h-5 text-purple-400" />
          </div>
          <Select label="Organization" options={orgs} placeholder="Select..." error={errors.org_id?.message} {...register("org_id")} />
          <Input label="Dashboard Name" placeholder="Q3 2024 Revenue Dashboard" error={errors.name?.message} {...register("name")} />
          <Select label="Report Type" options={REPORT_TYPES} placeholder="Select..." error={errors.report_type?.message} {...register("report_type")} />
          <Input label="Reporting Period" placeholder="Q3 2024, Jan–Mar 2024..." error={errors.reporting_period?.message} {...register("reporting_period")} />

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading}>Register Dashboard</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
