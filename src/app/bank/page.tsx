
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProjectsPage from '@/app/projects/page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const fileIndexItems = [
    { no: 1, id: 'section-1', title: 'Project Checklist' },
    { no: 2, id: 'section-2', title: 'Project Information' },
    { no: 3, id: 'section-3', title: 'Predesign general assessment' },
    { no: 4, id: 'section-4', title: 'Project Data' },
    { no: 5, id: 'section-5', title: 'Project Agreement' },
    { no: 6, id: 'section-6', title: 'List of Services' },
    { no: 7, id: 'section-7', title: 'Requirement Performa (for Residential and Commercial Project)' },
    { no: 8, id: 'section-8', title: 'Site Survey' },
    { no: 9, id: 'section-9', title: 'Project Bylaws' },
    { no: 10, id: 'section-10', title: 'Proposal request' },
    { no: 11, id: 'section-11', title: 'Drawings (architectural/interior/submission)' },
    { no: 12, id: 'section-12', title: 'Shop Drawings Sample Record' },
    { no: 13, id: 'section-13', title: 'Project Chart (Studio)' },
    { no: 14, id: 'section-14', title: 'Architect field report/Transmittal letter/minutes of the meeting' },
    { no: 15, id: 'section-15', title: 'List Of Sub consultants' },
    { no: 16, id: 'section-16', title: 'List of Contractors' },
    { no: 17, id: 'section-17', title: 'List of approve vendors' },
    { no: 18, id: 'section-18', title: 'Time line Schedule' },
    { no: 19, id: 'section-19', title: 'Project Application Summary' },
    { no: 20, id: 'section-20', title: 'Continuation Sheet' },
    { no: 21, id: 'section-21', title: 'Construction Activity schedule' },
    { no: 22, id: 'section-22', title: 'Preliminary Project Budget' },
    { no: 23, id: 'section-23', title: 'Bill Of Quantity' },
    { no: 24, id: 'section-24', title: 'Rate Analysis' },
    { no: 25, id: 'section-25', title: 'Change Order' },
    { no: 26, id: 'section-26', title: 'Application and Certificate for Payment' },
    { no: 27, id: 'section-27', title: 'Instruction Sheet' },
    { no: 28, id: 'section-28', title: 'Certificate Substantial Summary' },
    { no: 29, id: 'section-29', title: 'Other Provisions' },
    { no: 30, id: 'section-30', title: 'Consent of Surety' },
    { no: 31, id: 'section-31', title: 'Total Package of Project' },
    { no: 32, id: 'section-32', title: 'Architects Supplemental Instructions' },
    { no: 33, id: 'section-33', title: 'Construction Change Director' },
];

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-bold mt-8 mb-4 pt-4">{children}</h2>
);

const Subtitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
);

const FormField = ({ label, value, as, children }: { label: string, value?: string, as?: 'textarea', children?: React.ReactNode }) => (
    <div className="flex flex-col space-y-1">
        <span className="font-semibold text-sm">{label}:</span>
        {children ? children : (as === 'textarea' ? <div className="border rounded-md p-2 h-24 bg-gray-50">{value || ''}</div> : <div className="border-b">{value || '___________________________'}</div>)}
    </div>
);


