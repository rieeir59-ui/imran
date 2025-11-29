
"use client";

import { useEffect } from 'react';
import EmployeeWorkSchedule from "@/components/dashboard/employee-work-schedule";
import StatsCards from "@/components/dashboard/stats-cards";
import TeamDashboard from "@/components/dashboard/team-dashboard";
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

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
        <TeamDashboard />
      </div>
      
      <div style={{animationDelay: '400ms'}} className="animate-fade-in">
        <EmployeeWorkSchedule />
      </div>
      
    </main>
  );
}
