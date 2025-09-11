"use client";

import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileNav } from "./mobile-nav";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full sticky top-0 z-50 border-b bg-background"
    >
      <div className="container mx-auto px-4 h-12 flex items-center justify-between gap-2">
        <MobileNav />
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-md:hidden flex items-center gap-4"
        >
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
          <Link href="/candidates" className="text-sm hover:underline">
            Candidates
          </Link>
          <Link href="/candidates/kanban" className="text-sm hover:underline">
            Pipeline
          </Link>
          <Link href="/interviews" className="text-sm hover:underline">
            Interviews
          </Link>
          <Link href="/jobs" className="text-sm hover:underline">
            Jobs
          </Link>
          <Link href="/help" className="text-sm hover:underline">
            Help
          </Link>
        </motion.nav>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 items-center justify-end ml-auto"
        >
          <ThemeSwitcher />
        </motion.div>
      </div>
    </motion.header>
  );
}
