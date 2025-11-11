import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Home, Hotel, Landmark, DollarSign } from "lucide-react";
import { allData } from "@/lib/data";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
};

export default function StatsCards() {
  const commercialCount = allData.commercial.length;
  const commercialValue = allData.commercial.reduce((acc, p) => acc + p.value, 0);

  const residentialCount = allData.residential.length;
  const residentialValue = allData.residential.reduce((acc, p) => acc + p.value, 0);

  const hotelCount = allData.hotel.length;
  const hotelValue = allData.hotel.reduce((acc, p) => acc + p.value, 0);

  const bankCount = allData.bank.length;
  const bankValue = allData.bank.reduce((acc, p) => acc + p.value, 0);

  const stats = [
    { title: 'Commercial', icon: Building2, count: commercialCount, value: commercialValue },
    { title: 'Residential', icon: Home, count: residentialCount, value: residentialValue },
    { title: 'Hotel', icon: Hotel, count: hotelCount, value: hotelValue },
    { title: 'Bank Branches', icon: Landmark, count: bankCount, value: bankValue },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.count} Properties</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatCurrency(stat.value)} total value
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
