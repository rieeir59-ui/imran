
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, CalendarClock, ClipboardCheck, FolderKanban, GanttChart, Home, Hotel, Landmark, Save, ScrollText } from "lucide-react";

const recordCategories = [
  {
    title: "Project Forms",
    records: [
      { href: '/projects', icon: FolderKanban, label: 'Project Information' },
      { href: '/predesign-assessment', icon: ClipboardCheck, label: 'Predesign Assessment' },
      { href: '/project-timeline', icon: GanttChart, label: 'Master Project Timeline' },
      { href: '/bank', icon: ScrollText, label: 'Bank Forms' },
      { href: '/weekly-schedule', icon: CalendarClock, label: 'Work Schedule' },
    ],
  },
  {
    title: "Project Timelines",
    records: [
      { href: '/commercial-timeline', icon: Building, label: 'Commercial' },
      { href: '/residential-timeline', icon: Home, label: 'Residential' },
      { href: '/askari-bank-timeline', icon: Landmark, label: 'Askari Bank' },
      { href: '/bank-alfalah-timeline', icon: Landmark, label: 'Bank Alfalah' },
      { href: '/bank-al-habib-timeline', icon: Landmark, label: 'Bank Al Habib' },
      { href: '/cbd-timeline', icon: Landmark, label: 'CBD' },
      { href: '/dib-timeline', icon: Landmark, label: 'DIB' },
      { href: '/fbl-timeline', icon: Landmark, label: 'FBL' },
      { href: '/hbl-timeline', icon: Landmark, label: 'HBL' },
      { href: '/mcb-timeline', icon: Landmark, label: 'MCB' },
      { href: '/ubl-timeline', icon: Landmark, label: 'UBL' },
    ],
  },
];


export default function SaveRecordPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Save className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold">Saved Records</h1>
          <p className="text-muted-foreground">Access all your saved project forms and timelines.</p>
        </div>
      </div>

      <div className="space-y-8">
        {recordCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.records.map((record) => (
                <Link href={record.href} key={record.href} passHref>
                  <Button variant="outline" className="w-full h-full justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                        <record.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{record.label}</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
