"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Building2,
  Database,
  MonitorDot,
  FileSearch,
  ShieldCheck,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Wallet,
} from "lucide-react";
import OrditLogo from "./OrditLogo";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateWallet } from "@/lib/ordit/walletAddress";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/organization", icon: Building2, label: "Organizations" },
  { href: "/dataset", icon: Database, label: "Datasets" },
  { href: "/dashboard/dashboards", icon: MonitorDot, label: "Dashboards" },
  { href: "/insight", icon: FileSearch, label: "Insight Audit" },
  { href: "/review", icon: ShieldCheck, label: "Human Review" },
  { href: "/audit", icon: BookOpen, label: "Audit Trail" },
  { href: "/subscription", icon: CreditCard, label: "Subscription" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletLoaded, setWalletLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, wallet_address")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName((profile.full_name as string) ?? "");
      }

      // Ensure wallet exists; getOrCreateWallet writes to profile + localStorage if needed
      const { address } = await getOrCreateWallet();
      setWalletAddress(address);
      setWalletLoaded(true);
    };
    load();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayName = userName || userEmail.split("@")[0] || "User";
  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;

  return (
    <aside className="flex flex-col w-60 min-h-screen glass border-r border-white/[0.06] px-3 py-6 shrink-0">
      <div className="px-3 mb-8">
        <OrditLogo size="md" />
        <p className="text-xs text-slate-500 mt-1 pl-1">AI Insight Verification</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]",
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User info block */}
      <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-1">
        {/* User card */}
        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-2">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-slate-500 truncate">{userEmail}</p>

          {walletLoaded && shortWallet && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Wallet className="w-3 h-3 text-teal-400 shrink-0" />
              <span className="text-xs text-teal-400 font-mono">{shortWallet}</span>
            </div>
          )}
        </div>

        <Link
          href="/settings"
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
            pathname.startsWith("/settings")
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]",
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
