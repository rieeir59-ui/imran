
"use client";

import EmployeeWorkSchedule from "@/components/dashboard/employee-work-schedule";
import StatsCards from "@/components/dashboard/stats-cards";

export default function Home() {
  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="animate-fade-in" style={{animationDelay: '100ms'}}>
        <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>
        <p className="text-muted-foreground">ISBAH HASSAN & ASSOCIATES</p>
      </div>

      <div style={{animationDelay: '200ms'}} className="animate-fade-in">
          <StatsCards />
      </div>
      
      <div style={{animationDelay: '300ms'}} className="animate-fade-in">
        <EmployeeWorkSchedule />
      </div>
      
    </main>
  );
}
