"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { WalletConnect } from "@/components/WalletConnect";
import { FaucetButton } from "@/components/FaucetButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-ink/10 dark:border-cream-200/10">
      {/* Logo */}
      <Link
        href="/"
        className="text-sm font-black uppercase tracking-widest text-ink dark:text-cream-200"
      >
        GenAcademia
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-0">
        {session ? (
          <>
            <NavLink href="/basics">Basics</NavLink>
            <NavLink href="/dashboard">Learn</NavLink>
            <NavLink href="/cheatsheet">Cheat Sheet</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </>
        ) : (
          <>
            <NavLink href="/#how-it-works">How It Works</NavLink>
            <NavLink href="https://docs.genlayer.com" external>Docs</NavLink>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-0">
        <ThemeToggle />
        {session && <FaucetButton />}
        <WalletConnect />
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "px-4 py-2 text-xs font-bold uppercase tracking-widest border border-ink/20 dark:border-cream-200/20 hover:border-ink dark:hover:border-cream-200 hover:bg-ink hover:text-cream-200 dark:hover:bg-cream-200 dark:hover:text-ink transition-all -ml-px first:ml-0";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
