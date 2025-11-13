"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const FormField = ({ label, value }: { label: string, value?: string }) => (
    <div>
        <span className="font-semibold">{label}</span>
        <span>{value || '___________________________'}</span>
    </div>
);

const timelineTasks = [
    { id: 1, name: "Project Name:", duration: "", start: "", finish: "", predecessor: "" },
    { id: 2, name: "Conceptual Design", duration: "", start: "", finish: "", predecessor: "" },
    { id: 3, name: "Client Brief", duration: "", start: "", finish: "", predecessor: "2" },
    { id: 4, name: "Topographic Survey", duration: "", start: "", finish: "", predecessor: "2" },
    { id: 5, name: "Project Scope and Area Statements", duration: "", start: "", finish: "", predecessor: "3,4" },
    { id: 6, name: "Conceptual Plans and Supporting Drawings", duration: "", start: "", finish: "", predecessor: "5" },
    { id: 7, name: "Concept Engineering", duration: "", start: "", finish: "", predecessor: "5" },
    { id: 8, name: "Geotechnical Investigation and Report", duration: "", start: "", finish: "", predecessor: "5" },
    { id: 9, name: "Conceptual Interior Brief", duration: "", start: "", finish: "", predecessor: "5" },
    { id: 10, name: "Finalize Concept Design / Report", duration: "", start: "", finish: "", predecessor: "6,7,8,9" },
    { id: 11, name: "Client Comments / Approval on Concept Design", duration: "", start: "", finish: "", predecessor: "10" },
    { id: 12, name: "Preliminary Design", duration: "", start: "", finish: "", predecessor: "11" },
    { id: 13, name: "Layout Plans-Cycle 1", duration: "", start: "", finish: "", predecessor: "12" },
    { id: 14, name: "Initial Engineering", duration: "", start: "", finish: "", predecessor: "12" },
    { id: 15, name: "Preliminary Design Workshop", duration: "", start: "", finish: "", predecessor: "13,14" },
    { id: 16, name: "Layout Plans-Cycle 2", duration: "", start: "", finish: "", predecessor: "15" },
    { id: 17, name: "Environmental Study and Authority Approval", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 18, name: "3-D Model", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 19, name: "External Elevation", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 20, name: "Building Section", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 21, name: "Preliminary Interior Layouts", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 22, name: "Preliminary Engineering Design", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 23, name: "Finalize Preliminary Design / Report", duration: "", start: "", finish: "", predecessor: "17,18,19,20,21,22" },
    { id: 24, name: "Client Comments / Approval on Preliminary Design", duration: "", start: "", finish: "", predecessor: "23" },
    { id: 25, name: "Submission to LDA / CDA or Other Authority", duration: "", start: "", finish: "", predecessor: "24" },
    { id: 26, name: "Prepare Submission Drawings", duration: "", start: "", finish: "", predecessor: "25" },
    { id: 27, name: "Submit Application for Stage I Approval", duration: "", start: "", finish: "", predecessor: "26" },
    { id: 28, name: "LDA/CDA/Other Authority Approval Process", duration: "", start: "", finish: "", predecessor: "27" },
    { id: 29, name: "LDA/CDA/Other Authority Stage I Approval", duration: "", start: "", finish: "", predecessor: "28" },
    { id: 30, name: "Detailed Design and Draft Tender", duration: "", start: "", finish: "", predecessor: "29" },
    { id: 31, name: "Detailed Architectural Design", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 32, name: "Detailed Interior Layouts", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 33, name: "Detailed Engineering Design", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 34, name: "Draft Conditions of Contract", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 35, name: "Draft BOQ and Specifications", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 36, name: "Client Comments / Approval Final Design", duration: "", start: "", finish: "", predecessor: "31,32,33,34,35" },
    { id: 37, name: "Construction Drawings and Final Tender", duration: "", start: "", finish: "", predecessor: "36" },
    { id: 38, name: "Architectural Construction Drawings", duration: "", start: "", finish: "", predecessor: "37" },
    { id: 39, name: "Engineering Construction Drawings", duration: "", start: "", finish: "", predecessor: "37" },
    { id: 40, name: "Final Tender Documents", duration: "", start: "", finish: "", predecessor: "38,39" },
    { id: 41, name: "Client Comments / Approval on Final Tender Documents", duration: "", start: "", finish: "", predecessor: "40" },
    { id: 42, name: "Incorporate Comments in Tender Documents", duration: "", start: "", finish: "", predecessor: "41" },
    { id: 43, name: "Tender Documents Ready", duration: "", start: "", finish: "", predecessor: "42" },
    { id: 44, name: "Final Interior Design", duration: "", start: "", finish: "", predecessor: "36" },
    { id: 45, name: "Interior Layouts working details", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 46, name: "Interior Thematic Mood Board + Color Scheme", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 47, name: "Ceiling Details Design Drawings", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 48, name: "Built-in Feature Details", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 49, name: "Partition Pattern Details Drawings", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 50, name: "Draft Interior design Tender", duration: "", start: "", finish: "", predecessor: "45,46,47,48,49" },
    { id: 51, name: "Client Comments / Approval of Interior Design Tender", duration: "", start: "", finish: "", predecessor: "50" },
    { id: 52, name: "Incorporate Comments in Interior Design Tender", duration: "", start: "", finish: "", predecessor: "51" },
    { id: 53, name: "Interior Design Tender Complete", duration: "", start: "", finish: "", predecessor: "52" },
    { id: 54, name: "Procurement of Main Contractor", duration: "", start: "", finish: "", predecessor: "43" },
    { id: 55, name: "Construction Period ____ Months - Top Supervision by IH&SA and ____________________", duration: "", start: "", finish: "", predecessor: "54" },
];

export default function ProjectTimelinePage() {
    return (
        <main className="p-4 md:p-6 lg:p-8">
             <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" asChild>
                    <Link href="/"><ArrowLeft /> Back to Dashboard</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">TIME LINE SCHEDULE</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField label="Project" value="" />
                        <FormField label="Architect" value="IH&SA" />
                        <FormField label="(Name, Address)" value="" />
                        <FormField label="Architects Project No" value="" />
                        <FormField label="Project Date" value="" />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Task Name</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Start</TableHead>
                                <TableHead>Finish</TableHead>
                                <TableHead>Predecessor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {timelineTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.id}</TableCell>
                                    <TableCell>{task.name}</TableCell>
                                    <TableCell>{task.duration}</TableCell>
                                    <TableCell>{task.start}</TableCell>
                                    <TableCell>{task.finish}</TableCell>
                                    <TableCell>{task.predecessor}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}