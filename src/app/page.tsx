
"use client";

import EmployeeWorkSchedule from "@/components/dashboard/employee-work-schedule";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Home() {
  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="animate-fade-in">
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 [&>svg]:text-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle className="font-bold">Development Preview</AlertTitle>
          <AlertDescription>
            This is a private development environment. To share your application with others, it needs to be deployed to a public URL.
          </AlertDescription>
        </Alert>
      </div>

      <div className="animate-fade-in" style={{animationDelay: '100ms'}}>
        <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>
        <p className="text-muted-foreground">ISBAH HASSAN & ASSOCIATES</p>
      </div>
      
      <div style={{animationDelay: '200ms'}} className="animate-fade-in">
        <EmployeeWorkSchedule />
      </div>
      
    </main>
  );
}
