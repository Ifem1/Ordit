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
  Settings,
  LogOut,
  ChevronRight,
  Wallet,
} from "lucide-react";
import OrditLogo from "./OrditLogo";
import { connectInjectedWallet, getConnectedWallet, shortAddress } from "@/lib/wallet/injected";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/organization", icon: Building2, label: "Organizations" },
  { href: "/dataset", icon: Database, label: "Datasets" },
  { href: "/dashboard/dashboards", icon: MonitorDot, label: "Dashboards" },
  { href: "/insight", icon: FileSearch, label: "Insight Audit" },
  { href: "/review", icon: ShieldCheck, label: "Human Review" },
  { href: "/audit", icon: BookOpen, label: "Audit Trail" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletLoaded, setWalletLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const wallet = await getConnectedWallet();
      setWalletAddress(wallet?.address ?? null);
      setWalletLoaded(true);
    };
    load();
  }, []);

  const handleWalletClick = async () => {
    if (!walletAddress) {
      const wallet = await connectInjectedWallet();
      setWalletAddress(wallet.address);
      router.refresh();
      return;
    }
    setWalletAddress(null);
    router.push("/");
    router.refresh();
  };

  const shortWallet = walletAddress ? shortAddress(walletAddress) : null;

  return (
    <aside className="flex flex-col w-60 min-h-screen glass border-r border-white/[0.06] px-3 py-6 shrink-0">
      <div className="px-3 mb-8">
        <Link href="/" className="block hover:opacity-80 transition-opacity">
          <OrditLogo size="md" />
        </Link>
        <p className="text-xs text-slate-500 mt-1 pl-1">GenLayer-native audit</p>
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

      <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-1">
        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-2">
          <p className="text-sm font-medium text-white truncate">
            {walletAddress ? "Connected wallet" : "Wallet required"}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {walletAddress ? "GenLayer signer" : "Use Rabby or MetaMask"}
          </p>
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
          onClick={handleWalletClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          {walletAddress ? <LogOut className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
          {walletAddress ? "Disconnect View" : "Connect Wallet"}
        </button>
      </div>
    </aside>
  );
}
