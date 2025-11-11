import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import DataChart from "@/components/dashboard/data-chart";
import ComparativeAnalysis from "@/components/dashboard/comparative-analysis";
import { allData } from "@/lib/data";

export default function Home() {
  const chartData = [
    { name: 'Commercial', value: allData.commercial.reduce((acc, p) => acc + p.value, 0) },
    { name: 'Residential', value: allData.residential.reduce((acc, p) => acc + p.value, 0) },
    { name: 'Hotel', value: allData.hotel.reduce((acc, p) => acc + p.value, 0) },
    { name: 'Bank Branch', value: allData.bank.reduce((acc, p) => acc + p.value, 0) },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1">
        <SidebarInset>
          <AppHeader />
          <main className="p-4 md:p-6 lg:p-8 space-y-8">
            <StatsCards />
            <div className="grid gap-8 lg:grid-cols-2">
              <DataChart data={chartData} />
              <ComparativeAnalysis />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