const renderChecklist = (title: string, items: string[]) => (
    <div>
        <Subtitle>{title}</Subtitle>
        <ul className="list-decimal list-inside space-y-1">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

const DrawingsList = () => {
    const architecturalDrawings = [
        "Submission Drawings", "Demolition Plan", "Excavation Plan", "Site Plan", "Basement Plan", "Ground Floor Plan", "First Floor Plan", "Second Floor Plan", "Roof Plan", "Section A", "Section B", "Section C", "Elevation 1", "Elevation 2", "Elevation 3", "Elevation 4"
    ];
    const details = ["Baths Details", "Doors Details", "Floors Details", "Entrance Detail", "Stair Detail"];
    const structureDrawings = ["Foundation Plan", "Floor Farming Plan", "Ground Floor Slab", "First Floor Slab", "Second Floor Slab", "Wall elev & slab sec.", "Wall sec & details", "Stairs", "Schedules", "Space of Concrete"];
    const plumbingDrawings = ["Sewarge Systems", "Water Supply & Gas Systems", "Detail of Sewrage Appurtunances", "Detail of Sokage Pit", "Detail of Soptik Tank", "Detail of Overhead Water Tank", "Detail of Underground Water Tank", "Legend & General Notes"];
    const electrificationDrawings = ["lllumination Layout Plans", "Power Layout Plans", "Legend & General Notes"];

    const sampleList1 = [
        { code: 'AR-01', desc: 'General Notes and Conditions' }, { code: 'AR-02', desc: 'Survey Plan' }, { code: 'AR-03', desc: 'Site Setting Drawings' },
        { code: 'AR-04', desc: '' }, { code: 'AR-05', desc: '' }, { code: 'AR-06', desc: '' }, { code: 'AR-07', desc: '' }, { code: 'AR-08', desc: 'ing' }, { code: 'AR-09', desc: '' }, { code: 'AR-10', desc: '' },
        { code: 'AR-11', desc: 'Master Working Layout Plan' }, { code: 'AR-12', desc: 'Working Layout Plan(Basement Floor)' }, { code: 'AR-13', desc: 'Working Layout Plan(Ground Floor)' },
        { code: 'AR-14', desc: 'Working Layout Plan(First Floor)' }, { code: 'AR-15', desc: 'Working Layout Plan(MezzanineFloor)' }, { code: 'AR-16', desc: 'Working Layout Plan(Roof Top)' },
        { code: 'AR-17', desc: '' }, { code: 'AR-18', desc: '' }, { code: 'AR-19', desc: '' }, { code: 'AR-20', desc: '' },
        { code: 'AR-21', desc: 'Front elevation' }, { code: 'AR-22', desc: 'Right Side Elevation' }, { code: 'AR-23', desc: 'Rear Side Elevation' }, { code: 'AR-24', desc: 'Left Side Elevation' },
        { code: 'AR-25', desc: 'Section A-A' }, { code: 'AR-26', desc: 'Section B-B' }, { code: 'AR-27', desc: 'Section C-C' }, { code: 'AR-28', desc: 'Section D-D' },
        { code: 'AR-29', desc: 'Parapet & Slab Sectional Details' }, { code: 'AR-30', desc: 'Lift Section' }, { code: 'AR-31', desc: 'Elevation Blow up Detail' }, { code: 'AR-32', desc: 'Exterior Wall Cladding Detail' },
        { code: 'AR-33', desc: '' }, { code: 'AR-34', desc: '' }, { code: 'AR-35', desc: '' }, { code: 'AR-36', desc: '' }, { code: 'AR-37', desc: '' }, { code: 'AR-38', desc: '' }, { code: 'AR-39', desc: '' }, { code: 'AR-40', desc: '' },
    ];

    const sampleList2 = [
        { code: 'AR-41', desc: 'Door & Window Schedule Plan (ground Floor)' }, { code: 'AR-42', desc: 'Door & Window Schedule Plan (First Floor)' }, { code: 'AR-43', desc: 'Door & Window Schedule Plan (Basement Floor)' },
        { code: 'AR-44', desc: 'Door & Window Schedule Plan (Roof Top)' }, { code: 'AR-45', desc: 'Door Elevation Schedule' }, { code: 'AR-46', desc: 'Windows Elevation Schedule' },
        { code: 'AR-47', desc: 'Door & Frame Details' }, { code: 'AR-48', desc: 'Window Sill and Header Details' }, { code: 'AR-49', desc: 'Window Blow up Detail' }, { code: 'AR-50', desc: 'Door Blow Up Detail' },
        { code: 'AR-51', desc: '' }, { code: 'AR-52', desc: '' }, { code: 'AR-53', desc: '' }, { code: 'AR-54', desc: '' }, { code: 'AR-55', desc: '' }, { code: 'AR-56', desc: '' }, { code: 'AR-57', desc: '' }, { code: 'AR-58', desc: '' }, { code: 'AR-59', desc: '' }, { code: 'AR-60', desc: '' },
        { code: 'AR-61', desc: '' }, { code: 'AR-62', desc: '' }, { code: 'AR-63', desc: '' }, { code: 'AR-64', desc: '' }, { code: 'AR-65', desc: '' }, { code: 'AR-66', desc: '' }, { code: 'AR-67', desc: '' }, { code: 'AR-68', desc: '' }, { code: 'AR-69', desc: '' }, { code: 'AR-70', desc: '' },
        { code: 'AR-71', desc: '' }, { code: 'AR-72', desc: '' }, { code:ax-h-[calc(100vh-200px)]'>
                            <ul className="space-y-2">
                                {fileIndexItems.map((item) => (
                                    <li key={item.id}>
                                        <button 
                                            onClick={() => setActiveSection(item.id)}
                                            className={`w-full text-left p-2 rounded-md transition-colors ${activeSection === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                        >
                                           {item.no}. {item.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <div className="printable-card">
                   <SectionContent sectionId={activeSection} />
                </div>
            </div>
        </main>
    );
}
    
    

    


    



