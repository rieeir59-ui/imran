"use client";

import StatsCards from "@/components/dashboard/stats-cards";
import EmployeeWorkSchedule from "@/components/dashboard/employee-work-schedule";

export default function Home() {
  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>
        <p className="text-muted-foreground">ISBAH HASSAN & ASSOCIATES</p>
      </div>
      <StatsCards />
      <div className="grid gap-8">
        <EmployeeWorkSchedule />
      </div>
    </main>
  );
}
