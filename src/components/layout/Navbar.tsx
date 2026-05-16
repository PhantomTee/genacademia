"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { WalletConnect } from "@/components/WalletConnect";
import { FaucetButton } from "@/components/FaucetButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const authedLinks: { href: string; label: string; external?: boolean }[] = [
    { href: "/basics", label: "Basics" },
    { href: "/dashboard", label: "Learn" },
    { href: "/cheatsheet", label: "Cheat Sheet" },
    { href: "/profile", label: "Profile" },
  ];

  const guestLinks: { href: string; label: string; external?: boolean }[] = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "https://docs.genlayer.com", label: "Docs", external: true },
  ];

  const links = session ? authedLinks : guestLinks;

  return (
    <nav className="border-b border-ink/10 dark:border-cream-200/10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-widest text-ink dark:text-cream-200"
        >
          GenAcademia
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} external={l.external}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-0">
          <ThemeToggle />
          {session && <FaucetButton />}
          <WalletConnect />
          {/* Hamburger — mobile only */}
          <button
            className="ml-2 md:hidden flex flex-col justify-center items-center w-9 h-9 border border-ink/20 dark:border-cream-200/20 hover:border-ink dark:hover:border-cream-200 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <span className="text-ink dark:text-cream-200 text-lg leading-none">✕</span>
            ) : (
              <div className="space-y-1">
                <span className="block w-4 h-px bg-ink dark:bg-cream-200" />
                <span className="block w-4 h-px bg-ink dark:bg-cream-200" />
                <span className="block w-4 h-px bg-ink dark:bg-cream-200" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-ink/10 dark:border-cream-200/10 px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <MobileNavLink
              key={l.href}
              href={l.href}
              external={l.external}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </MobileNavLink>
          ))}
        </div>
      )}
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

function MobileNavLink({
  href,
  children,
  external,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  onClick: () => void;
}) {
  const cls =
    "block w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-widest border border-ink/15 dark:border-cream-200/15 hover:border-ink dark:hover:border-cream-200 hover:bg-ink hover:text-cream-200 dark:hover:bg-cream-200 dark:hover:text-ink transition-all text-ink dark:text-cream-200";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} onClick={onClick}>
      {children}
    </Link>
  );
}
