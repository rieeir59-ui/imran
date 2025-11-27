
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GanttChart, HardHat, ListChecks, CalendarDays } from 'lucide-react';
import Link from 'next/link';

const savedRecords = [
    {
        title: 'Project Checklist',
        description: 'Review and manage your project setup checklist.',
        href: '/project-checklist',
        icon: ListChecks
    },
    {
        title: 'Project Information',
        description: 'Access and edit general project information.',
        href: '/projects',
        icon: HardHat
    },
    {
        title: 'Project Data',
        description: 'View and update detailed project data entries.',
        href: '/project-data',
        icon: FileText
    },
    {
        title: 'Predesign Assessment',
        description: 'Manage your predesign general assessments.',
        href: '/predesign-assessment',
        icon: FileText
    },
    {
        title: 'Site Visit Form',
        description: 'Review and edit site visit reports.',
        href: '/site-visit',
        icon: FileText
    },
    {
        title: 'Project Timeline',
        description: 'General project timeline and scheduling.',
        href: '/project-timeline',
        icon: GanttChart
    },
    {
        title: 'Weekly Work Schedules',
        description: 'Manage and review all employee weekly schedules.',
        href: '/weekly-schedule',
        icon: CalendarDays
    },
    {
        title: 'Commercial Projects Timeline',
        description: 'Track the progress of all commercial projects.',
        href: '/commercial-timeline',
        icon: GanttChart
    },
    {
        title: 'Residential Projects Timeline',
        description: 'Track the progress of all residential projects.',
        href: '/residential-timeline',
        icon: GanttChart
    },
    {
        title: 'Bank Timelines',
        description: 'Access timelines for all bank-related projects.',
        href: '/bank',
        icon: GanttChart
    },
];

export default function SaveRecordPage() {
    return (
        <main className="p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Saved Records</CardTitle>
                    <p className="text-muted-foreground">Access all your saved forms, reports, and records from here.</p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {savedRecords.map((record) => (
                        <Link href={record.href} key={record.title} className="block hover:bg-accent transition-colors p-4 rounded-lg border">
                            <div className="flex items-start gap-4">
                                <record.icon className="h-8 w-8 text-primary mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold">{record.title}</h3>
                                    <p className="text-sm text-muted-foreground">{record.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </main>
    )
}
