import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataEntryDialog } from "@/components/dashboard/data-entry-dialog";
import { Button } from "../ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 no-print">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg font-semibold md:text-2xl gradient-text">
          Dashboard
        </Link>
      </div>
      <div className="ml-auto">
        <DataEntryDialog />
      </div>
    </header>
  );
}
