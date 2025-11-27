
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Home, Hotel, Landmark } from "lucide-react";
import { useData } from "@/lib/data-context";

export default function StatsCards() {
  const { data: allData } = useData();
  const commercialCount = allData.commercial.length;
  const commercialValue = allData.commercial.reduce((acc, p) => acc + p.value, 0);

  const residentialCount = allData.residential.length;
  const residentialValue = allData.residential.reduce((acc, p) => acc + p.value, 0);

  const hotelCount = allData.hotel.length;
  const hotelValue = allData.hotel.reduce((acc, p) => acc + p.value, 0);

  const bankCount = allData.bank.length;
  const bankValue = allData.bank.reduce((acc, p) => acc + p.value, 0);

  const stats = [
    { title: 'Commercial', icon: Building2, count: commercialCount, value: commercialValue, href: '/commercial-timeline' },
    { title: 'Residential', icon: Home, count: residentialCount, value: residentialValue, href: '/residential-timeline' },
    { title: 'Hotel', icon: Hotel, count: hotelCount, value: hotelValue, href: '/hotel' },
    { title: 'Bank Branch', icon: Landmark, count: bankCount, value: bankValue, href: '/bank' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link href={stat.href} key={stat.title}>
          <Card className="hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* The count and value have been removed as per the user's request. */}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
