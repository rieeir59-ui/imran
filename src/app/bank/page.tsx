
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        { code: 'AR-71', desc: '' }, { code: 'AR-72', desc: '' }, { code: 'AR-73', desc: '' }, { code: 'AR-74', desc: '' }, { code: 'AR-75', desc: '' }, { code: 'AR-76', desc: '' }, { code: 'AR-77', desc: '' }, { code: 'AR-78', desc: '' }, { code: 'AR-79', desc: '' }, { code: 'AR-80', desc: '' },
    ];
    
    const sampleList3 = [
        { code: 'AR-81', desc: 'Main Stair Case Detail' }, { code: 'AR-82', desc: 'Main Stair Case Detail Section' }, { code: 'AR-83', desc: 'Main Entrance Steps Detail' },
        { code: 'AR-84', desc: 'Back Entrance step Detail' }, { code: 'AR-85', desc: '' }, { code: 'AR-86', desc: '' }, { code: 'AR-87', desc: '' }, { code: 'AR-88', desc: '' }, { code: 'AR-89', desc: '' }, { code: 'AR-90', desc: '' },
        { code: 'AR-91', desc: '' }, { code: 'AR-92', desc: '' }, { code: 'AR-93', desc: '' }, { code: 'AR-94', desc: '' }, { code: 'AR-95', desc: '' }, { code: 'AR-96', desc: '' }, { code: 'AR-97', desc: '' }, { code: 'AR-98', desc: '' }, { code: 'AR-99', desc: '' }, { code: 'AR-100', desc: '' },
        { code: 'AR-101', desc: 'Toilet Layout (Ground floor)' }, { code: 'AR-102', desc: 'Toilet Layout (First floor)' }, { code: 'AR-103', desc: 'Toilet Layout (Mezzanine floor)' },
        { code: 'AR-104', desc: 'Toilet Layout (Basement floor)' }, { code: 'AR-105', desc: 'Toilet Layout (Roof Top)' }, { code: 'AR-106', desc: 'Toilet Detail (Ground floor)' },
        { code: 'AR-107', desc: 'Toilet Detail (First floor)' }, { code: 'AR-108', desc: 'Toilet Detail (Mezzanine floor)' }, { code: 'AR-109', desc: 'Toilet Detail (Basement floor)' },
        { code: 'AR-110', desc: 'Toilet Detail (Roof Top)' }, { code: 'AR-111', desc: 'Blow Up Detail' }, { code: 'AR-112', desc: '' }, { code: 'AR-113', desc: '' }, { code: 'AR-114', desc: '' }, { code: 'AR-115', desc: '' },
        { code: 'AR-116', desc: '' }, { code: 'AR-117', desc: '' }, { code: 'AR-118', desc: '' }, { code: 'AR-119', desc: '' }, { code: 'AR-120', desc: '' },
        { code: 'AR-121', desc: '' }, { code: 'AR-122', desc: '' }, { code: 'AR-123', desc: '' }, { code: 'AR-124', desc: '' }, { code: 'AR-125', desc: '' }, { code: 'AR-126', desc: '' }, { code: 'AR-127', desc: '' }, { code: 'AR-128', desc: '' }, { code: 'AR-129', desc: '' }, { code: 'AR-130', desc: '' },
        { code: 'AR-131', desc: '' }, { code: 'AR-132', desc: '' }, { code: 'AR-133', desc: '' }, { code: 'AR-134', desc: '' }, { code: 'AR-135', desc: '' }, { code: 'AR-136', desc: '' }, { code: 'AR-137', desc: '' }, { code: 'AR-138', desc: '' }, { code: 'AR-139', desc: '' }, { code: 'AR-140', desc: '' },
    ];

    const sampleList4 = [
        { code: 'AR-141', desc: 'Kitchen Layout (Ground floor)' }, { code: 'AR-142', desc: 'Kitchen Layout (First floor)' }, { code: 'AR-143', desc: 'Kitchen Layout (Mezzanine floor)' }, { code: 'AR-144', desc: 'Kitchen Layout (Basement floor)' }, { code: 'AR-145', desc: 'Kitchen Detail (Ground floor)' }, { code: 'AR-146', desc: 'Kitchen Detail (First floor)' }, { code: 'AR-147', desc: 'Kitchen Detail (Mezzanine floor)' }, { code: 'AR-148', desc: 'Kitchen Detail (Basement floor)' }, { code: 'AR-149', desc: '' }, { code: 'AR-150', desc: '' },
        { code: 'AR-151', desc: '' }, { code: 'AR-152', desc: '' }, { code: 'AR-153', desc: '' }, { code: 'AR-154', desc: '' }, { code: 'AR-155', desc: '' }, { code: 'AR-156', desc: '' }, { code: 'AR-157', desc: '' }, { code: 'AR-158', desc: '' }, { code: 'AR-159', desc: '' }, { code: 'AR-160', desc: '' },
        { code: 'AR-161', desc: 'Exterior Paving Pattern' }, { code: 'AR-162', desc: 'Floor Pattern (Ground Floor)' }, { code: 'AR-163', desc: 'Floor Pattern (First Floor)' }, { code: 'AR-164', desc: 'Floor Pattern (Mazzenine Floor)' }, { code: 'AR-165', desc: 'Floor Pattern (Basement Floor)' }, { code: 'AR-166', desc: 'Floor Pattern (Roof Top)' }, { code: 'AR-167', desc: 'Floor Pattern Blow up Details' }, { code: 'AR-168', desc: 'Floor Floor Finishes and Transition Details' }, { code: 'AR-169', desc: '' }, { code: 'AR-170', desc: '' },
        { code: 'AR-171', desc: '' }, { code: 'AR-172', desc: '' }, { code: 'AR-173', desc: '' }, { code: 'AR-174', desc: '' }, { code: 'AR-175', desc: '' }, { code: 'AR-176', desc: '' }, { code: 'AR-177', desc: '' }, { code: 'AR-178', desc: '' }, { code: 'AR-179', desc: '' }, { code: 'AR-180', desc: '' },
    ];
    
    const sampleList5 = [
        { code: 'AR-181', desc: 'Front Boundary Wall Layout' }, { code: 'AR-182', desc: 'Front Boundary Wall Detail' }, { code: 'AR-183', desc: 'Rear Side Boundary Wall Layout' }, { code: 'AR-184', desc: 'Rear Side Boundary Wall Detail' }, { code: 'AR-185', desc: 'Overhead Watertank Layout & detail' }, { code: 'AR-186', desc: 'Underground Watertank Layout & detail' }, { code: 'AR-187', desc: 'Plinth Details' }, { code: 'AR-188', desc: 'Water proofing Detail' }, { code: 'AR-189', desc: 'Insulation Detail' }, { code: 'AR-190', desc: 'Planter Detail' },
        { code: 'AR-191', desc: 'Fire Place Detail' }, { code: 'AR-192', desc: 'Patio Detail' }, { code: 'AR-193', desc: 'Skylight Detail' }, { code: 'AR-194', desc: 'Water Body Detail' }, { code: 'AR-195', desc: 'Niche Detail' }, { code: 'AR-196', desc: 'Side Passages Detail' }, { code: 'AR-197', desc: 'Threshold Detail' }, { code: 'AR-198', desc: 'Floor Levels Detail' }, { code: 'AR-199', desc: 'Drive way Detail' }, { code: 'AR-200', desc: 'Curb Detail' },
        { code: 'AR-201', desc: '' }, { code: 'AR-202', desc: '' }, { code: 'AR-203', desc: '' }, { code: 'AR-204', desc: '' }, { code: 'AR-205', desc: '' }, { code: 'AR-206', desc: '' }, { code: 'AR-207', desc: '' }, { code: 'AR-208', desc: '' }, { code: 'AR-209', desc: '' }, { code: 'AR-210', desc: '' },
        { code: 'AR-211', desc: '' }, { code: 'AR-212', desc: '' }, { code: 'AR-213', desc: '' }, { code: 'AR-214', desc: '' }, { code: 'AR-215', desc: '' }, { code: 'AR-216', desc: '' }, { code: 'AR-217', desc: '' }, { code: 'AR-218', desc: '' }, { code: 'AR-219', desc: '' }, { code: 'AR-220', desc: '' },
        { code: 'AR-221', desc: '' }, { code: 'AR-222', desc: '' }, { code: 'AR-223', desc: '' }, { code: 'AR-224', desc: '' }, { code: 'AR-225', desc: '' }, { code: 'AR-226', desc: '' }, { code: 'AR-227', desc: '' }, { code: 'AR-228', desc: '' }, { code: 'AR-229', desc: '' }, { code: 'AR-230', desc: '' },
        { code: 'AR-231', desc: '' }, { code: 'AR-232', desc: '' }, { code: 'AR-233', desc: '' }, { code: 'AR-234', desc: '' }, { code: 'AR-235', desc: '' }, { code: 'AR-236', desc: '' }, { code: 'AR-237', desc: '' }, { code: 'AR-238', desc: '' }, { code: 'AR-239', desc: '' }, { code: 'AR-240', desc: '' },
        { code: 'AR-241', desc: '' }, { code: 'AR-242', desc: '' }, { code: 'AR-243', desc: '' }, { code: 'AR-244', desc: '' }, { code: 'AR-245', desc: '' }, { code: 'AR-246', desc: '' }, { code: 'AR-247', desc: '' }, { code: 'AR-248', desc: '' }, { code: 'AR-249', desc: '' }, { code: 'AR-250', desc: '' },
        { code: 'AR-251', desc: '' }, { code: 'AR-252', desc: '' }, { code: 'AR-253', desc: '' }, { code: 'AR-254', desc: '' }, { code: 'AR-255', desc: '' },
    ];
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold mb-2">Architectural Drawings</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {architecturalDrawings.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {details.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Structure Drawings</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {structureDrawings.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Plumbing Drawings</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {plumbingDrawings.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Electrification Drawings</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {electrificationDrawings.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="text-xl font-bold mb-4">Sample List</h3>
                <p className="mb-2"><strong>Draftsman Name:</strong> Mr. Adeel</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                    <Table>
                        <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                        <TableBody>{sampleList1.map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell></TableRow>)}</TableBody>
                    </Table>
                    <Table>
                         <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                        <TableBody>{sampleList2.map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell></TableRow>)}</TableBody>
                    </Table>
                    <Table>
                        <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                        <TableBody>{sampleList3.map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell></TableRow>)}</TableBody>
                    </Table>
                     <Table>
                        <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                        <TableBody>{sampleList4.map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell></TableRow>)}</TableBody>
                    </Table>
                     <Table>
                        <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                        <TableBody>{sampleList5.map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell></TableRow>)}</TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

const renderChecklist = (title: string, items: string[]) => (
    <div>
        <Subtitle>{title}</Subtitle>
        <ul className="list-decimal list-inside space-y-1">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

const Section1 = () => (
    <Card>
        <CardHeader><CardTitle>Project Checklist</CardTitle></CardHeader>
        <CardContent>
            <FormField label="Project" value="" />
            <FormField label="Name, Address" value="" />
            <FormField label="Architect" value="" />
            <FormField label="Architect Project No" value="" />
            <FormField label="Project Date" value="" />
            <SectionTitle>1: - Predesign</SectionTitle>
            {renderChecklist("Predesign Services:-", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Programming", "Space Schematics/ Flow Diagrams", "Existing Facilities Surveys", "Presentations"])}
            {renderChecklist("Site Analysis Services", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Site Analysis and Selection", "Site Development and Planning", "Detailed Site Utilization Studies", "Onsite Utility Studies", "Offsite Utility Studies", "Zoning Processing Assistance", "Project Development Scheduling", "Project Budgeting", "Presentations"])}
            <SectionTitle>2: - Design</SectionTitle>
            {renderChecklist("Schematic Design Services: -", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design/ Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research/ Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"])}
            {renderChecklist("Design Development Services:-", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design / Documentation", "Electrical Design / Documentation", "Civil Design / Documentation", "Landscape Design / Documentation", "Interior Design / Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"])}
            {renderChecklist("Construction Documents Services:-", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design / Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"])}
            <SectionTitle>3: - Construction</SectionTitle>
            {renderChecklist("Bidding Or Negotiation Services:", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Bidding Materials", "Addenda", "Bidding Negotiations", "Analysis Of Alternates/ Substitutions", "Special Bidding Services", "Bid Evaluation", "Construction Contract Agreements"])}
            {renderChecklist("Construction Contract Administration Services:-", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Office Construction Administration", "Construction Field Observation", "Project Representation", "Inspection Coordination", "Supplemental Documents", "10.Quotation Requests/ Change Orders", "11.Project Schedule Monitoring", "12.Construction Cost Accounting", "13.Project Closeout"])}
            <SectionTitle>4: - Post</SectionTitle>
            {renderChecklist("Post Construction Services:-", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Maintenance And Operational Programming", "Start Up Assistance", "Record Drawings", "Warranty Review", "Post Construction Evaluation"])}
            <SectionTitle>5: - Supplemental</SectionTitle>
            {renderChecklist("Supplemental Services: -", ["Graphics Design", "Fine Arts and Crafts Services", "Special Furnishing Design", "Non-Building Equipment Selection"])}
            {renderChecklist("List Of Materials:-", ["Conceptual Site and Building Plans/ Basic Layout", "Preliminary Sections and Elevations", "Air Conditioning/ H.V.A.C Design", "Plumbing", "Fire Protection", "Special Mechanical Systems", "General Space Requirements", "Power Services and Distribution", "Telephones", "Security Systems", "Special Electrical Systems", "Landscaping", "Materials", "Partition Sections", "Furniture Design", "Identification Of Potential Architectural Materials", "Specification Of a. Wall Finishes b. Floor Finishes c. Windows Coverings d. Carpeting", "Specialized Features Construction Details", "Project Administration", "Space Schematic Flow", "Existing Facilities Services", "Project Budgeting", "Presentation"])}
        </CardContent>
    </Card>
);

const Section2 = () => (
    <Card>
        <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
        <CardContent>
             <div className="space-y-4">
                <FormField label="Project" value="" />
                <FormField label="Address" value="" />
                <FormField label="Project No" value="" />
                <FormField label="Prepared By" value="" />
                <FormField label="Prepared Date" value="" />

                <Subtitle>About Owner:</Subtitle>
                <FormField label="Full Name" value="" />
                <FormField label="Address (Office)" value="" />
                <FormField label="Address (Res.)" value="" />
                <FormField label="Phone (Office)" value="" />
                <FormField label="Phone (Res.)" value="" />
                <FormField label="Owner's Project Representative Name" value="" />
                <FormField label="Address (Office)" value="" />
                <FormField label="Address (Res.)" value="" />
                <FormField label="Phone (Office)" value="" />
                <FormField label="Phone (Res.)" value="" />

                <Subtitle>About Project:</Subtitle>
                <FormField label="Address" value="" />
                <FormField label="Project Reqt.">
                    <ul className="list-roman list-inside pl-4">
                        <li>Architectural Designing</li>
                        <li>Interior Decoration</li>
                        <li>Landscaping</li>
                        <li>Turnkey</li>
                        <li>Other</li>
                    </ul>
                </FormField>
                 <FormField label="Project Type:">
                    <ul className="list-roman list-inside pl-4">
                        <li>Commercial</li>
                        <li>Residential</li>
                    </ul>
                </FormField>
                <FormField label="Project Status">
                     <ul className="list-roman list-inside pl-4">
                        <li>New</li>
                        <li>Addition</li>
                        <li>Rehabilitation/Renovation</li>
                    </ul>
                </FormField>
                <FormField label="Project Area" value="" />
                <FormField label="Special Requirments of Project" as="textarea" value="" />
                <FormField label="Project's Cost:">
                    <ul className="list-roman list-inside pl-4">
                        <li>Architectural Designing</li>
                        <li>Interior Decoration</li>
                        <li>Landscaping</li>
                        <li>Construction</li>
                        <li>Turnkey</li>
                        <li>Other</li>
                    </ul>
                </FormField>
                
                <Subtitle>Dates Concerned with Project:</Subtitle>
                <FormField label="First Information about Project" value="" />
                <FormField label="First Meeting" value="" />
                <FormField label="First Working on Project" value="" />
                <FormField label="First Proposal" value="i.. Start ii..  Completion" />
                <FormField label="Second Proposal" value="i.. Start ii..  Completion" />
                <FormField label="First Information" value="" />
                <FormField label="Working on Finalized Proposal" value="" />
                <FormField label="Revised Presentation" value="" />
                <FormField label="Quotation" value="" />
                <FormField label="Drawings" value="i.. Start ii..  Completion" />
                <FormField label="Other Major Projects Milestone Dates" as="textarea" value="" />

                <Subtitle>Provided by Owner:</Subtitle>
                <FormField label="Program" value="" />
                <FormField label="Suggested Schedule" value="" />
                <FormField label="Legal Site Description & Other Concerned Documents" value="" />
                <FormField label="Land Survey Report" value="" />
                <FormField label="Geo-Technical, Tests and Other Site Information" value="" />
                <FormField label="Existing Structure's Drawings" value="" />

                <Subtitle>Compensation:</Subtitle>
                <FormField label="Initial Payment" value="" />
                <FormField label="Basic Services" value="% of Cost of Construction" />
                <div className="pl-8">
                    <FormField label="Breakdown by Phase: Schematic Design" value="%" />
                    <FormField label="Design Development" value="%" />
                    <FormField label="Construction Doc's" value="%" />
                    <FormField label="Bidding / Negotiation" value="%" />
                    <FormField label="Construction Contract Admin" value="%" />
                </div>
                <FormField label="Additional Services" value="Multiple of Times Direct Cost to Architect" />
                <FormField label="Reimbursable Expenses" value="" />
                <FormField label="Other" value="" />
                <FormField label="Special Confindential Requirements" as="textarea" value="" />

                <Subtitle>Miscellaneous Notes:</Subtitle>
                <div className="border-b h-20"></div>
                
                <Subtitle>Consultants:</Subtitle>
                <Table>
                    <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Within Basic Fee</TableHead><TableHead>Additional Fee</TableHead><TableHead>Architect</TableHead><TableHead>Owner</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Solar", "Construction Cost", "Other", "...", "...", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"].map(item => (
                            <TableRow key={item}><TableCell>{item}</TableCell><TableCell>...</TableCell><TableCell>...</TableCell><TableCell>...</TableCell><TableCell>...</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                <Subtitle>Retained and Paid by Owner, Co ordination By Retained by Architect</Subtitle>

                <Subtitle>Requirements:</Subtitle>
                <FormField label="Residence" value="" />
                <FormField label="Nos." value="" />
                <ul className="list-roman list-inside space-y-2 pl-4">
                    <li>Size of plot</li>
                    <li>Number of Bedrooms</li>
                    <li>Specifications</li>
                    <li>Number of Dressing Rooms</li>
                    <li>Number of Bath Rooms</li>
                    <li>Living Rooms</li>
                    <li>Breakfast</li>
                    <li>Dinning</li>
                    <li>Servant Kitchen</li>
                    <li>Self Kitchenett</li>
                    <li>Garage</li>
                    <li>Servant Quarters</li>
                    <li>Guard Room</li>
                    <li>Study Room</li>
                    <li>Stores</li>
                    <li>Entertainment Area</li>
                    <li>Partio</li>
                    <li>Atrium</li>
                    <li>Remarks</li>
                </ul>
            </div>
        </CardContent>
    </Card>
);

const Section3 = () => (
    <Card>
        <CardHeader><CardTitle>Predesign General Assessment</CardTitle></CardHeader>
        <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <FormField label="Project (Name, Address)" value="" />
                <FormField label="Architect" value="" />
                <FormField label="Architects Project No" value="" />
                <FormField label="Project Date" value="" />
            </div>
            <div className="flex flex-row gap-8">
                <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg mb-2 underline">Human Factors</h3>
                    {["Activities", "Behavior", "Objectives / Goals", "Organization", "Hierarchy", "Groups", "Positions", "Classifications", "Leadership", "Characteristics (Demographics)", "Social Forces", "Political Forces", "Interactions", "Communication", "Relationships", "Transfer of materials", "Policies / Codes", "Attitudes / Values", "Customs / Beliefs", "Perceptions", "Preferences", "Qualities", "Comfort", "Productivity", "Efficiency", "Security", "Safety", "Access", "Privacy", "Territory", "Control", "Convenience"].map(item => <div key={item}>{item}</div>)}
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg mb-2 underline">Physical Factors</h3>
                    {["Location", "Region", "Locality", "Community", "Vicinity", "Site Conditions", "Building / Facility", "Envelope", "Structure", "Systems", "Engineering", "Communications", "Lighting", "Security", "Space", "Types", "Dimensions", "Relationship", "Equipment / Furnishings", "Materials / Finishes", "Support Services", "Storage", "Parking", "Access", "Waste removal", "Utilities (water, sewage, telephone)", "Operations", "Environment", "Comfort", "Visual", "Acoustical", "Energy Use / Conservation", "Durability / Flexibility"].map(item => <div key={item}>{item}</div>)}
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg mb-2 underline">External Factors</h3>
                    {["Legal Restrictions", "(Codes / Standards/Regulations)", "Building", "Land use", "Systems", "Energy", "Environment", "Materials", "Safety", "Solar access", "Topography", "Climate", "Ecology", "Resource Availability", "Energy Supplies / Prices", "Conventional", "Solar", "Alternatives", "Economy", "Financing", "Time", "Schedule", "Deadlines", "Operations", "Costs / Budget", "Construction", "Material", "Services", "Operations", "Cost / Benefits"].map(item => <div key={item}>{item}</div>)}
                </div>
            </div>
        </CardContent>
    </Card>
);

const Section4 = () => (
    <Card>
        <CardHeader><CardTitle>Project Data</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-4">
                <FormField label="Project" value=""/>
                <FormField label="Address" value=""/>
                <FormField label="Owner" value=""/>
                <FormField label="Architect's Project No." value=""/>
                <FormField label="Date" value=""/>
                <FormField label="Tel" value=""/>
                <FormField label="Business Address" value=""/>
                <FormField label="Home Address" value=""/>
                <FormField label="Proposed Improvements" value=""/>
                <FormField label="Building Dept. Classification" value=""/>
                <FormField label="Set Backs" value="N____E____S____W____Coverage__________"/>
                <FormField label="Cost" value=""/>
                <FormField label="Stories" value=""/>
                <FormField label="Fire Zone" value=""/>
                <FormField label="Other Agency Standards or Approvals Required" value=""/>
                <FormField label="Site Legal Description" value=""/>
                <FormField label="Deed recorded in" value="Vol. _______Page_____at_____________________________________________ to____________________________________________ Date: ________________________"/>
                <FormField label="Restrictions" value=""/>
                <FormField label="Easements" value=""/>
                <FormField label="Liens, Leases" value=""/>
                <FormField label="Lot Dimensions" value="_______________________  Facing:  __________ Value: __________________"/>
                <FormField label="Adjacent property use" value=""/>
                <FormField label="Owners: Name" value=""/>
                <FormField label="Designated Representative" value=""/>
                <FormField label="Address" value=""/>
                <FormField label="Tel" value=""/>
                <FormField label="Attorney at Law" value=""/>
                <FormField label="Insurance Advisor" value=""/>
                <FormField label="Consultant on" value=""/>
                <Subtitle>Site Information Sources:</Subtitle>
                <FormField label="Property Survey by" value="_______________________________________ Date: ____________"/>
                <FormField label="Topographic Survey by" value="_______________________________________ Date: ____________"/>
                <FormField label="Soils Tests by" value="_______________________________________ Date: ____________"/>
                <FormField label="Aerial Photos by" value="_______________________________________ Date: ____________"/>
                <FormField label="Maps" value=""/>
                <Subtitle>Public Services:</Subtitle>
                <Table>
                    <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Name and Address</TableHead><TableHead>Representative</TableHead><TableHead>Tel</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>Gas Company</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Electric Co</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Telephone Co</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                    </TableBody>
                </Table>
                <FormField label="Sewers" value=""/>
                <FormField label="Water" value=""/>
                <Subtitle>Financial Data:</Subtitle>
                <FormField label="Loan Amount" value="__________________ Type: _________________ Rate: ______"/>
                <FormField label="Loan by" value="___________________________ Representative: _______________ Tel:_______________"/>
                <FormField label="Bonds or Liens" value=""/>
                <FormField label="Grant Amount" value="____________________________ Limitations: ________________________"/>
                <FormField label="Grant from" value="___________________ Representative: ________________Tel:______________"/>
                <Subtitle>Method of Handling:</Subtitle>
                <div>
                    <Checkbox id="single" /> <Label htmlFor="single">Single</Label>
                    <Checkbox id="separate" /> <Label htmlFor="separate">Separate</Label> Contracts
                </div>
                <FormField label="Negotiated" value="__________________________ Bid: ______________________________"/>
                <FormField label="Stipulated Sum" value=""/>
                <FormField label="Cost Plus Fee" value="___________________________  Force Amount: _______________________"/>
                <FormField label="Equipment" value="Fixed ____________ Movable ______________ Interiors ________________________"/>
                <FormField label="Landscaping" value=""/>
                <Subtitle>Sketch of Property:</Subtitle>
                <p>Notations on existing improvements, disposal thereof, utilities, tree, etc.; indicated North; notations on other Project provision:</p>
                <div className="border h-48 mt-2"></div>
            </div>
        </CardContent>
    </Card>
);

const Section5 = () => (
    <Card>
        <CardHeader><CardTitle>Project Agreement</CardTitle></CardHeader>
        <CardContent>
            <h2 className="text-xl font-bold text-center mb-4">COMMERCIAL AGREEMENT</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-8">
                    <div>
                        <p>Made as of the day</p>
                        <p>Between the Owner</p>
                        <p>And the Firm</p>
                        <p>For the Design of</p>
                        <p>Address</p>
                        <p>Covered Area of Project</p>
                        <p>Consultancy Charges @ Rs ___/Sft</p>
                        <p>Sales Tax @ 16%</p>
                        <p>Withholding Tax @ 10%</p>
                        <p>Final Consultancy Charges</p>
                    </div>
                    <div>
                        <p>: _________________________</p>
                        <p>: _________________________</p>
                        <p>: Isbah Hassan & Associates</p>
                        <p>: _________________________</p>
                        <p>: _________________________</p>
                        <p>: _________________________</p>
                        <p>: _________________________</p>
                        <p>: _________________________</p>
                        <p>: _________________________</p>
                        <p>: _________________________</p>
                    </div>
                </div>

                <Subtitle>PAYMENT SCHEDULE:</Subtitle>
                <div className="grid grid-cols-2 gap-x-8">
                    <div>
                        <p>On mobilization (advance payment)</p>
                        <p>On approval of schematic designs & 3D’s</p>
                        <p>On completion of submission drawings</p>
                        <p>On start of construction drawings</p>
                        <p>On completion of construction drawings</p>
                        <p>On completion of interior drawings</p>
                        <p>On preparation of detailed BOQ</p>
                    </div>
                    <div>
                        <p>: 20 %</p>
                        <p>: 15%</p>
                        <p>: 15%</p>
                        <p>: 15%</p>
                        <p>: 10%</p>
                        <p>: 10%</p>
                        <p>: 10%</p>
                    </div>
                </div>
                
                <Subtitle>Project Management:</Subtitle>
                <h4 className="font-semibold">Top Supervision:</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Please find attached the site visit schedule for the project please intimate the office one week in advance before the required visit for timely surveillance. Any Unscheduled visits would be charged as under.</li>
                    <li>For out of station visits, the travelling by air and lodging in a five-star hotel will be paid by the client.
                        <ul className="list-disc pl-5">
                            <li>Rs. 50,000 for Principal Architect's site visit per day.</li>
                            <li>Rs. 30,000 for Associate Architect's site visit per day.</li>
                        </ul>
                    </li>
                    <li>For International visits, the travelling by air and lodging in a five-star hotel will be paid by the client.
                         <ul className="list-disc pl-5">
                            <li>Rs. 150,000 for Principal Architect' s fee per day.</li>
                            <li>Rs. 30,000 for Associate Architect' s fee per day.</li>
                        </ul>
                    </li>
                </ul>

                <h4 className="font-semibold mt-4">Detailed Supervision:</h4>
                <p>The fee for detailed supervision will be Rs. 300,000 /- per month, which will ensure daily progress at the site.</p>
                
                <h4 className="font-semibold mt-4">Please Note:</h4>
                <ul className="list-disc pl-5 space-y-2">
                    <li>The above quoted rates do not include any kind of tax.</li>
                    <li>The contract value is lumpsum for the area between 90,000 to 120,000 Sft, if however, the area increases the above amount only the sub-consultants fee @ Rs. 70/Sft will be charged.</li>
                    <li>The above consultancy charges quoted are valid for only two months.</li>
                </ul>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div>
                        <Subtitle>Architectural Design Services:</Subtitle>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Space Planning</li>
                            <li>Design Concept</li>
                            <li>Design Development & 3Ds (Facade)</li>
                            <li>Budgeting Bil of Quantity’s.</li>
                            <li>Work Drawings
                                <ul className="list-[circle] pl-5">
                                    <li>Site Plan</li>
                                    <li>Ground Floor Plan</li>
                                    <li>Mezzanine Floor Plan</li>
                                    <li>Elevation NE</li>
                                    <li>Elevation NW</li>
                                    <li>Elevation SW</li>
                                    <li>Sections</li>
                                    <li>Stair Details</li>
                                    <li>Kitchen Details</li>
                                    <li>Bath Details</li>
                                    <li>Schedules</li>
                                </ul>
                            </li>
                            <li>Structure Drawing
                                <ul className="list-[circle] pl-5">
                                    <li>Foundation Plan</li>
                                    <li>Floor Framing Plan</li>
                                    <li>Wall Elev. & Slab Section</li>
                                    <li>Wall section & Details</li>
                                    <li>Stair Details</li>
                                    <li>Schedules</li>
                                    <li>Specs of Concrete</li>
                                </ul>
                            </li>
                            <li>Electrification Drawings
                                <ul className="list-[circle] pl-5">
                                    <li>Power Plan</li>
                                    <li>Lighting Plans</li>
                                    <li>Section & Details</li>
                                    <li>Communication Plan</li>
                                </ul>
                            </li>
                            <li>Plumbing Drawings
                                <ul className="list-[circle] pl-5">
                                    <li>Water Protect System</li>
                                    <li>Soil Protect System</li>
                                    <li>Ventilation System</li>
                                    <li>Fire Protection System</li>
                                </ul>
                            </li>
                            <li>Miscelaneous Services
                                <ul className="list-[circle] pl-5">
                                    <li>Roof air Conditioning</li>
                                    <li>H.V.A.C</li>
                                    <li>Material Specifications</li>
                                </ul>
                            </li>
                            <li>Extra Services
                                 <ul className="list-[circle] pl-5">
                                    <li>Landscaping</li>
                                    <li>Acoustical</li>
                                    <li>Land Survey</li>
                                    <li>Geo-Technical Survey</li>
                                    <li>Graphic design</li>
                                </ul>
                            </li>
                        </ol>
                    </div>
                    <div>
                        <Subtitle>Interior Design Services:</Subtitle>
                        <h4 className="font-semibold">Design Details:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Flooring</li>
                            <li>Wood Work</li>
                            <li>Doors</li>
                            <li>Windows</li>
                            <li>False Ceiling</li>
                            <li>Lighting</li>
                            <li>Bath Details</li>
                            <li>Kitchen Details</li>
                            <li>Wall Textures.</li>
                            <li>Stairways</li>
                            <li>Built-in Features Fire Places</li>
                            <li>Patios</li>
                            <li>Water bodies</li>
                            <li>Trellis</li>
                            <li>Skylights</li>
                            <li>Furniture</li>
                            <li>Partitioning</li>
                        </ul>
                        <p className="mt-4"><strong>Note:</strong> The item number 9& 10 is under the head of extra services if the client requests these services, the extra charges wil be as mentioned above.</p>
                    </div>
                </div>

                <Subtitle>Architect's Responsibilities.</Subtitle>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>The architect will produce a maximum of two proposals are revisions for the client for the said amount of consultancy every proposal or revision after this will be charged @ Rs. 500,000 /- per Proposal.</li>
                    <li>The architect will require a minimum period of one month for the design development. 2 months will be required for work drawings.</li>
                    <li>The architect will represent the owner and will advise and consult with the owner regarding construction.</li>
                    <li>The architect will be responsible for checking the contractor's progress and giving the approval for payments due to the contractor.</li>
                    <li>The architect is to prepare a maximum of 2 design proposals for the proposal stage for the client. If one proposal is developed, it can be revised two times, free of cost to the client. If, however, 2 design proposals are made, the second proposal can be revised three times, free of cost to the client. If the client wishes for another revision of the proposal, the architect will be paid Rs. 300,000 in advance for each drawing. If the client wishes to develop a third proposal, the architect will be paid Rs. 500,000 as advance payment for the task and Rs. 300,000 per revision of the third proposal.</li>
                    <li>No revision will be made after the Issuance of Construction Drawings. If client wants the revision, he will have to pay for the amount ascertained in the contract.</li>
                    <li>No revision will be made for working drawings. If client wants the revision, he will be required to pay the amount.</li>
                    <li>Project supervision will include visits as mentioned in Construction Activity Schedule.</li>
                    <li>The Architect will provide 3 Sets of working drawings to the client. For additional sets of working drawings Rs. 50,000 per set will be charged.</li>
                    <li>The Architect will provide only two options/revisions of 3Ds for the Facade after which any option/revision wil be charged based on normal market rates. For Interior renderings Rs. 500,000/- will be charged.</li>
                </ol>

                <h4 className="font-semibold mt-4">The Architect will not be responsible for the following things:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>Continuous site supervision.</li>
                    <li>Technical sequences and procedures of the contractors.</li>
                    <li>Change of acts and omissions of the contractor. These are the contractor's responsibilities.</li>
                    <li>Changes and omissions made on the owner's directions.</li>
                </ol>
                
                <Subtitle>ARTICLE-1: Termination of the Agreement</Subtitle>
                 <ol className="list-decimal pl-5 space-y-2">
                    <li>The agreement may be terminated by any of the parties on 7 days written notice. The other party will substantially perform in accordance with its items though no fault of the party initiating the termination.</li>
                    <li>The owner at least on 7 days’ notice to the designer may terminate the agreement in the event that the project is permanently abandoned.</li>
                    <li>In the event of termination not the fault of the design builder, the design builder will be compensated for services performed till termination date.</li>
                    <li>No reimbursable then due and termination expenses. The termination expenses are the expenses directly attributable to the termination including a reasonable amount of overhead and profit for which the design/builder is not otherwise compensated under this agreement.</li>
                </ol>

                <Subtitle>ARTICLE-2: Bases of Compensation</Subtitle>
                <p>The owner will compensate the design/builder in accordance with this agreement, payments, and the other provisions of this agreement as described below.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Compensation for basic services</li>
                    <li>Basic services will be as mentioned</li>
                    <li>Subsequent payments will be as mentioned</li>
                    <li>Compensation for additional services</li>
                    <li>For additional services compensation will be as mentioned</li>
                    <li>Travel expenses of Architect, Engineer, Sub-Engineer and Sub Consultant will be separately billed</li>
                    <li>Computer Animation will be charged at the normal market rates</li>
                    <li>The rate of interest past due payments will be 15 % per month</li>
                </ul>
                
                <div className="flex justify-between mt-8 pt-8 border-t">
                    <div>
                        <p>______________</p>
                        <p>Architect</p>
                    </div>
                    <div>
                        <p>_______________</p>
                        <p>Client</p>
                    </div>
                </div>

            </div>
        </CardContent>
    </Card>
);
const Section6 = () => (
    <Card>
        <CardHeader><CardTitle>List of Services</CardTitle></CardHeader>
        <CardContent>
            <SectionTitle>1: - Predesign</SectionTitle>
            <Subtitle>Predesign Services:-</Subtitle>
            <ol className="list-decimal list-inside space-y-1">
                <li>Project Administration</li>
                <li>Disciplines Coordination Document Checking</li>
                <li>Agency Consulting Review/ Approval</li>
                <li>Coordination Of Owner Supplied Data</li>
                <li>Programming</li>
                <li>Space Schematics/ Flow Diagrams</li>
                <li>Existing Facilities Surveys</li>
                <li>Presentations</li>
            </ol>
            <Subtitle>Site Analysis Services</Subtitle>
            <ol className="list-decimal list-inside space-y-1">
                <li>Project Administration</li>
                <li>Disciplines Coordination Document Checking</li>
                <li>Agency Consulting Review/ Approval</li>
                <li>Coordination Of Owner Supplied Data</li>
                <li>Site Analysis and Selection</li>
                <li>Site Development and Planning</li>
                <li>Detailed Site Utilization Studies</li>
                <li>Onsite Utility Studies</li>
                <li>Offsite Utility Studies</li>
                <li>Zoning Processing Assistance</li>
                <li>Project Development Scheduling</li>
                <li>Project Budgeting</li>
                <li>Presentations</li>
            </ol>

            <SectionTitle>2: - Design</SectionTitle>
            <Subtitle>Schematic Design Services: -</Subtitle>
            <ol className="list-decimal list-inside space-y-1">
                <li>Project Administration</li>
                <li>Disciplines Coordination Document Checking</li>
                <li>Agency Consulting Review/ Approval</li>
                <li>Coordination Of Owner Supplied Data</li>
                <li>Architectural Design/ Documentation</li>
                <li>Structural Design/ Documentation</li>
                <li>Mechanical Design/ Documentation</li>
                <li>Electrical Design/ Documentation</li>
                <li>Civil Design/ Documentation</li>
                <li>Landscape Design/ Documentation</li>
                <li>Interior Design/ Documentation</li>
                <li>Materials Research/ Specifications</li>
                <li>Project Development Scheduling</li>
                <li>Statement Of Probable Construction Cost</li>
                <li>Presentations</li>
            </ol>
            <Subtitle>Design Development Services:-</Subtitle>
            <ol className="list-decimal list-inside space-y-1">
                <li>Project Administration</li>
                <li>Disciplines Coordination Document Checking</li>
                <li>Agency Consulting Review/ Approval</li>
                <li>Coordination Of Owner Supplied Data</li>
                <li>Architectural Design/ Documentation</li>
                <li>Structural Design/ Documentation</li>
                <li>Mechanical Design / Documentation</li>
                <li>Electrical Design / Documentation</li>
                <li>Civil Design / Documentation</li>
                <li>Landscape Design / Documentation</li>
                <li>Interior Design / Documentation</li>
                <li>Materials Research / Specifications</li>
                <li>Project Development Scheduling</li>
                <li>Statement Of Probable Construction Cost</li>
                <li>Presentations</li>
            </ol>
            <Subtitle>Construction Documents Services:-</Subtitle>
             <ol className="list-decimal list-inside space-y-1">
                <li>Project Administration</li>
                <li>Disciplines Coordination Document Checking</li>
                <li>Agency Consulting Review/ Approval</li>
                <li>Coordination Of Owner Supplied Data</li>
                <li>Architectural Design/ Documentation</li>
                <li>Structural Design/ Documentation</li>
                <li>Mechanical Design/ Documentation</li>
                <li>Electrical Design / Documentation</li>
                <li>Civil Design/ Documentation</li>
                <li>Landscape Design/ Documentation</li>
                <li>Interior Design/ Documentation</li>
                <li>Materials Research / Specifications</li>
                <li>Project Development Scheduling</li>
                <li>Statement Of Probable Construction Cost</li>
                <li>Presentations</li>
            </ol>

            <SectionTitle>3: - Construction</SectionTitle>
            <Subtitle>Bidding Or Negotiation Services:</Subtitle>
            <ol className="list-decimal list-inside space-y-1">
                <li>Project Administration</li>
                <li>Disciplines Coordination Document Checking</li>
                <li>Agency Consulting Review/ Approval</li>
                <li>Coordination Of Owner Supplied Data</li>
                <li>Bidding Materials</li>
                <li>Addenda</li>
                <li>Bidding Negotiations</li>
                <li>Analysis Of Alternates/ Substitutions</li>
                <li>Special Bidding Services</li>
                <li>Bid Evaluation</li>
                <li>Construction Contract Agreements</li>
            </ol>
            <Subtitle>Construction Contract Administration Services:-</Subtitle>
            <ol className="list-decimal list-inside space-y-1">
                <li>Project Administration</li>
                <li>Disciplines Coordination Document Checking</li>
                <li>Agency Consulting Review/ Approval</li>
                <li>Coordination Of Owner Supplied Data</li>
                <li>Office Construction Administration</li>
                <li>Construction Field Observation</li>
                <li>Project Representation</li>
                <li>Inspection Coordination</li>
                <li>Supplemental Documents</li>
                <li>Quotation Requests/ Change Orders</li>
                <li>Project Schedule Monitoring</li>
                <li>Construction Cost Accounting</li>
                <li>Project Closeout</li>
            </ol>
            
            <SectionTitle>4: - Post</SectionTitle>
            <Subtitle>Post Construction Services:-</Subtitle>
            <ol className="list-decimal list-inside space-y-1">
                <li>Project Administration</li>
                <li>Disciplines Coordination Document Checking</li>
                <li>Agency Consulting Review/ Approval</li>
                <li>Coordination Of Owner Supplied Data</li>
                <li>Maintenance And Operational Programming</li>
                <li>Start Up Assistance</li>
                <li>Record Drawings</li>
                <li>Warranty Review</li>
                <li>Post Construction Evaluation</li>
            </ol>

            <SectionTitle>5: - Supplemental</SectionTitle>
            <Subtitle>Supplemental Services: -</Subtitle>
            <ol className="list-decimal list-inside space-y-1">
                <li>Graphics Design</li>
                <li>Fine Arts and Crafts Services</li>
                <li>Special Furnishing Design</li>
                <li>Non-Building Equipment Selection</li>
            </ol>
            <Subtitle>List Of Materials:-</Subtitle>
             <ol className="list-decimal list-inside space-y-1">
                <li>Conceptual Site and Building Plans/ Basic Layout</li>
                <li>Preliminary Sections and Elevations</li>
                <li>Air Conditioning/ H.V.A.C Design</li>
                <li>Plumbing</li>
                <li>Fire Protection</li>
                <li>Special Mechanical Systems</li>
                <li>General Space Requirements</li>
                <li>Power Services and Distribution</li>
                <li>Telephones</li>
                <li>Security Systems</li>
                <li>Special Electrical Systems</li>
                <li>Landscaping</li>
                <li>Materials</li>
                <li>Partition Sections</li>
                <li>Furniture Design</li>
                <li>Identification Of Potential Architectural Materials</li>
                <li>Specification Of
                    <ul className="list-[lower-alpha] pl-5">
                        <li>Wall Finishes</li>
                        <li>Floor Finishes</li>
                        <li>Windows Coverings</li>
                        <li>Carpeting</li>
                    </ul>
                </li>
                <li>Specialized Features Construction Details</li>
                <li>Project Administration</li>
                <li>Space Schematic Flow</li>
                <li>Existing Facilities Services</li>
                <li>Project Budgeting</li>
                <li>Presentation</li>
            </ol>
        </CardContent>
    </Card>
);

const Section7 = () => {
    const [formData, setFormData] = useState<any>({});
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
      if (typeof checked === 'boolean') {
          setFormData((prev: any) => ({ ...prev, [name]: checked }));
      }
    };
    
    const renderInput = (name: string, placeholder = "") => (
        <Input name={name} value={formData[name] || ''} onChange={handleInputChange} placeholder={placeholder} />
    );
     const renderTextarea = (name: string, placeholder = "") => (
      <Textarea name={name} value={formData[name] || ''} onChange={handleInputChange} placeholder={placeholder} />
    );

    const renderCheckbox = (name: string, label: string) => (
        <div className="flex items-center gap-2">
            <Checkbox id={name} name={name} checked={formData[name] || false} onCheckedChange={(checked) => handleCheckboxChange(name, checked)} />
            <label htmlFor={name}>{label}</label>
        </div>
    );
    const renderConsultantRow = (type: string) => {
        const slug = type.toLowerCase().replace(/ /g, '_').replace(/\//g, '_');
        return (
            <div key={slug} className="grid grid-cols-5 gap-2 items-center border-b pb-2">
                <p>{type}</p>
                <div className="flex items-center justify-center">{renderCheckbox(`consultant_${slug}_basic`, "")}</div>
                <div className="flex items-center justify-center">{renderCheckbox(`consultant_${slug}_additional`, "")}</div>
                <div className="flex items-center justify-center">{renderCheckbox(`consultant_${slug}_architect`, "")}</div>
                <div className="flex items-center justify-center">{renderCheckbox(`consultant_${slug}_owner`, "")}</div>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader><CardTitle>Requirement Performa (for Residential and Commercial Project)</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <FormField label="Project:">{renderInput("project_name")}</FormField>
                    <FormField label="Address:">{renderInput("project_address")}</FormField>
                    <FormField label="Project No:">{renderInput("project_no")}</FormField>
                    <FormField label="Prepared By:">{renderInput("prepared_by")}</FormField>
                    <FormField label="Prepared Date:">{renderInput("prepared_date", "YYYY-MM-DD")}</FormField>

                    <SectionTitle>About Owner</SectionTitle>
                    <FormField label="Full Name:">{renderInput("owner_name")}</FormField>
                    <FormField label="Address (Office):">{renderInput("owner_office_address")}</FormField>
                    <FormField label="Address (Res.):">{renderInput("owner_res_address")}</FormField>
                    <FormField label="Phone (Office):">{renderInput("owner_office_phone")}</FormField>
                    <FormField label="Phone (Res.):">{renderInput("owner_res_phone")}</FormField>
                    <FormField label="Owner's Project Representative Name:">{renderInput("owner_rep_name")}</FormField>
                    <FormField label="Address (Office):">{renderInput("owner_rep_office_address")}</FormField>
                    <FormField label="Address (Res.):">{renderInput("owner_rep_res_address")}</FormField>
                    <FormField label="Phone (Office):">{renderInput("owner_rep_office_phone")}</FormField>
                    <FormField label="Phone (Res.):">{renderInput("owner_rep_res_phone")}</FormField>

                    <SectionTitle>About Project</SectionTitle>
                    <FormField label="Address:">{renderInput("project_about_address")}</FormField>
                    <FormField label="Project Reqt.">
                        <div className="space-y-2">
                            {renderCheckbox("req_architectural", "Architectural Designing")}
                            {renderCheckbox("req_interior", "Interior Decoration")}
                            {renderCheckbox("req_landscaping", "Landscaping")}
                            {renderCheckbox("req_turnkey", "Turnkey")}
                            {renderCheckbox("req_other", "Other")}
                        </div>
                    </FormField>
                    <FormField label="Project Type:">
                        <div className="space-y-2">
                            {renderCheckbox("type_commercial", "Commercial")}
                            {renderCheckbox("type_residential", "Residential")}
                        </div>
                    </FormField>
                    <FormField label="Project Status:">
                        <div className="space-y-2">
                            {renderCheckbox("status_new", "New")}
                            {renderCheckbox("status_addition", "Addition")}
                            {renderCheckbox("status_rehab", "Rehabilitation/Renovation")}
                        </div>
                    </FormField>
                    <FormField label="Project Area:">{renderInput("project_area")}</FormField>
                    <FormField label="Special Requirments of Project:">{renderTextarea("project_special_reqs")}</FormField>
                    <FormField label="Project's Cost:">
                        <div className="space-y-2">
                            {renderCheckbox("cost_architectural", "Architectural Designing")}
                            {renderCheckbox("cost_interior", "Interior Decoration")}
                            {renderCheckbox("cost_landscaping", "Landscaping")}
                            {renderCheckbox("cost_construction", "Construction")}
                            {renderCheckbox("cost_turnkey", "Turnkey")}
                            {renderCheckbox("cost_other", "Other")}
                        </div>
                    </FormField>
                    <Subtitle>Dates Concerned with Project:</Subtitle>
                    <FormField label="First Information about Project:">{renderInput("date_first_info", "YYYY-MM-DD")}</FormField>
                    <FormField label="First Meeting:">{renderInput("date_first_meeting", "YYYY-MM-DD")}</FormField>
                    <FormField label="First Working on Project:">{renderInput("date_first_working", "YYYY-MM-DD")}</FormField>
                    <FormField label="First Proposal:">{renderInput("date_proposal1_start", "Start")} {renderInput("date_proposal1_completion", "Completion")}</FormField>
                    <FormField label="Second Proposal:">{renderInput("date_proposal2_start", "Start")} {renderInput("date_proposal2_completion", "Completion")}</FormField>
                    <FormField label="First Information:">{renderInput("date_first_info_2")}</FormField>
                    <FormField label="Working on Finalized Proposal:">{renderInput("date_final_proposal", "YYYY-MM-DD")}</FormField>
                    <FormField label="Revised Presentation:">{renderInput("date_revised_presentation", "YYYY-MM-DD")}</FormField>
                    <FormField label="Quotation:">{renderInput("date_quotation", "YYYY-MM-DD")}</FormField>
                    <FormField label="Drawings:">{renderInput("date_drawings_start", "Start")} {renderInput("date_drawings_completion", "Completion")}</FormField>
                    <FormField label="Other Major Projects Milestone Dates:">{renderTextarea("date_other_milestones")}</FormField>

                    <SectionTitle>Provided by Owner</SectionTitle>
                    <FormField label="">{renderCheckbox("provided_program", "Program:")}</FormField>
                    <FormField label="">{renderCheckbox("provided_schedule", "Suggested Schedule:")}</FormField>
                    <FormField label="">{renderCheckbox("provided_legal", "Legal Site Description & Other Concerned Documents:")}</FormField>
                    <FormField label="">{renderCheckbox("provided_survey", "Land Survey Report:")}</FormField>
                    <FormField label="">{renderCheckbox("provided_geo", "Geo-Technical, Tests and Other Site Information:")}</FormField>
                    <FormField label="">{renderCheckbox("provided_drawings", "Existing Structure's Drawings:")}</FormField>
                    
                    <SectionTitle>Compensation</SectionTitle>
                    <FormField label="Initial Payment:">{renderInput("comp_initial_payment")}</FormField>
                    <FormField label="Basic Services (% of Cost of Construction):">{renderInput("comp_basic_services_pct")}</FormField>
                    <div className="pl-4">
                        <p className="font-medium mb-2">Breakdown by Phase:</p>
                        <FormField label="Schematic Design %:">{renderInput("comp_schematic_pct")}</FormField>
                        <FormField label="Design Development %:">{renderInput("comp_dev_pct")}</FormField>
                        <FormField label="Construction Doc's %:">{renderInput("comp_docs_pct")}</FormField>
                        <FormField label="Bidding / Negotiation %:">{renderInput("comp_bidding_pct")}</FormField>
                        <FormField label="Construction Contract Admin %:">{renderInput("comp_admin_pct")}</FormField>
                    </div>
                    <FormField label="Additional Services (Multiple of Times Direct Cost to Architect):">{renderInput("comp_additional_services")}</FormField>
                    <FormField label="Reimbursable Expenses:">{renderInput("comp_reimbursable")}</FormField>
                    <FormField label="Other:">{renderInput("comp_other")}</FormField>
                    <FormField label="Special Confidential Requirements:">{renderTextarea("comp_confidential")}</FormField>

                    <SectionTitle>Consultants</SectionTitle>
                    <div className="grid grid-cols-5 gap-2 font-semibold text-center border-b pb-2">
                        <p className="text-left">Type</p><p>Within Basic Fee</p><p>Additional Fee</p><p>Architect</p><p>Owner</p>
                    </div>
                    {["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Construction Cost", "Other", " ", " ", " ", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"].map(renderConsultantRow)}
                    <p>Retained and Paid by Owner, Co ordination By Retained by Architect</p>


                    <SectionTitle>Miscellaneous Notes</SectionTitle>
                    <Textarea name="misc_notes" value={formData.misc_notes || ''} onChange={handleInputChange} rows={5}/>

                    <SectionTitle>Requirements</SectionTitle>
                    <FormField label="Residence: Nos.">{renderInput("req_residence_nos")}</FormField>
                    <FormField label="Size of plot">{renderInput("req_plot_size")}</FormField>
                    <FormField label="Number of Bedrooms">{renderInput("req_bedrooms")}</FormField>
                    <FormField label="Specifications">{renderInput("req_specifications")}</FormField>
                    <FormField label="Number of Dressing Rooms">{renderInput("req_dressing_rooms")}</FormField>
                    <FormField label="Number of Bath Rooms">{renderInput("req_bathrooms")}</FormFiel>
                    <FormField label="Living Rooms">{renderInput("req_living_rooms")}</FormField>
                    <FormField label="Breakfast">{renderInput("req_breakfast")}</FormField>
                    <FormField label="Dinning">{renderInput("req_dinning")}</FormField>
                    <FormField label="Servant Kitchen">{renderInput("req_servant_kitchen")}</FormField>
                    <FormField label="Self Kitchenett">{renderInput("req_kitchenette")}</FormField>
                    <FormField label="Garage">{renderInput("req_garage")}</FormField>
                    <FormField label="Servant Quarters">{renderInput("req_servant_quarters")}</FormField>
                    <FormField label="Guard Room">{renderInput("req_guard_room")}</FormField>
                    <FormField label="Study Room">{renderInput("req_study_room")}</FormField>
                    <FormField label="Stores">{renderInput("req_stores")}</FormField>
                    <FormField label="Entertainment Area">{renderInput("req_entertainment")}</FormField>
                    <FormField label="Patio">{renderInput("req_patio")}</FormField>
                    <FormField label="Atrium">{renderInput("req_atrium")}</FormField>
                    <FormField label="Remarks">{renderTextarea("req_remarks")}</FormField>
                </div>
            </CardContent>
        </Card>
    );
};

const Section8 = () => {
    const [formData, setFormData] = useState<any>({});
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const handleRadioChange = (name: string, value: string) => {
        setFormData({...formData, [name]: value});
    }

    return (
    <Card>
        <CardHeader>
            <CardTitle className="text-center">SITE SURVEY</CardTitle>
            <p className='text-center'>REAL ESTATE MANAGEMENT</p>
            <p className='text-center'>PREMISES REVIEW FOR PROPOSED BRANCH/OFFICE</p>
            <p className="text-sm text-center">This questionnaire form provides preliminary information for determining the suitability of premises or property to be acquired</p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Subtitle>Location</Subtitle>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Purpose</Label>
                        <RadioGroup defaultValue="branch" className="flex gap-4 mt-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="branch" id="branch" /><Label htmlFor="branch">Branch</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="office" id="office" /><Label htmlFor="office">Office</Label></div>
                             <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="other-purpose" /><Label htmlFor="other-purpose">Other</Label></div>
                        </RadioGroup>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="City"/>
                        <Input placeholder="Region"/>
                    </div>
                    <Input placeholder="Address" className="col-span-2"/>
                </div>
            </div>
            <div>
                <Subtitle>Legal File</Subtitle>
                 <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Name of Owner"/>
                    <div className="flex items-center gap-4">
                        <Label>Is Completion Certificate available?</Label>
                        <RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="cert-yes" /><Label htmlFor="cert-yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="cert-no" /><Label htmlFor="cert-no">No</Label></div></RadioGroup>
                    </div>
                     <div className="flex items-center gap-2">
                        <Label>Is the property leased?</Label>
                        <RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="leased-yes" /><Label htmlFor="leased-yes">Yes</Label></div><Label className="text-sm text-muted-foreground">As informed by Owner Representative</Label><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="leased-no" /><Label htmlFor="leased-no">No</Label></div></RadioGroup>
                    </div>
                </div>
            </div>

            <div>
                <Subtitle>Area</Subtitle>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Label>Dimension (Attach as-built plan(s))</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <Input placeholder="Maximum Frontage in feet" />
                            <Input placeholder="Maximum Depth in feet" />
                        </div>
                    </div>
                    <Input placeholder="Total Area in Sqft" />
                    <Input placeholder="Minimum clear height (floor to roof) in ft" />
                    <Input placeholder="Building plot size of which premises is a part" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Covered Area (Basement)"/>
                        <Input placeholder="Covered Area (Ground Floor)"/>
                    </div>
                    <Input placeholder="No. of Stories/floors (mention, mezzanine basement, roof parapet wall)" />
                </div>
            </div>

            <div>
                <Subtitle>Building Overview</Subtitle>
                 <div className="grid grid-cols-2 gap-4 items-start">
                    <div><Label>Independent Premises</Label><RadioGroup className="flex gap-4 mt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ind-yes" /><Label htmlFor="ind-yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ind-no" /><Label htmlFor="ind-no">No</Label></div></RadioGroup></div>
                    <div><Label>Status</Label><Input/></div>
                    <div><Label>Type of Premises</Label><Input/></div>
                    <div><Label>Age of Premises</Label><Input/></div>
                    <div><Label>Interior of Premises</Label><Input/></div>
                    <div><Label>Type of Construction</Label><Input/></div>

                    <div className="col-span-2"><p className="font-semibold">Condition of premises with reference to structural stability</p></div>
                    <div className="flex items-center gap-4"><Label>Is entrance independent?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Staircase for staff use available with its assessment?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Emergency exit available?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>If not, can be provided?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Ramp available?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>If not, can be provided?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Seepage?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <Input placeholder="Area of seepage (Walls, slab, etc.)"/>
                    <Input placeholder="Cause of seepage"/>
                    <div className="flex items-center gap-4"><Label>Generator installation space?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div>
                        <Label>Property Utilization</Label>
                        <div className="flex flex-wrap gap-4 mt-2">
                             <div className="flex items-center space-x-2"><Checkbox id="pu-res" /><Label htmlFor="pu-res">Fully residential</Label></div>
                             <div className="flex items-center space-x-2"><Checkbox id="pu-com" /><Label htmlFor="pu-com">Fully Commercial</Label></div>
                             <div className="flex items-center space-x-2"><Checkbox id="pu-dual" /><Label htmlFor="pu-dual">Dual use</Label></div>
                             <div className="flex items-center space-x-2"><Checkbox id="pu-ind" /><Label htmlFor="pu-ind">Industrial</Label></div>
                        </div>
                    </div>
                    <Input placeholder="Building plinth level from the road"/>
                    <div className="flex items-center gap-4"><Label>Is area susceptible to flooding during rainfall?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Disable access available or can be provided?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <Input placeholder="Condition of roof waterproofing (if applicable)"/>
                     <div className="flex items-center gap-2">
                        <Label>Parking available?</Label>
                        <RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><Label className="text-sm text-muted-foreground">On Main Road</Label><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup>
                    </div>
                    <div className="flex items-center gap-4"><Label>Approachable through road?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-2">
                        <Label>Any hazard like petrol pump/CNG station/in vicinity available?</Label>
                        <RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><Label className="text-sm text-muted-foreground">300 meter</Label><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup>
                    </div>
                    <div className="flex items-center gap-4"><Label>Wall masonary material as per region?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Space for signage available?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>

                    <div className="col-span-2">
                        <Label>Major retainable building elements</Label>
                        <div className="flex flex-wrap gap-4 mt-2">
                           <div className="flex items-center space-x-2"><Checkbox id="mrb-wt" /><Label htmlFor="mrb-wt">Water Tank</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="mrb-v" /><Label htmlFor="mrb-v">Vault</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="mrb-sf" /><Label htmlFor="mrb-sf">Subflooring</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="mrb-sc" /><Label htmlFor="mrb-sc">Staircase</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="mrb-o" /><Label htmlFor="mrb-o">Others</Label></div>
                        </div>
                    </div>
                     <Input className="col-span-2" placeholder="In case of Plot provide existing level from road & surrounding buildings" />

                     <div>
                        <Label>Building Control Violations</Label>
                        <div className="flex gap-4 mt-2">
                            <div className="flex items-center space-x-2"><Checkbox id="bcv-maj" /><Label htmlFor="bcv-maj">Major</Label></div>
                            <div className="flex items-center space-x-2"><Checkbox id="bcv-min" /><Label htmlFor="bcv-min">Minor</Label></div>
                            <div className="flex items-center space-x-2"><Checkbox id="bcv-no" /><Label htmlFor="bcv-no">No Deviation</Label></div>
                            <Label className="text-sm text-muted-foreground">As performed by owner representative</Label>
                        </div>
                    </div>
                 </div>
            </div>

            <div>
                <Subtitle>Utilities</Subtitle>
                <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Sanctioned electrical load" />
                    <div>
                        <Label>Type of electrical load</Label>
                         <div className="flex flex-wrap gap-4 mt-2">
                             <div className="flex items-center space-x-2"><Checkbox id="el-com" /><Label htmlFor="el-com">Commercial</Label></div>
                             <div className="flex items-center space-x-2"><Checkbox id="el-ind" /><Label htmlFor="el-ind">Industrial</Label></div>
                             <div className="flex items-center space-x-2"><Checkbox id="el-res" /><Label htmlFor="el-res">Residential</Label></div>
                        </div>
                    </div>
                    <div>
                        <Label>Electrical Meter</Label>
                        <RadioGroup className="flex gap-4 mt-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="single" /><Label>Single Phase</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="3phase" /><Label>3 Phase</Label></div>
                        </RadioGroup>
                    </div>
                    <div className="flex items-center gap-4"><Label>Piped water available?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Underground tank?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Overhead tank?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <Input placeholder="Type of Overhead tank (RCC, Fiber etc.)" />
                    <Input placeholder="Type of water (boring or liner water)" />
                    <div className="flex items-center gap-4"><Label>Gas Connection?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                    <div className="flex items-center gap-4"><Label>Connected to Sewerage line?</Label><RadioGroup className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" /><Label>Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" /><Label>No</Label></div></RadioGroup></div>
                </div>
            </div>

            <div>
                <Subtitle>Bounded As</Subtitle>
                <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Front"/>
                    <Input placeholder="Back"/>
                    <Input placeholder="Right"/>
                    <Input placeholder="Left"/>
                </div>
            </div>

            <div>
                <Subtitle>Rental Detail</Subtitle>
                 <div className="grid grid-cols-2 gap-4">
                     <Input placeholder="Acquisition" />
                     <Input placeholder="Expected Rental/month" />
                     <Input placeholder="Expected Advance (# of month)" />
                     <Input placeholder="Expected period of lease" />
                     <Input placeholder="Annual increase in rental" />
                 </div>
            </div>
             <div>
                <Subtitle>Survey Conducted By</Subtitle>
                 <div className="grid grid-cols-2 gap-4">
                     <Input placeholder="Name" />
                     <Input placeholder="Designation" />
                     <Input placeholder="Contact" />
                     <Input placeholder="Cell" />
                     <Input placeholder="Landline" />
                     <Input placeholder="Email" />
                     <Input placeholder="Date" />
                 </div>
            </div>
        </CardContent>
    </Card>
)};

const Section9 = () => (<Card><CardHeader><CardTitle>Project Bylaws</CardTitle></CardHeader><CardContent>...</CardContent></Card>);
const Section10 = () => (
    <Card>
        <CardHeader><CardTitle>Proposal Request</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <FormField label="Project" value="" />
                    <FormField label="Proposal Request No." value="" />
                </div>
                 <div className="flex justify-between">
                    <FormField label="(Name, Address)" value="" />
                    <FormField label="Date" value="" />
                </div>
                 <div className="flex justify-between">
                    <FormField label="Architects Project No" value="" />
                    <FormField label="Contract For" value="" />
                </div>
                 <div className="flex justify-between">
                    <FormField label="Owner" value="" />
                    <FormField label="Contract Date" value="" />
                </div>

                <div className="border rounded-md p-4 space-y-2">
                    <p>To: (Contractor)</p>
                    <div className="h-16 border-b"></div>
                </div>

                <FormField label="Description: (Written description of the Work)" as="textarea" value="" />
                <FormField label="Attachments: (List attached documents that support description)" as="textarea" value="" />
                
                <p>Please submit an itemized quotation for changes in the Contract Sum and/or Time incidental to proposed modifications to the Contract Documents described herein.</p>
                <p className="font-bold">THIS IS NOT A CHANGE ORDER NOT A DIRECTION TO PROCEED WITH THE WORK DESCRIBED HEREIN.</p>
                
                <div className="flex justify-between items-end pt-8">
                    <div>
                        <p>Architect:</p>
                        <div className="h-10 border-b w-48"></div>
                        <p>By:</p>
                    </div>
                     <div><p>Owner</p></div>
                     <div><p>Architect</p></div>
                     <div><p>Contractor</p></div>
                     <div><p>Field</p></div>
                     <div><p>Other</p></div>
                </div>
            </div>
        </CardContent>
    </Card>
);
const Section11 = () => (
    <Card>
        <CardHeader><CardTitle>Drawings (Architectural / Interiors / submission)</CardTitle></CardHeader>
        <CardContent>
            <DrawingsList />
        </CardContent>
    </Card>
);
const Section12 = () => (<Card><CardHeader><CardTitle>Shop Drawings Sample Record</CardTitle></CardHeader><CardContent>
    <div className="space-y-4">
        <FormField label="Project" value="" />
        <FormField label="Architect's Project No" value="" />
        <FormField label="Contractor" value="" />
        <FormField label="Spec. Section No." value="" />
        <FormField label="Shop Drawing or Sample Drawing No." value="" />
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Record Date</TableHead>
                    <TableHead>Referred To</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead># Copies</TableHead>
                    <TableHead>Date Ret'd.</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Copies To</TableHead>
                    <TableHead>Title</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(9)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell className="space-y-1">
                            <div><Checkbox id={`a${i}`}/><Label htmlFor={`a${i}`}>Approved</Label></div>
                            <div><Checkbox id={`an${i}`}/><Label htmlFor={`an${i}`}>App'd as Noted</Label></div>
                            <div><Checkbox id={`rr${i}`}/><Label htmlFor={`rr${i}`}>Revise & Resubmit</Label></div>
                            <div><Checkbox id={`na${i}`}/><Label htmlFor={`na${i}`}>Not Approved</Label></div>
                        </TableCell>
                         <TableCell className="space-y-1">
                            <div><Checkbox id={`co${i}`}/><Label htmlFor={`co${i}`}>Contractor</Label></div>
                            <div><Checkbox id={`ow${i}`}/><Label htmlFor={`ow${i}`}>Owner</Label></div>
                            <div><Checkbox id={`fi${i}`}/><Label htmlFor={`fi${i}`}>Field</Label></div>
                            <div><Checkbox id={`f${i}`}/><Label htmlFor={`f${i}`}>File</Label></div>
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
</CardContent></Card>);
const Section13 = () => (<Card><CardHeader><CardTitle>Project Chart (Studio)</CardTitle></CardHeader><CardContent>...</CardContent></Card>);
const Section14 = () => (
    <Card>
        <CardHeader><CardTitle>Architects Field Report / Transmittal Letter / Minutes of Meetings</CardTitle></CardHeader>
        <CardContent className="space-y-8">
            {/* Field Report */}
            <div className="border p-4 rounded-lg">
                <h3 className="text-xl font-bold text-center">ARCHITECT'S FIELD REPORT</h3>
                <div className="grid grid-cols-2 gap-4 my-4">
                    <FormField label="Project" value="" />
                    <FormField label="Field Report No." value="" />
                    <FormField label="Contract" value="" />
                    <FormField label="Architects Project No" value="" />
                    <FormField label="Date" value="" />
                    <FormField label="Time" value="" />
                    <FormField label="Weather" value="" />
                    <FormField label="Tem. Range" value="" />
                </div>
                <FormField label="Est. % of Completion" value="" />
                <FormField label="Conformance with Schedule" value="" />
                <FormField label="Work in Progress" as="textarea" value="" />
                <FormField label="Present at Site" as="textarea" value="" />
                <FormField label="Observations" as="textarea" value="" />
                <FormField label="Items to Verify" as="textarea" value="" />
                <FormField label="Information or Action Required" as="textarea" value="" />
                <FormField label="Attachments" as="textarea" value="" />
                <div className="flex justify-between items-end mt-4">
                    <FormField label="Report By" value="" />
                    <div className="flex gap-4"><span>Owner</span><span>Architect</span><span>Contractor</span><span>Field</span><span>Other</span></div>
                </div>
            </div>
            {/* Transmittal Letter */}
            <div className="border p-4 rounded-lg">
                <h3 className="text-xl font-bold text-center">TRANSMITTAL LETTER</h3>
                <div className="grid grid-cols-2 gap-4 my-4">
                    <FormField label="Project (Name, Address)" value="" />
                    <div>
                        <FormField label="Architect" value="" />
                        <FormField label="Project No" value="" />
                        <FormField label="Date" value="" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="border p-2 rounded">
                        <p>To:</p>
                        <p>Attn:</p>
                    </div>
                    <div>
                        <p>If Enclosures are not as noted, Please Inform us immediately.</p>
                        <p>If checked below, please:</p>
                        <div className="flex gap-2"><Checkbox /> Acknowledge Receipt of Enclosures.</div>
                        <div className="flex gap-2"><Checkbox /> Return Enclosures to us.</div>
                    </div>
                </div>
                <div className="my-4">
                    <p>We Transmit:</p>
                    <div className="flex gap-4">
                        <div className="flex gap-2"><Checkbox /> herewith</div>
                        <div className="flex gap-2"><Checkbox /> under separate cover via ______</div>
                        <div className="flex gap-2"><Checkbox /> in accordance with your request ______</div>
                    </div>
                    <p className="mt-2">For Your:</p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex gap-2"><Checkbox /> approval</div>
                        <div className="flex gap-2"><Checkbox /> distribution to parties</div>
                        <div className="flex gap-2"><Checkbox /> information</div>
                        <div className="flex gap-2"><Checkbox /> review & comment</div>
                        <div className="flex gap-2"><Checkbox /> record</div>
                        <div className="flex gap-2"><Checkbox /> use</div>
                        <div className="flex gap-2"><Checkbox /> ______</div>
                    </div>
                     <p className="mt-2">The Following:</p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex gap-2"><Checkbox /> Drawings</div>
                        <div className="flex gap-2"><Checkbox /> Shop Drawing Prints</div>
                        <div className="flex gap-2"><Checkbox /> Samples</div>
                        <div className="flex gap-2"><Checkbox /> Specifications</div>
                        <div className="flex gap-2"><Checkbox /> Shop Drawing Reproducible</div>
                        <div className="flex gap-2"><Checkbox /> Product Literature</div>
                        <div className="flex gap-2"><Checkbox /> Change Order</div>
                         <div className="flex gap-2"><Checkbox /> ______</div>
                    </div>
                </div>
                 <Table>
                    <TableHeader><TableRow><TableHead>Copies</TableHead><TableHead>Date</TableHead><TableHead>Rev. No.</TableHead><TableHead>Description</TableHead><TableHead>Action Code</TableHead></TableRow></TableHeader>
                    <TableBody>{[...Array(4)].map((_,i)=><TableRow key={i}><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell</TableRow>)}</TableBody>
                </Table>
                <div className="text-xs my-2">
                    <strong>Action Code:</strong> A. Action indicated on item transmitted D. For signature and forwarding as noted below under REMARKS, B. No action required E. See REMARKS below, C. For signature and return to this office
                </div>
                <FormField label="Remarks" as="textarea" value=""/>
                <div className="flex justify-between mt-4">
                     <FormField label="Copies To: (With Enclosures)" value=""/>
                     <FormField label="Received By:" value=""/>
                </div>
            </div>
            {/* Minutes of Meeting */}
            <div className="border p-4 rounded-lg">
                <h3 className="text-xl font-bold text-center">MINUTES OF MEETING</h3>
                 <div className="grid grid-cols-3 gap-4 my-4">
                    <FormField label="Project" value="" />
                    <FormField label="Meeting Date" value="" />
                    <FormField label="Meeting Time" value="" />
                    <FormField label="Meeting Location" value="" />
                    <FormField label="Meeting Called By" value="" />
                    <FormField label="Type of Meeting" value="" />
                    <FormField label="Facilitator" value="" />
                    <FormField label="Note Taker" value="" />
                    <FormField label="Timekeeper" value="" />
                </div>
                <FormField label="Attendees" as="textarea" value="" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-t pt-4 mt-4">
                        <FormField label="Time Allotted" value="______ hours / days" />
                        <FormField label="Agenda Topic" value="" />
                        <FormField label="Presenter" value="" />
                        <FormField label="Discussion" as="textarea" value="" />
                        <FormField label="Conclusions" as="textarea" value="" />
                        <FormField label="Action Items">
                             <Table>
                                <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Person Responsible</TableHead><TableHead>Deadline</TableHead></TableRow></TableHeader>
                                <TableBody><TableRow><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow></TableBody>
                            </Table>
                        </FormField>
                    </div>
                ))}
                <FormField label="Observers" as="textarea" value="" />
                <FormField label="Resource Persons" as="textarea" value="" />
                <FormField label="Special Notes" as="textarea" value="" />
            </div>
        </CardContent>
    </Card>
);
const Section15 = () => (
    <Card>
        <CardHeader><CardTitle>List Of Sub consultants</CardTitle></CardHeader>
        <CardContent>
             <FormField label="Project" value="" />
            <FormField label="Architect" value="" />
            <FormField label="Architects Project No" value="" />
            <FormField label="Date" value="" />
            <div className="border p-2 rounded mt-4">To: (Consultant)</div>
            <p className="my-4">List Sub-Consultants and others proposed to be employed on the above Project as required by the bidding documents. (To be filled out by the Contractor and returned to the Architect.)</p>
            <Table>
                <TableHeader><TableRow><TableHead>Work</TableHead><TableHead>Firm</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead>Representative</TableHead></TableRow></TableHeader>
                <TableBody>{[...Array(15)].map((_,i)=><TableRow key={i}><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}</TableBody>
            </Table>
        </CardContent>
    </Card>
);
const Section16 = () => (
     <Card>
        <CardHeader><CardTitle>List of Contractors</CardTitle></CardHeader>
        <CardContent>
             <FormField label="Project" value="" />
            <FormField label="Architect" value="" />
            <FormField label="Architects Project No" value="" />
            <FormField label="Date" value="" />
            <div className="border p-2 rounded mt-4">To: (Contractor)</div>
            <p className="my-4">List Subcontractors and others proposed to be employed on the above Project as required by the bidding documents. (To be filled out by the Contractor and returned to the Architect.)</p>
            <Table>
                <TableHeader><TableRow><TableHead>Work</TableHead><TableHead>Firm</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead>Representative</TableHead></TableRow></TableHeader>
                <TableBody>{[...Array(15)].map((_,i)=><TableRow key={i}><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}</TableBody>
            </Table>
        </CardContent>
    </Card>
);
const Section17 = () => {
    const vendors = {
        "Cement Vendors": [
            { "Sr.No": 1, "Company Name": "DG Cement", "Person Name": "Tahir Hamid", "Products": "Cement", "Address": "Nishat House ,53-A Lawrence Road , Lahore ,Punjab", "Contact": "0300-84772882" },
            { "Sr.No": 2, "Company Name": "Bestway Cement", "Person Name": "", "Products": "Cement", "Address": "Best Way Building 19-A,College Road F-7 Markaz,Islamabad", "Contact": "051-9271949,051-9271959, 051 9273602-03" },
            { "Sr.No": 3, "Company Name": "Askari Cement", "Person Name": "", "Products": "Cement", "Address": "9th Floor,AWT Plaza The Mall,Rawalpindi", "Contact": "051-9271949,051-9271959, 051 9273602-03" },
            { "Sr.No": 4, "Company Name": "Maple Leaf Cement", "Person Name": "", "Products": "Cement", "Address": "42 Lawrence Road,Lahore,Pakistan", "Contact": "042-6304136,042-6369799" },
        ],
        "Brick Vendors": [
            { "Sr.No": 1, "Company Name": "Butt Bricks Company", "Person Name": "Manzoor", "Products": "Brick,Brick Tile,Fly Ash Bricks,Gutka Bricks", "Address": "Lahore", "Contact": "0321-2222957" },
            { "Sr.No": 2, "Company Name": "Brick Supplier", "Person Name": "Ahmad Ch", "Products": "Brick", "Address": "Lahore", "Contact": "3004090140" },
            { "Sr.No": 3, "Company Name": "Brick Company", "Person Name": "Raja Rafaqat", "Products": "Brick", "Address": "Lahore", "Contact": "3215863618" },
            { "Sr.No": 4, "Company Name": "Brick Special company", "Person Name": "Usman Safi", "Products": "Brick", "Address": "Lahore", "Contact": "312458795" },
            { "Sr.No": 5, "Company Name": "AmerIcan bricks", "Person Name": "Umer latif", "Products": "Brick", "Address": "Lahore", "Contact": "3218833616" },
        ],
        "Steel Vendors List": [
            { "Sr No.": 1, "Vendor's Name": "Shalimar Steel", "Contact Person": "", "Products": "Metal Support System", "Address": "40-A Pecco Road,Badami Bagh,Lahore", "Contact": "042-7283342,7284313" },
            { "Sr No.": 2, "Vendor's Name": "Izhar Steel", "Contact Person": "", "Products": "Metal Support System", "Address": "35-Tipu Block,New Garden Town Main Ferozepur Road", "Contact": "35888000-9" },
            { "Sr No.": 3, "Vendor's Name": "Pak Steel", "Contact Person": "", "Products": "Metal Support System", "Address": "Pakistan Steel Bin Qasim Karachi 75000", "Contact": "021-99264222,021-3750271" },
            { "Sr No.": 4, "Vendor's Name": "FF Steel", "Contact Person": "", "Products": "Metal Support System", "Address": "307/J, Block Commerical Area Near Bank of Punjab DHA Phase 12 EME Multan Road Lahore.", "Contact": "0334-4888999" },
        ],
        "Tiles Vendors": [
            {"Sr No": 1, "Company Name": "Hadayat Sons", "Contact Person": "Rubait Durrani", "Products": "Tiles, Granite, Marble", "Address": "Defence Main Boulevard Lahore", "Contact": "042-111-333-946,03464355119"},
            {"Sr No": 2, "Company Name": "S.Abdullah", "Contact Person": "Sameer", "Products": "Tiles, Granite, Marble", "Address": "2-Aibak Block, New Garden Town, Lahore", "Contact": "0321-4036880,042-111-722-722"},
            {"Sr No": 3, "Company Name": "Grannitto Tiles", "Contact Person": "M.Usman", "Products": "Tiles, Granite, Marble", "Address": "133-Main Ferozepur Road,Lahore", "Contact": "0321-8857850"},
            {"Sr No": 4, "Company Name": "Innovative Concrete Products", "Contact Person": "", "Products": "Rough Tiles,Terra Cotta Tiles", "Address": "Lajna Chowk, 46-1 College Road, Block 1 Sector C-1 Block 1 Twp Sector C 1 Lahore", "Contact": "0309 6600855"},
            {"Sr No": 5, "Company Name": "Tariq Brothers", "Contact Person": "", "Products": "Rough Tiles, Terra Cotta Tiles", "Address": "39-Palace Market Bedan Road,Lahore", "Contact": "042-7314651-52"},
            {"Sr No": 6, "Company Name": "SMC", "Contact Person": "Usman Zahid", "Products": "Tiles, Granite, Marble", "Address": "445/1 Main Boulevard,Defence, Lahore", "Contact": "0300-8427033,042-35823152"},
            {"Sr No": 7, "Company Name": "Crete Sol", "Contact Person": "Awais Qazi, Atif", "Products": "Tiles, Granite, Marble", "Address": "Suite#312,3rd Floor,Century Tower,Kalma Chowk,Main Boulevard Gulberg II,Lahore,Pakistan", "Contact": "0325-5566963, 111-855-855"},
            {"Sr No": 8, "Company Name": "Trendstetters", "Contact Person": "Ali Abbas", "Products": "Tiles/ Sanitary/ High end Showe/Faucets/ Lighting", "Address": "Main Defence Ghazi Road,Lahore", "Contact": "3214240194"},
            {"Sr No": 9, "Company Name": "Sanitar", "Contact Person": "Yawar", "Products": "Tiles/ Sanitary/ High end Showe/Faucets/ Lighting", "Address": "105, E, 1-C D.H.A. Main Blvd, Sector B DHA Phase 3, Lahore, Punjab 54700", "Contact": "0321-4792922"},
            {"Sr No": 10, "Company Name": "MAHMOOD SONS", "Contact Person": "AHMEAD KHAN (Marketing Manager)", "Products": "Tiles/ Sanitary/ PVC pipe/ lights", "Address": "200-ferazepur road, lahore", "Contact": "E-mail info@mahmoodsonspvtltd.com Mobile: 324-4545947 Telephone:042-37538845-6"},
            {"Sr No": 11, "Company Name": "Future Design", "Contact Person": "Amir Riaz/ Imran Ali", "Products": "Tiles/ Sanitary/ High end Showe/Faucets/ Lighting", "Address": "150 CCA DHA Cantt Phase 4, Lahore, Pakistan, http/www.futuredesignz.pk", "Contact": "E-mail amir@futuredesignz.pk, amir.riazfd@gmail.com Mobile: 0322-8086027, 0343 4664087, 042-36677242, 042-35043455,0321-4424444"},
        ],
        "Aluminium Products Vendor List": [
            {"Sr No.": 1, "Company Name": "Alcop Aluminium Company", "Contact Person": "Mr. Nadeem- Ul - Haq", "Products": "Aluminium Products,Aluminium Doors & Windows,Aluminium Extruded", "Address": "Building N0, E-105, Main Boulevard defense, Lahore cantt.", "Contact": "042-35841861-3"},
            {"Sr No.": 3, "Company Name": "Prime Aluminium Industries(pvt) Ltd-Automatic Doors, Vault Doors,Revolving Doors", "Contact Person": "", "Products": "", "Address": "", "Contact": "042-7283342,7284313, 0321 4258 000"},
            {"Sr No.": 4, "Company Name": "Alcon Aluminum", "Contact Person": "", "Products": "Aluminium Products,Aluminium Doors & Windows,Aluminium Extruded", "Address": "", "Contact": ""}
        ],
        "GLASS VENDORS": [
            {"Sr No": 1, "Company": "Ghani Glass Limited", "Contact Person": "Adeel Ilyas", "Products": "Double Glazed Glass,Tempered Glass,Float Glass", "Address": "40-L Model Town,Ext,Lahore", "Contact": "042-35169049,0321-8488394"},
            {"Sr No": 2, "Company": "Innovative Marketing Company", "Contact Person": "Nayer Mirza", "Products": "Double Glazed Glass,Tempered Glass,Float Glass", "Address": "9-A Beadon Road Lahore", "Contact": "0300-8162728"},
            {"Sr No": 3, "Company": "Al-Fatah Toughened Glass Industries(pvt) Ltd", "Contact Person": "Tanveer Saeed", "Products": "Double Glazed Glass,Tempered Glass,Float Glass", "Address": "Office#411, 4th Floor,Alqadeer Heights,1-Babar Block New Garden Town,Lahore", "Contact": "0300/0302-8459142"},
            {"Sr No": 4, "Company": "Guardian Glass", "Contact Person": "", "Products": "Double Glazed Glass,Tempered Glass,Float Glass", "Address": "PLANT 13 KM SHEIKHUPURA ROAD, LAHORE, PAKISTAN", "Contact": ""},
            {"Sr No": 5, "Company": "Pilkington glass", "Contact Person": "", "Products": "Double Glazed Glass,Tempered Glass,Float Glass", "Address": "9 ROYAL PARK, NEAR HAMID CENTRE LAHORE-PAKISTAN", "Contact": ""}
        ],
        "List of Paint Vendors": [
            {"Sr No.": 1, "Company": "ICI", "Contact Person": "", "Products": "PAINTS", "Address": "346 Ferozepur Road,Lahore", "Contact Number": "02132313717-22"},
            {"Sr No.": 2, "Company": "Berger", "Contact Person": "", "Products": "PAINTS", "Address": "36-Industrial Estate,Kot Lakhpat, Lahore", "Contact Number": "111-237-237"},
            {"Sr No.": 3, "Company": "Nippon", "Contact Person": "", "Products": "PAINTS", "Address": "27-km, Multan Road Lahore", "Contact Number": "042-5725241"},
            {"Sr No.": 4, "Company": "JOTUN", "Contact Person": "", "Products": "PAINTS", "Address": "2km. Defence road,Off 9km Raiwind, Adj. Valancia Homes Gate, Lahore", "Contact Number": "042-5725241"},
            {"Sr No.": 5, "Company": "Gobis", "Contact Person": "", "Products": "PAINTS", "Address": "Sanda Lahore, Punjab", "Contact Number": "(042) 111 146 247"}
        ],
        "List of Jumblon Sheet Vendors": [
            {"Sr No.": 1, "Vendor's Name": "Diamond Jumblon", "Contact Person": "", "Products": "Jumblon Sheet", "Address": "23-km Multan Road, Mohlanwal,Lahore", "Contact": "042-35314391,042-35752229"},
            {"Sr No.": 2, "Vendor's Name": "Industrial Enterprises", "Contact Person": "", "Products": "Jumblon Sheet", "Address": "6-N, Industrial Area, Gulberg II, Lahore 54000", "Contact": "042-35712229,042-35752229"},
            {"Sr No.": 3, "Vendor's Name": "Samz Chemical Industries", "Contact Person": "", "Products": "Jumblon Sheet", "Address": "Suit #14, 2nd Floor,Select Center, F-11 Markaz, Islamabad", "Contact": "051-2107408,0300-9555117"}
        ],
        "Waterproofing Vendors": [
            {"Sr No.": 1, "Vendors Name": "Abepak Pvt Ltd", "Contact Person": "Nadeem", "Services": "Waterproofing", "Address": "Yousaf Town Lahore", "Contact": "0423-53222013"},
            {"Sr No.": 2, "Vendors Name": "Bitumen Membrane Type (Roof Grip)", "Contact Person": "", "Services": "Heat & Waterproofing", "Address": "Block A Muhafiz Town Lahore", "Contact": "0423-5457688"}
        ],
        "Imported Chemicals Vendors": [
            {"Sr No.": 1, "Vendor's Name": "Sun Fumitech", "Contact Person": "", "Products": "Imported Chemicals", "Address": "Phase II Ext. Karachi", "Contact No.": "021-35382053"},
            {"Sr No.": 2, "Vendor's Name": "Imported Chemicals(pvt) Ltd", "Contact Person": "", "Products": "Imported Chemicals", "Address": "75-E/1 Main Boulevard Gulberg 3,Lahore", "Contact No.": "042-35710161-65,0346-8605841"},
            {"Sr No.": 3, "Vendor's Name": "Hassan Habib Corporation(pvt)Ltd", "Contact Person": "", "Products": "Imported Chemicals", "Address": "123/3 Quaid-e-Azam, Industrial Estate,Haseen Habib Road,Kot Lakhpat,Lahore,Pakistan", "Contact No.": "042-35124400"},
            {"Sr No.": 4, "Vendor's Name": "Environmental Services Systems", "Contact Person": "", "Products": "Chemical", "Address": "79A-2 Ghalib Market,Gulberg-III, Lahore", "Contact No.": "3454115855"},
            {"Sr No.": 5, "Vendor's Name": "Nayab Pest Control Services", "Contact Person": "", "Products": "Chemical", "Address": "119 Ali Block New Garden Town,Lahore", "Contact No.": "3004018548"}
        ],
        "Wood Veeners Vendors": [
            {"Sr No.": 1, "Vendor's Name": "Al Noor Lasani", "Contact Person": "Umama, Amir Iqbal", "Products": "Wood Veneer", "Address": "3rd floor, IBL Building Center, Intersection of Tipu Suiltan Road , Main Shahrah-e-Faisal, Karachi.", "Contact": "(Umama, 0321 8880 402), (Amir Iqbal. 0302 8260 541), 042 37185113, 37185114, iqbal.amir@alnoormdf.com"},
            {"Sr No.": 2, "Vendor's Name": "HOLZTEC", "Contact Person": "Shahzad,Azim", "Products": "Partitioning & Columns,Washroom Mirrors", "Address": "11-XX,D.H.A,Phase 3 Khayban Iqbal,Lahore", "Contact": "SHAHZAD:03214444402, AZIM:03214262122"},
            {"Sr No.": 3, "Vendor's Name": "Premier", "Contact Person": "Zahid", "Products": "Plastic, PVC Veneer (wall panel, wall cover, false ceiling, antui skid floor, shuttering board, site fencing)", "Address": "272, block 5, Sector D-11, Madar-e-Millat Road, Green Town, Lahore", "Contact": "0310 055 6609, 042 35233630"},
            {"Sr No.": 4, "Vendor's Name": "Layllpur Store", "Contact Person": "Atif Rafi", "Products": "Wood Veneer", "Address": "G-141 Phase 1,DHA Near Masjid Chowk,Lahore Cantt", "Contact": "3004238182"},
            {"Sr No.": 5, "Vendor's Name": "Naeem Trading Company", "Contact Person": "", "Products": "Plastic, PVC Veneer (wall panel, wall cover, false ceiling, antui skid floor, shuttering board, site fencing)", "Address": ": 22 Cooper Rd, Garhi Shahu, Lahore, Punjab", "Contact": ": (042) 36367522"},
            {"Sr No.": 6, "Vendor's Name": "Ultimate(Wilson Art)", "Contact Person": "Mustafa", "Products": "Wood Veneer", "Address": "55-E/1 Jami Commercial Street No.6 Phase VII,DHA Karachi", "Contact": "3332625566"},
        ],
         "List of Timber Vendors": [
            {"Sr#": 1, "Vendors Name": "Azam Timbers", "Contact Person": "", "Products": "Teak Wood,Ash Wood, Beech Wood,Dayer Wood", "Address": "1-Timber Market,Ravi Road Lahore,Pakistan", "Contact No": "3458445893"},
            {"Sr#": 2, "Vendors Name": "Aftab Timber Store", "Contact Person": "", "Products": "Teak Wood,Ash Wood, Beech Wood,Dayer Wood", "Address": "Main Ghazi Road, Defence,Lahore Cantt Pakistan", "Contact No": "042-35811752"},
            {"Sr#": 3, "Vendors Name": "Gul Timber Store", "Contact Person": "", "Products": "Teak Wood,Ash Wood, Beech Wood,Dayer Wood", "Address": "Main Ghazi Road, Lahore", "Contact No": "0344-4808810,03224808810, 0300-4808810"},
            {"Sr#": 4, "Vendors Name": "Alliance Wood Processing", "Contact Person": "M.Qazafi", "Products": "Teak Wood,Ash Wood, Beech Wood,Dayer Wood,Biflex Chemical", "Address": "H#291,ST#8,Cavalry Ground,Lahore Cantt", "Contact No": "0323-455544"},
            {"Sr#": 5, "Vendors Name": "Interwood Mobel (Pvt) Ltd", "Contact Person": "", "Products": "Pre-Fabricated Structural Wood", "Address": "211-Y Block, Defence Phase 3,Lahore", "Contact No": "111-203-203"},
            {"Sr#": 6, "Vendors Name": "International Steel Crafts", "Contact Person": "", "Products": "Pre-Fabricated Structural Wood", "Address": "73-Mcleod Road Lahore", "Contact No": "042-36312402,042-36373993"},
            {"Sr#": 7, "Vendors Name": "Qasim and Company", "Contact Person": "", "Products": "Ash Wood, Teak Wood, Dayar Wood", "Address": "Batala Market 2nd Floor Behind Akram Jewelers, Sataina Road,Punjab,Faislabad", "Contact No": ""},
            {"Sr#": 8, "Vendors Name": "Global Trading Co.Ltd", "Contact Person": "", "Products": "Ash Wood, Teak Wood, Dayar Wood", "Address": "61/1, Surti Mansion, Newneham Road,Kharadar,Opp.Akhund Mosque Karachi", "Contact No": "021-8296415"},
            {"Sr#": 9, "Vendors Name": "Fine Wood Work", "Contact Person": "Arshad", "Products": "Ash Wood, Teak Wood, Dayar Wood", "Address": "Plot No. E-14,near Telephone Exchange,Ferozepur Road, Lahore", "Contact No": "3334308793"},
            {"Sr#": 10, "Vendors Name": "Layllpur Store", "Contact Person": "Atif Rafi", "Products": "Wood Veneer", "Address": "G-141 Phase 1,DHA Near Masjid Chowk,Lahore Cantt", "Contact No": "3004238182"}
        ],
        "Furniture Vendors": [
            {"Sr No.": 1, "Vendors Name": "Master Offisys(PVT) Ltd", "Contact Person": "Soofia M. Qureshi (RSM)", "Services": "Furniture", "Address": "16-B, Eden Homes, Adjacent MCB House, Jail Road, lahore", "Contact": "042-35712733, 35712071, 111-666-555, 0324-4414005"},
            {"Sr No.": 2, "Vendors Name": "Dimensions (Inspiring Workplaces)", "Contact Person": "Fahad Sahni (Sales Executive)", "Services": "Office Furniture", "Address": "Display Centre: F-40/B, Block 4, Off 26th St. Clifton, Karachi, Head Office: Plot No 93. Sector 15, Korangi Industrial area, Karachi,", "Contact": "021, 370327, 35837323. Head office: 021-35121172, 35121173"},
            {"Sr No.": 3, "Vendors Name": "Innovation (A dream Lifestlye)", "Contact Person": "Imran Bhutta", "Services": "Furniture", "Address": "190-E-A1 Main Boulevard Defence, Lahore", "Contact": "0308-4635041, 042-36621338-9"},
            {"Sr No.": 4, "Vendors Name": "Arte Della Vita (Luxury Living)", "Contact Person": "Waqas rehmen (Tec.Officer)", "Services": "Furniture", "Address": "E-15, Al Qadir Heights 1, Babar Block New garden Town, Lahore", "Contact": "0322-4483432, 042-35845220"},
            {"Sr No.": 5, "Vendors Name": "Zamana Interiors", "Contact Person": "Ms. Asma", "Services": "Furniture", "Address": "11, C Main Gulberg Road, Lahore", "Contact": "042 35752468, 35714602, 0321 4677 594"}
        ],
        "Kitchen Vendors": [
            {"Sr No.": 1, "Vendors Name": "Naeem Trading Company", "Contact Person": "", "Products": "Plastic, PVC Veneer (wall panel, wall cover, false ceiling, antui skid floor, shuttering board, site fencing)", "Address": ": 22 Cooper Rd, Garhi Shahu, Lahore, Punjab", "Contact": ": (042) 36367522"},
            {"Sr No.": 2, "Vendors Name": "SMC", "Contact Person": "", "Products": "Kitchen&Wardrobe", "Address": ": (042) 111 762 111", "Contact": ""},
            {"Sr No.": 3, "Vendors Name": "Holztek", "Contact Person": "", "Products": "Kitchen&Wardrobe", "Address": "E110 D.H.A. Main Blvd, New Super Town DHA Phase 3,", "Contact": ": 0321 4444402"},
            {"Sr No.": 4, "Vendors Name": "Varioline Kitchens", "Contact Person": "", "Products": "Kitchen&Wardrobe", "Address": "Mian Mehmood Ali Kasoori Rd, Block B2 Block B 2 Gulberg III, Lahore, Punjab", "Contact": "(042) 111 339 999"},
            {"Sr No.": 5, "Vendors Name": "KITCHEN & WARDROBE", "Contact Person": "", "Products": "Kitchen&Wardrobe", "Address": "100 Green Acres Raiwind Road, 7 km from, Thokar Niaz Baig, Lahore,", "Contact": ""},
            {"Sr No.": 6, "Vendors Name": "Chughtaiz Kitchens & Wardrobes", "Contact Person": "", "Products": "Kitchen&Wardrobe", "Address": "105-E D.H.A. Main Blvd, New Super Town DHA Phase 3, Lahore,", "Contact": "(042) 36682891"}
        ],
        "Fire Places Vendors": [
            {"Sr No": 1, "Vendors Name": "Indus Interiors", "Contact Person": "", "Products": "Fireplaces", "Address": "78-F,Model Town, Opp : Model Town Club Lahore", "Contact": "042-35857508,0300-4256430"},
            {"Sr No": 2, "Vendors Name": "Mavra Fireplace", "Contact Person": "", "Products": "Fireplaces", "Address": "", "Contact": "042-35189673,321-4461115"},
            {"Sr No": 3, "Vendors Name": "Ansari Brother Fireplace", "Contact Person": "", "Products": "Fireplaces", "Address": "Dilkusha Road,near Data Market,Model Town Ext", "Contact": "042-35832171"}
        ],
        "ELECTRICAL VENDORS": [
            {"SR #": 1, "COMPANY": "CREST LED LIGHTING", "ADDRESS": "644/G-1 MARKET, JOHAR TOWN LAHORE", "CONTACT #": "0308-4210211", "CONTACT PERSON": "FAISAL MUMTAZ", "EMAIL ID": ""},
            {"SR #": 2, "COMPANY": "PHILIPS (LIGHTING)", "ADDRESS": "6TH FLOOR BAHRIA COMPLEX 1, 24 M.T. KHAN ROAD KARACHI 74000", "CONTACT #": "3004215690", "CONTACT PERSON": "SAEED IRFAN", "EMAIL ID": "adnan.ahmed@philips.com"},
            {"SR #": 3, "COMPANY": "ORIENT LIGHTING", "ADDRESS": "ADNAN CORPORATION 26 KMMULTAN ROAD LAHORE", "CONTACT #": "021-35644263", "CONTACT PERSON": "AWAIS QAZI", "EMAIL ID": "adnancorporation.ogc@gmail.com"},
            {"SR #": 4, "COMPANY": "KOHALA(SMC-PVT.)LTD(SWIRCH PLATES)", "ADDRESS": "343/A-1,NEW BHABRAH FEROZEPUR ROAD LAHORE", "CONTACT #": "3018444309", "CONTACT PERSON": "", "EMAIL ID": "info@kohala.com.pk"},
            {"SR #": 5, "COMPANY": "MARTIN-ARCHITECTURAL LIGHTING EFFECTS DENMARK", "ADDRESS": "www.martin-architectural.com", "CONTACT #": "", "CONTACT PERSON": "", "EMAIL ID": ""},
            {"SR #": 6, "COMPANY": "AL-NOOR ENTERPRISES (philips)", "ADDRESS": "STREET #9 SHOP#1 Bedon Road Lahore", "CONTACT #": "042-35912345, 3214424771", "CONTACT PERSON": "", "EMAIL ID": ""},
            {"SR #": 1, "COMPANY": "VIMAR(SWITCH PLATES)", "ADDRESS": "SUITE# 7, 2nd FLOOR, LEADS CENTRE, MAIN BOULEVARD, GULBERGIII, LAHORE", "CONTACT #": "3028434308, 3004834307", "CONTACT PERSON": "", "EMAIL ID": "info@switchplates.com"},
            {"SR #": 2, "COMPANY": "BUSH-PAKISTAN (PVT) LTD", "ADDRESS": "26, The Mall, LAHORE/DISPLAY CENTER AT BEDDEN ROAD", "CONTACT #": "042-35784051", "CONTACT PERSON": "MEHMOOD", "EMAIL ID": "http://saq27.fm.alibaba.com/"},
            {"SR #": 3, "COMPANY": "CLIPSAL", "ADDRESS": "DD BLOCK DHA LAHORE", "CONTACT #": "042-373244517, 3334771615", "CONTACT PERSON": "FAISAL Sb", "EMAIL ID": ""},
            {"SR #": 4, "COMPANY": "CLEVTRON LIGHTING CONTROL SYSTEM", "ADDRESS": "www.clevtron.com", "CONTACT #": "3218840063", "CONTACT PERSON": "ZEESHAN", "EMAIL ID": ""},
            {"SR #": 5, "COMPANY": "PIONEER ELECTRIC COMPANY", "ADDRESS": "E-547, Pari Mahal,Shahalam Market Lahore 54195 Pakistan", "CONTACT #": "042-37185717, 3018230900", "CONTACT PERSON": "RANA AKMAL", "EMAIL ID": "info@pioneerelectricco.com"},
            {"SR #": 6, "COMPANY": "THE CROWN ENGINEERING WORKS PVT. LTD", "ADDRESS": "Sheikhupura Rd, Qila Sattar Shah, Ferozewala", "CONTACT #": "042-37671178, 3334353015, 3004406349", "CONTACT PERSON": "", "EMAIL ID": ""},
            {"SR #": 7, "COMPANY": "INFINITE MERCANTILE INTERNATIONAL", "ADDRESS": "Street: 9-Bahawalpur road. Postal Code/Zip Code: 54001", "CONTACT #": "0300 8404278", "CONTACT PERSON": "Mr. Muhammad Younas", "EMAIL ID": ""},
            {"SR #": 8, "COMPANY": "INSTANT SHOP & DELIVERY", "ADDRESS": "Suit # 13, 4th floor Gold Mine Plaza, Shah Jamal, Lahore, Pakistan", "CONTACT #": "3214624286, 3218488463, 3219477283", "CONTACT PERSON": "Asif Munir", "EMAIL ID": "http://www.instantshop.pk/"},
            {"SR #": 9, "COMPANY": "Legrand", "ADDRESS": "Showroom, DHA", "CONTACT #": "3008266687", "CONTACT PERSON": "Masood", "EMAIL ID": ""},
            {"SR #": 1, "COMPANY": "FAST CABLES", "ADDRESS": "DHA", "CONTACT #": "3216076789", "CONTACT PERSON": "ADEEL RAHEEL", "EMAIL ID": ""},
            {"SR #": 2, "COMPANY": "NEWAGE CABLES PVT LTD", "ADDRESS": "NEWAGE HOUSE 33-K GULBERG II, LAHORE", "CONTACT #": "042-36669310", "CONTACT PERSON": "Wasif Ali Butt", "EMAIL ID": "info@newagecables.com.pk"},
            {"SR #": 3, "COMPANY": "UNIVERSAL CABLE INDUSTRIES LTD.", "ADDRESS": "61-C, ST 7th JAMIL COMMERCIAL, PHASE VII D.H.A. KARACHI", "CONTACT #": "042-35787640-41, 3244244656, 3008415805, 3344904774", "CONTACT PERSON": "SALMAN JAVAID", "EMAIL ID": "lahore@ucil.com.pk"},
            {"SR #": 4, "COMPANY": "ALLIED CABLES", "ADDRESS": "", "CONTACT #": "", "CONTACT PERSON": "", "EMAIL ID": ""},
            {"SR #": 1, "COMPANY": "ALLIED ENGINEERING PVT LTD.", "ADDRESS": "THOKAR NIAZ BAIG MULTAN ROAD", "CONTACT #": "042-37511621, 3214546444", "CONTACT PERSON": "", "EMAIL ID": ""},
            {"SR #": 2, "COMPANY": "MASTER FIXER TECHNICAL WORKS(SWITCH GEARS)", "ADDRESS": "OFFICE#4,2nd FLOOR CHAMAN ARCADE,WAPDA ROUNDABOUT LAHORE", "CONTACT #": "3018442671, 3224195304", "CONTACT PERSON": "NAJAM UL HUSSAIN", "EMAIL ID": "malik_najmal@yahoo.com"},
            {"SR #": 3, "COMPANY": "ACRO TECH(SWITCH GEAR AND SOALR)", "ADDRESS": "OFFICE# 10,3RD FLOOR,ALI TOWER, MM ALAM ROAD, GULBERG II, LAHORE", "CONTACT #": "042-111-579-579", "CONTACT PERSON": "RIZWAN SALEEM", "EMAIL ID": "saleslhr@acro.pk"},
            {"SR #": 1, "COMPANY": "UNI DUCT", "ADDRESS": "Z-5, 2ND FLOOR,COMMERCIAL AREA,PHASEIII DHA,LAHORE CANTT", "CONTACT #": "3311454575, 042-37024332", "CONTACT PERSON": "SALMAN JAVAID", "EMAIL ID": ""},
            {"SR #": 1, "COMPANY": "ICEBERG INDUSTRIES(LG)", "ADDRESS": "14,R-1 BLOCK M.A. JOHAR TOWN, LAHORE", "CONTACT #": "042-35275637, 042-35275639", "CONTACT PERSON": "RAQIB SHAHZAD(HVAC ENGR.)", "EMAIL ID": "raqib-shahzad@icebergindutries.net"},
            {"SR #": 2, "COMPANY": "ENPOWER ENGINEERING COMPANY(GENERATORS)", "ADDRESS": "55-N,GULBERGII,LAHORE", "CONTACT #": "042-35310110, 3312488967", "CONTACT PERSON": "", "EMAIL ID": "sales@enpowerservices.com"},
            {"SR #": 3, "COMPANY": "", "ADDRESS": "100/11,EXECUTIVE PLAZA MAIN BOULEVARD DHA, LAHORE", "CONTACT #": "3022512004", "CONTACT PERSON": "", "EMAIL ID": "info@nei.net.pk"},
        ],
        "Solar & Automation Vendors": [
            {"Sr No.": 1, "Vendor's Name": "Pantra Energy", "Contact Person": "Umer", "Products": "Solar", "Address": "", "Contact": "03000-563770"},
            {"Sr No.": 2, "Vendor's Name": "Sky Electric", "Contact Person": "Umair", "Products": "Solar", "Address": "", "Contact": "0305-8642190"},
            {"Sr No.": 3, "Vendor's Name": "Octave Technology", "Contact Person": "Hashim", "Products": "Solar", "Address": "", "Contact": "0313-1119966"},
            {"Sr No.": 4, "Vendor's Name": "Sync & Secure", "Contact Person": "Bilal", "Products": "Home Automation", "Address": "199-C, 2nd Floor, Phase 8, Commercial Broadway, DHA,", "Contact": "0305-5442145"},
            {"Sr No.": 5, "Vendor's Name": "HDL Home Automation", "Contact Person": "", "Products": "Home Automation", "Address": "48-T, First Floor ,(CCA) Lalik Chowk Phase II DHA Lahore", "Contact": "0303-0435435"},
            {"Sr No.": 6, "Vendor's Name": "Green Wave", "Contact Person": "", "Products": "Home Automation", "Address": "Suit 5 ,4 sher shah Block,Lahore Punjab", "Contact": ""},
            {"Sr No.": 7, "Vendor's Name": "Phoenix Groups of Compines", "Contact Person": "", "Products": "Home Automation", "Address": "KHI.SUK P&O Plaza I.I. Chunrigar Road Khi", "Contact": "021-111288288"},
            {"Sr No.": 8, "Vendor's Name": "Synergy Technologies", "Contact Person": "", "Products": "Home Automation", "Address": "39-A Block D-1 Gulberg III Lahore", "Contact": "042-111900111"},
            {"Sr No.": 9, "Vendor's Name": "Tera Generation Solutions Pvt. Ltd.", "Contact Person": "", "Products": "Home Automation", "Address": "7-A, P Block Block P Gulberg 2, Lahore, Punjab", "Contact": "(042) 111 847 111"}
        ],
    };
    
    return (
    <Card>
        <CardHeader><CardTitle>List of Approved Vendors</CardTitle></CardHeader>
        <CardContent>
             {Object.entries(vendors).map(([title, data]) => (
                <div key={title} className="mb-8">
                    <Subtitle>{title}</Subtitle>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {Object.keys(data[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row: any, i: number) => (
                                <TableRow key={i}>
                                    {Object.values(row).map((val: any, j: number) => <TableCell key={j}>{val}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}
        </CardContent>
    </Card>
)};
const Section18 = () => (
    <Card>
        <CardHeader><CardTitle>Time line Schedule</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <p><strong>Project:</strong> ________________________________________</p>
                    <p><strong>Architect:</strong> IH&SA</p>
                </div>
                <div className="flex justify-between">
                    <p><strong>(Name, Address)</strong> ________________________________________</p>
                    <p><strong>Architects Project No:</strong> ________</p>
                </div>
                <p><strong>Project Date:</strong> _______________</p>
            </div>
            <Table className="mt-4">
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
                    {[
                        { id: 1, name: "Project Initiation & Site Studies", isPhase: true },
                        { id: "", name: "Client Brief" },
                        { id: "", name: "Project Scope and Area Statements" },
                        { id: "", name: "Topographic / Preliminary Survey" },
                        { id: "", name: "Geotechnical Investigation and Report" },

                        { id: 2, name: "Concept Design Stage", isPhase: true },
                        { id: "", name: "Concept Design Development" },
                        { id: "", name: "Concept Plans and Supporting Drawings" },
                        { id: "", name: "Interior Design Concept Development" },
                        { id: "", name: "Finalization of Concept Design Report" },
                        { id: "", name: "Client Approval on Concept Design" },

                        { id: 3, name: "Preliminary Design Stage", isPhase: true },
                        { id: "", name: "Preliminary Design and Layout Plan – Cycle 1" },
                        { id: "", name: "Initial Engineering Coordination (Structural / MEP)" },
                        { id: "", name: "Layout Plan – Cycle 2 (Refined Based on Feedback)" },
                        { id: "", name: "Environmental Study (if applicable)" },
                        { id: "", name: "Authority Pre-Consultation / Coordination (LDA, CDA, etc.)" },
                        { id: "", name: "3D Model Development" },
                        { id: "", name: "Elevations and Sections" },
                        { id: "", name: "Preliminary Interior Layout" },
                        { id: "", name: "Preliminary Engineering Design" },
                        { id: "", name: "Finalization of Preliminary Design Report" },
                        { id: "", name: "Client Comments / Approval on Preliminary Design" },

                        { id: 4, name: "Authority Submission Stage", isPhase: true },
                        { id: "", name: "Preparation of Submission Drawings" },
                        { id: "", name: "Submission to LDA / CDA / Other Relevant Authority" },
                        { id: "", name: "Application for Stage-1 Approval" },
                        { id: "", name: "Authority Approval Process (Review, Comments, Compliance)" },
                        { id: "", name: "Receipt of Authority Approval (Stage-1)" },

                        { id: 5, name: "Detailed Design and Tender Preparation Stage", isPhase: true },
                        { id: "", name: "Detailed Architectural Design" },
                        { id: "", name: "Detailed Interior Layout" },
                        { id: "", name: "Detailed Engineering Designs (Structural / MEP)" },
                        { id: "", name: "Draft Conditions of Contract" },
                        { id: "", name: "Draft BOQs and Technical Specifications" },
                        { id: "", name: "Client Comments and Approvals on Detailed Design" },
                        { id: "", name: "Finalization of Detailed Design" },

                        { id: 6, name: "Construction Design and Tender Finalization Stage", isPhase: true },
                        { id: "", name: "Construction Design and Final Tender Preparation" },
                        { id: "", name: "Architectural Construction Drawings" },
                        { id: "", name: "Engineering Construction Drawings" },
                        { id: "", name: "Final Tender Documents" },
                        { id: "", name: "Client Comments / Approval on Final Tender Documents" },
                        { id: "", name: "Tender Documents Ready for Issue" },
                        
                        { id: 7, name: "Interior Design Development Stage", isPhase: true },
                        { id: "", name: "Final Interior Design Development" },
                        { id: "", name: "Interior Layout Working Details" },
                        { id: "", name: "Interior Thematic Mood Board and Color Scheme" },
                        { id: "", name: "Ceiling Detail Design Drawings" },
                        { id: "", name: "Built-in Feature Details" },
                        { id: "", name: "Partition and Pattern Detail Drawings" },
                        { id: "", name: "Draft Interior Design Tender" },
                        { id: "", name: "Client Comments / Approval on Interior Design Development" },
                        { id: "", name: "Client Comments / Approval on Interior Design Tender" },
                        { id: "", name: "Finalization of Interior Design Tender" },
                        
                        { id: 8, name: "Procurement & Appointment Stage", isPhase: true },
                        { id: "", name: "Procurement of Main Contractor" },
                        { id: "", name: "Contract Award / Mobilization" },
                    ].map((task, index) => (
                        <TableRow key={index} className={task.isPhase ? "bg-muted font-bold" : ""}>
                            <TableCell>{task.isPhase ? task.id : ''}</TableCell>
                            <TableCell className={!task.isPhase ? "pl-8" : ""}>{task.name}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);
const Section19 = () => (<Card><CardHeader><CardTitle>Project Application Summary</CardTitle></CardHeader>
<CardContent>
    <div className="space-y-4">
        <div className="flex justify-between">
            <FormField label="Application Number" value="" />
            <FormField label="Application Date" value="" />
        </div>
         <div className="flex justify-between">
            <FormField label="Period From" value="" />
            <FormField label="To" value="" />
        </div>
        <FormField label="Architect's Project No" value="" />
        <p>In tabulations below, amounts are stated to the nearest rupee.</p>
        <Table>
            <TableHeader><TableRow><TableHead>Contractor Name or Portion of Work</TableHead><TableHead>Totals this Page or all Pages</TableHead></TableRow></TableHeader>
            <TableBody>
                <TableRow><TableCell>A Original Contract Sum</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>B Net Change Orders to Date</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>C Contract Sum to Date</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>D Work In Place to Date</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>E Stored Materials (Not in D or I)</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>F Total Completed & Stored to Date (D+E)</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>G Retainage Percentage</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>H Retainage Amount</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>I Previous Payments</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>J Current Payment Due (F-H-I)</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>K Balance to Finish (C-E)</TableCell><TableCell></TableCell></TableRow>
                <TableRow><TableCell>L Percent Complete (F÷C)</TableCell><TableCell></TableCell></TableRow>
            </TableBody>
        </Table>
    </div>
</CardContent>
</Card>);
const Section20 = () => (<Card><CardHeader><CardTitle>Continuation Sheet</CardTitle></CardHeader>
<CardContent>
    <div className="flex justify-between">
        <FormField label="Application Number" value="" />
        <FormField label="Application Date" value="" />
    </div>
    <div className="flex justify-between">
        <FormField label="Period To" value="" />
        <FormField label="Architect's Project No" value="" />
    </div>
    <p>In tabulations below, amounts are stated to the nearest rupee. Use Column I on Contracts where variable retainage for line items may apply.</p>
    <Table>
        <TableHeader><TableRow><TableHead>A</TableHead><TableHead>B</TableHead><TableHead>C</TableHead><TableHead>D</TableHead><TableHead>E</TableHead><TableHead>F</TableHead><TableHead>G</TableHead><TableHead>H</TableHead><TableHead>I</TableHead></TableRow></TableHeader>
        <TableBody>
             <TableRow>
                <TableCell>Item No.</TableCell>
                <TableCell>Description of Work</TableCell>
                <TableCell>Scheduled Value</TableCell>
                <TableCell>From Previous Application (D+E)</TableCell>
                <TableCell>This Period</TableCell>
                <TableCell>Materials Presently Stored (not in D or E)</TableCell>
                <TableCell>Total Completed and Stored to Date (D+E+F)</TableCell>
                <TableCell>% (G÷C)</TableCell>
                <TableCell>Balance to Finish (C-G)</TableCell>
                <TableCell>Retain age</TableCell>
            </TableRow>
            {[...Array(10)].map((_, i) => (
                <TableRow key={i}><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            ))}
        </TableBody>
    </Table>
</CardContent>
</Card>);
const Section21 = () => (<Card><CardHeader><CardTitle>Construction Activity schedule</CardTitle></CardHeader><CardContent>...</CardContent></Card>);
const Section22 = () => (<Card><CardHeader><CardTitle>Preliminary Project Budget</CardTitle></CardHeader>
<CardContent>
    <div className="flex justify-between">
        <FormField label="Project" value="" />
        <FormField label="Job" value="" />
        <FormField label="Location" value="" />
        <FormField label="Gross Area" value="" />
    </div>
    <div className="flex justify-between">
        <FormField label="Project No" value="" />
        <FormField label="Rev. No" value="" />
        <FormField label="Prepared by" value="" />
        <FormField label="Rental Area" value="" />
        <FormField label="Efficiency" value=" %" />
    </div>
     <Table>
        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Rs. per sft. Gross Area</TableHead><TableHead>Total Rs.</TableHead></TableRow></TableHeader>
        <TableBody>
            <TableRow><TableCell>1. Site Work</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>2. Structural Frame</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>3. Exterior Finish</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>4. Interior Finish</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>5. Mechanical Vert. Transportation</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>6. Electrical Work</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>7. Heating, Ventilating, Air-conditioning</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>8. Plumbing</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>9. Fire Protection</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow className="font-bold"><TableCell>Basic Building Costs</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            
            <TableRow className="font-bold"><TableCell>Unusual Building Costs</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>10. Unusual Site Conditions</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>11. Unusual Soil Conditions</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>12. Off-Site Work</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>13. Provisions for Future Expansion</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>14. Special Equipment</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>15. Construction-Time Schedule</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>16. Type of Bidding and Contract</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            
            <TableRow className="font-bold"><TableCell>Additional Budget Items</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>17. Landscaping</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>18. Art and Sign Program</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>19. Tenant Allowances (standard)</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>20. Self-liquidation Items</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow className="font-bold bg-muted"><TableCell>Sub-Total</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>

            <TableRow className="font-bold"><TableCell>Owner's Budget Items</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>21. Professional Fees @270/Sqr.Ft</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>22. Surveys and Insurance Costs</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>23. Land Cost</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>24. Legal and Accounting Costs</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>25. Leasing and Advertising Costs</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>26. Financing Costs and Taxes</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>27. Promotion</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>28. Pre- Opening Expenses</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>29. Owner's Administration Costs</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>30. Concessions to Major Tenants (above standards)</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>

            <TableRow className="font-bold bg-muted"><TableCell>TOTAL PROJECT BUDGET</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>

        </TableBody>
    </Table>
</CardContent>
</Card>);
const Section23 = () => (
    <Card>
        <CardHeader>
            <CardTitle className="text-center">Bill Of Quantity</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sr. No</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount (Rs)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow><TableCell colSpan={6} className="font-bold">1 EXCAVATION</TableCell></TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Excavation for isolated, stripe/combined & Brick foundations in clay and sandy soil including cost of dressing, leveling and compaction in approved manners and disposal of surplus excavated soil away from site, all excavated area will be proof rolled as directed by the Consultant/Engineer incharge.</TableCell>
                        <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                    <TableRow><TableCell>Basement</TableCell><TableCell></TableCell><TableCell>C.FT</TableCell><TableCell>59,972</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>Ground Floor</TableCell><TableCell></TableCell><TableCell>C.FT</TableCell><TableCell>225</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    
                    <TableRow><TableCell colSpan={6} className="font-bold">2 BACK FILLING</TableCell></TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Back Filling including watering and compaction in layers not exceeding 150mm compacted thickness to dry Compaction Test (ASTM D-1557) upto 95% Modified AASHTO by using the borrowed local sand from the local nearby site, as directed by the Consultant/Engineer incharge</TableCell>
                        <TableCell>C.FT</TableCell><TableCell>12,000</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                    </TableRow>
                    
                     <TableRow><TableCell colSpan={6} className="font-bold">3 TERMITE PROOFING</TableCell></TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Providing and applying of Termite Control by spraying FMC Biflex or Mirage 5% SC by Ali Akbar Group in clear water under all floors, excavation including side walls and bottom of all pits & trenches, for footing and under floors.</TableCell>
                         <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                    <TableRow><TableCell>a Basement</TableCell><TableCell></TableCell><TableCell>S.ft</TableCell><TableCell>5,452</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>b Ground Floor</TableCell><TableCell></TableCell><TableCell>S.ft</TableCell><TableCell>6,222</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>c First Floor</TableCell><TableCell></TableCell><TableCell>S.ft</TableCell><TableCell>4,986</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    
                    <TableRow><TableCell colSpan={6} className="font-bold">4 PLAIN CEMENT CONCRETE UNDER FOUNDATIONS/FLOOR</TableCell></TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Providing and laying P.C.C plain cement concrete (1:4:8) using ordinary Portland cement chenab sand and Dina stone 1.5'' down as blinding layer under foundations/floor & swimming pool including confining, leveling, compacting and curing etc. complete in all respect finished smooth as directed by the Consultant/Engineer incharge.</TableCell>
                         <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                     <TableRow><TableCell>i Basement</TableCell><TableCell></TableCell><TableCell>C.FT</TableCell><TableCell>5,452</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>ii Column Foundation</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>125</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>

                    <TableRow><TableCell colSpan={6} className="font-bold">5 Water Stopper</TableCell></TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Providing and fixing of water stopper 4mm thick and 229 mm wide poly vinyl chloride ribbed bar by Marflex or approved equivalent installed in the centre of x-section of the concrete structure joint of retaining walls, water tanks and expansion joints complete in all respect as per drawings and as directed by the consultant / Engineer. (9" Decora)</TableCell>
                         <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                    <TableRow><TableCell>i Basement Wall</TableCell><TableCell></TableCell><TableCell>R.ft</TableCell><TableCell>525</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>ii O.H.W.T</TableCell><TableCell></TableCell><TableCell>R.ft</TableCell><TableCell>60</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>

                     <TableRow><TableCell colSpan={6} className="font-bold">6 Reinforced Cement Concrete Work (3000 Psi)</TableCell></TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Providing, laying, vibrating, compacting, finishing and curing etc. straight or curved, cast in situ reinforced cement concrete at any floor/height/depth, from ready mix plant, 3000 Psi minimum cylinder compressive strength at 28 days, mix using Ordinary Portland Grey Cement, fine aggregate (100% clean lawrence pur sand ) and sargodah crushed coarse aggregate 3/4'' down graded with approved quality admixture by Sika/Imporient or approved equivalent, including laying through pump, vibrating through electro mechanical vibrators, placing of all pipes and embedded items before concreting curing finishing complete but excluding the cost of steel reinforcement complete in all respect as per drawings and as directed by the Consultant/Engineer incharge</TableCell>
                         <TableCell>C.ft</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                    <TableRow><TableCell>6.1 Basement Retaining Walls</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>4,050</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.2 Basement Pool Walls</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,335</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.3 Basement Pool Base</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>473</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.4 Basement water body walls & Base</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>230</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.5 Basement Column Foundations</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,664</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.6 Basement Basement Coulumn</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>340</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.7 Basement Lintel</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>495</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.8 Basement Slab & Beam</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>4,224</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.9 Ground Floor Column Foundations</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>36</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.10 Ground Floor Coulumn</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>425</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.11 Ground Floor Lintel</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>375</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.12 Ground Floor Slab & Beam</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>4,800</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.13 First Floor Coulumn</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>375</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.14 First Floor Lintel</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>165</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.15 First Floor Slab & Beam</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>3,314</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.16 Baement to first Floor Stair</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>400</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.17 O.H.W.T Base and walls</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>583</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.18 U.G.W.T Base and walls</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>252</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>6.19 Septic Tank</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>185</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    
                    <TableRow><TableCell colSpan={6} className="font-bold">7 STEEL REINFORCEMENT</TableCell></TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Providing fabricating, laying, fixing, Mild Steel deformed bars (non-TMT) grade 60 with minimum yield stress conforming to ASTM specifications A-615. including cost of cutting, bending, placing, binded annealed binding wire 16 guage, removal of rest from bars if any, in specified overlaps, chairs, sports, spacers, wastage, etc. Complete in all respects by an approved source such as Afco steel, Prime steel, Ittefaq steel, Model Steel, City Steel UAE ( if not available, client will specify the alternate brand. Only the lengths shown on Drawings shall be paid for in accordance with the Bar bending schedule prepared the contractors from the drawings and submitted well in advance to the Engineer for the approval, steel lengths from the site multiply by the standard weights will used for the purpose of payment and duly approved by the consultant/Engineer Incharge.</TableCell>
                        <TableCell>Ton</TableCell><TableCell>75</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                    </TableRow>

                    <TableRow><TableCell colSpan={6} className="font-bold">8 Brick Work</TableCell></TableRow>
                    <TableRow>
                        <TableCell>8.1</TableCell>
                        <TableCell>Providing and laying first class burnt brick work 9"and above thickness to in cement sand mortar (1:5) including all scaffolding, racking out joints and making all flush or groove joints steel dowels at joints to masonry or columns, complete in all respects as per drawing, specifications, and or as directed by the Engineer</TableCell>
                        <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                     <TableRow><TableCell>8.1 Basement 9" Thick Wall</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>414</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.2 Basement 13.50" Thick Wall</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,384</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.3 Ground Floor 15" Thick Wall</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>900</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.4 Ground Floor 13.50" Thick Wall</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,814</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.5 Ground Floor 9" Thick Wall</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,206</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.6 First Floor 15" Thick Wall</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>825</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.7 First Floor 13.50" Thick Wall</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>354</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.8 First Floor 9" Thick Wall</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>2,175</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>

                     <TableRow>
                        <TableCell>8.2</TableCell>
                        <TableCell>Providing and laying first class burnt brick work 4½" thickness to in cement sand mortar (1:4) including all scaffolding, racking out joints and making all flush or groove joints steel dowels at joints to masonry or columns, complete in all respects as per drawing, specifications, and or as directed by the Engineer.</TableCell>
                        <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                    <TableRow><TableCell>8.2.1Basement Floor</TableCell><TableCell></TableCell><TableCell>S.ft</TableCell><TableCell>3,264</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.2.2Ground Floor</TableCell><TableCell></TableCell><TableCell>S.ft</TableCell><TableCell>960</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.2.3 First Floor</TableCell><TableCell></TableCell><TableCell>S.ft</TableCell><TableCell>528</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>8.2.4Boundary Wall</TableCell><TableCell></TableCell><TableCell>S.ft</TableCell><TableCell>3,960</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    
                    <TableRow><TableCell colSpan={6} className="font-bold">9 Plaster Work</TableCell></TableRow>
                    <TableRow>
                        <TableCell>9.1</TableCell>
                        <TableCell>Supply, mix, apply and cure Cement sand plaster of any height, includes making sharp corners, edges, grooves, all scaffolding. complete in all respects as per drawing, specifications, and or as directed by the Engineer.</TableCell>
                        <TableCell>S.ft</TableCell><TableCell>27,890</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                    </TableRow>

                    <TableRow><TableCell colSpan={6} className="font-bold">10 Brick Blast</TableCell></TableRow>
                    <TableRow><TableCell>10.1 Basement Floor</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,799</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>10.2 Ground Floor</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>2,053</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>10.3 First Floor</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,645</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>

                     <TableRow><TableCell colSpan={6} className="font-bold">11 PCC SUB FLOOR</TableCell></TableRow>
                     <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Cement Concrete (1:2:4), including placing, compacting, finishing and curing complete. (Screed Under Floor)</TableCell>
                         <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                    <TableRow><TableCell>11.1 Baement Floor</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,799</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>11.2 Ground Floor</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>2,053</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    <TableRow><TableCell>11.3 First Floor</TableCell><TableCell></TableCell><TableCell>C.ft</TableCell><TableCell>1,645</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>

                     <TableRow><TableCell colSpan={6} className="font-bold">12 Roof insulation and water proofing</TableCell></TableRow>
                     <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Providing and laying Roof insulation and water proofing to roof consisting of given below of as directed by the Engineer incharge. - Bituminous primer coat.- 2-coats of cold applied rubberized bitumen- One layer of polythene 500 gauge- 1½” thick "extruded polystyrene board" 1½" thick. (density 34 Kg/m³)- One layer of polythene 500 gauge- 4” thick average mud (compacted thickness).- Brick tiles 9”x4-1/2”x1-1/2” laid in cement sand mortar 1:4 and grouted with cement sand mortar 1:3 using 1-part of OPC and 3-parts of clean approved quality sand, complete as per drawings, specifications and instructions of the Consultant.</TableCell>
                        <TableCell>S.ft</TableCell><TableCell>6,561</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                    </TableRow>

                     <TableRow><TableCell colSpan={6} className="font-bold">13 D.P.C</TableCell></TableRow>
                     <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Supply, mix, place, cure, compact concrete (1:2:4) 1-1/2" horizontal damp proof course on brick masonry wall includes form work & mixing of rhombic 707 manufactured by MBT in concrete & application of one coat of same chemical on masonry surface before pouring of mixed concrete according to drawings and manufacturers instructions or As directed by the consultant.</TableCell>
                        <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                    </TableRow>
                    <TableRow><TableCell>i Ground Floor</TableCell><TableCell></TableCell><TableCell>S.ft</TableCell><TableCell>654</TableCell><TableCell>-</TableCell><TableCell>-</TableCell></TableRow>
                    
                    <TableRow className="font-bold"><TableCell colSpan={5}>TOTAL AMOUNT RS</TableCell><TableCell>-</TableCell></TableRow>
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);
const Section24 = () => (<Card><CardHeader><CardTitle>Rate Analysis</CardTitle></CardHeader>
<CardContent>
    <FormField label="DESCRIPTION OF ITEM" value="" />
    <FormField label="Item No." value="" />
    <FormField label="Specification of Item" value="" />
    <p>Detail Unit Rate per 100 SFT/CFT</p>
    <Table>
        <TableHeader><TableRow><TableHead>MATERIAL</TableHead><TableHead>Qty</TableHead><TableHead>Amount (Rs.)</TableHead></TableRow></TableHeader>
        <TableBody>
            {[...Array(5)].map((_, i) => <TableRow key={i}><TableCell>{i+1}</TableCell><TableCell>0.00</TableCell><TableCell>0.00</TableCell></TableRow>)}
            <TableRow><TableCell>6 Total</TableCell><TableCell></TableCell><TableCell>0.00</TableCell></TableRow>
            <TableRow><TableCell>7 Contractor's Profit, & Overheads</TableCell><TableCell>0.00%</TableCell><TableCell>0.00</TableCell></TableRow>
            <TableRow><TableCell>8 Tax</TableCell><TableCell>0.00%</TableCell><TableCell></TableCell></TableRow>
            <TableRow className="font-bold"><TableCell>9 Total</TableCell><TableCell></TableCell><TableCell>0.00</TableCell></TableRow>
        </TableBody>
    </Table>
     <Table>
        <TableHeader><TableRow><TableHead>LABOUR</TableHead><TableHead></TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
            {[...Array(4)].map((_, i) => <TableRow key={i}><TableCell>{i+1}</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
            <TableRow><TableCell>5 Contractor's Profit' & Overheads</TableCell><TableCell>0.00%</TableCell><TableCell>0.00</TableCell></TableRow>
            <TableRow><TableCell>6 Income Tax 7.50%</TableCell><TableCell>0.00%</TableCell><TableCell>0.00</TableCell></TableRow>
            <TableRow className="font-bold"><TableCell>7 Total</TableCell><TableCell></TableCell><TableCell>0.00</TableCell></TableRow>
        </TableBody>
    </Table>
    <div className="mt-4 space-y-2">
        <p>ITEM RATES</p>
        <p>Labour rate per 100 Cft / Sft Rs.- Say 0.00</p>
        <p>Composite rate per 100 Cft / Sft Rs.- Say 0.00</p>
        <p>Composite rate per Cum / Sq.m Rs.- Say 0.00</p>
    </div>
</CardContent>
</Card>);
const Section25 = () => (<Card><CardHeader><CardTitle>Change Order</CardTitle></CardHeader>
<CardContent>
     <div className="flex justify-between">
        <FormField label="Project" value="" />
        <FormField label="Field Report No." value="" />
    </div>
    <div className="flex justify-between">
        <FormField label="(Name, Address)" value="" />
        <FormField label="Date" value="" />
    </div>
     <div className="flex justify-between">
        <FormField label="Architects Project No" value="" />
        <FormField label="Contract For" value="" />
    </div>
     <div className="flex justify-between">
        <FormField label="To: (Contractor)" value="" />
        <FormField label="Contract Date" value="" />
    </div>
    <p>This Contract is change as follows:</p>
    <div className="h-32 border my-2"></div>
    <p>Not Valid until signed by the Owner, Architect and Contractor.</p>
    <div className="space-y-2 mt-4">
        <p>The original (Contract Sum) (Guaranteed Maximum Price) was  .......................................................... Rs. </p>
        <p>Net change by previously authorized Change Orders     .......................................................... Rs. </p>
        <p>The (Contract Sum) (Guaranteed Maximum Price) prior to this Change Order was ................................ Rs. </p>
        <p>The (Contract Sum) (Guaranteed Maximum Price) will be (increased) (decreased) (changed) by this Change Order in the amount of ......................................................... Rs. </p>
        <p>The new  (Contract Sum) (Guaranteed Maximum Price) including this Change Order will be ................... Rs. </p>
        <p>The Contract Time will be (increased) (decreased) by (_______) days. the date of Substantial Completion as the date of this Change Order therefore is: </p>
    </div>
     <p className="text-sm mt-4">NOTE: This summary does not reflect changes in the Contract Sum, Contract Time or Guaranteed Maximum Price which have been authorized by Contraction Change Directive. </p>
      <div className="flex justify-between mt-8">
        <div><p>Architect</p><p>Address</p><div className="mt-8">By</div></div>
        <div><p>Contractor</p><p>Address</p><div className="mt-8">By</div></div>
        <div><p>Owner</p><p>Address</p><div className="mt-8">By</div></div>
      </div>
</CardContent>
</Card>);
const Section26 = () => (<Card><CardHeader><CardTitle>Application & Certificates of Payments</CardTitle></CardHeader>
<CardContent className="space-y-8">
    <div className="border p-4 rounded-lg">
        <h3 className="text-xl font-bold text-center">PROJECT APPLICATION AND PROJECT CERTIFICATE FOR PAYMENT</h3>
        <FormField label="To (Owner)" value="" />
        <FormField label="Attention" value="" />
        <FormField label="Project" value="" />
        <FormField label="Construction Manager" value="" />
        <FormField label="Application Number" value="" />
        <FormField label="Period From" value="" />
        <FormField label="To" value="" />
        <FormField label="Architect's Project No" value="" />
        <p>Distributed to: Owner, Architect, Contractor Manager, Others</p>
        <div className="grid grid-cols-2 gap-8 mt-4">
            <div>
                <h4 className="font-bold">Project Application for Payment:</h4>
                <p>The undersigned Construction Manager certifies that the best of the Construction Manager's knowledge, information and belief Work covered by this Project Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractors for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.</p>
                <FormField label="Construction Manager: By:" value="" />
                <FormField label="Date" value="" />
                <p>Status of: Subscribed and sworn to before me this Day of: _________________</p>
                <FormField label="Notary Public" value="" />
                <FormField label="My Commission expires" value="" />
                <FormField label="County of" value="" />
            </div>
            <div>
                <p>Application is made for Payment, as shown below, in connection with the Project. Project Application Summary, is attached.</p>
                <p>The present status for the account for all Contractors is for this Project is as follows:</p>
                <Table>
                    <TableBody>
                        <TableRow><TableCell>Total Contract Sum (Item A Totals)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Total Net Changes by Change Order (Item B Totals)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Total Contract Sum to Date (Item C Totals)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Total Completed & Stored to Date (Item F Totals)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Retainage (Item H Totals)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Less Previous Totals Payments (Item I Total)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Current Payment Due (Item J Totals)</TableCell><TableCell></TableCell></TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
        <div>
            <h4 className="font-bold">Architect's Project Certificate for Payment:</h4>
            <p>In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.</p>
            <FormField label="Total of Amounts Certified" value="" />
            <p>(Attach explanation if amount certified differs from the amount applies for.)</p>
             <FormField label="Architect: By:" value="" />
            <FormField label="Date" value="" />
            <p className="text-xs mt-2">This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable on to the Contractors named in Contract Document attached. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.</p>
        </div>
    </div>
    <div className="border p-4 rounded-lg">
        <h3 className="text-xl font-bold text-center">APPLICATION AND CERTIFICATE FOR PAYMENT</h3>
        <div className="grid grid-cols-2 gap-8">
            <FormField label="To (Owner)" value="" />
            <FormField label="From (Contractor)" value="" />
            <FormField label="Contract For" value="" />
            <FormField label="Project" value="" />
            <FormField label="VIA (Architect)" value="" />
            <FormField label="Application Number" value="" />
            <FormField label="Period To" value="" />
            <FormField label="Architect's Project No" value="" />
            <FormField label="Contract Date" value="" />
        </div>
        <div className="grid grid-cols-2 gap-8 mt-4">
            <div>
                <h4 className="font-bold">Contractor's Application for Payment:</h4>
                <p>Application is made for Payment, as shown below, in connection with the Contract. Continuation Sheet, is attached.</p>
                <Table>
                    <TableBody>
                        <TableRow><TableCell>1. Original Contract Sum</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>2. Total Net Changes by Change Order</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>3. Total Contract Sum to Date (Line 1 ± 2)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>4. Total Completed & Stored to Date</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>5. Retainage: a. ____% of Completed Works, b. ____% of Stored Material</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>6. Total Earned Less Retainage (Line 4 Less 5 Total)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>7. Less Previous Certificates for Payments (Line 6)</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>8. Current Payment Due</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>9. Balance to Finish, Plus Retainage (Line 3 Less 6)</TableCell><TableCell></TableCell></TableRow>
                    </TableBody>
                </Table>
            </div>
             <div>
                <h4 className="font-bold">Change Order Summary</h4>
                <Table><TableHeader><TableRow><TableHead></TableHead><TableHead>ADDITIONS</TableHead><TableHead>DEDUCATION</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>Change Orders approved in previous monthly by Owner</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Approved this Month</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>TOTALS</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Net change by Change Orders</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
        <p className="mt-4">The undersigned Contractor certifies that the best of the Contractor's knowledge, information and belief the Work covered by this Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractor for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.</p>
        <FormField label="Contractor: By:" value="" /><FormField label="Date" value="" />
        <div className="mt-4">
            <h4 className="font-bold">Architect's Project Certificate for Payment:</h4>
            <p>In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.</p>
            <FormField label="Amounts Certified" value="" />
            <p>State of: __________ County of: __________ Subscribed and sworn to before me this ______ day of _______ ,20 ____</p>
             <FormField label="Notary Public" value="" /><FormField label="My Commission expires" value="" />
             <FormField label="Architect: By:" value="" /><FormField label="Date" value="" />
        </div>
    </div>
</CardContent>
</Card>);
const Section27 = () => (<Card><CardHeader><CardTitle>Instruction Sheet</CardTitle></CardHeader>
<CardContent>
    <div className="flex justify-between">
        <FormField label="Project" value="" />
        <FormField label="Field Report No." value="" />
    </div>
    <div className="flex justify-between">
        <FormField label="Contract" value="" />
        <FormField label="Architects Project No" value="" />
    </div>
    <div className="flex justify-between">
        <p>TO: Owner, Architect, Contractor, Field, Other</p>
        <p>BY: Owner, Architect, Contractor, Field, Other</p>
    </div>
    <Table>
        <TableHeader><TableRow><TableHead>Important Steps</TableHead><TableHead>Key Points</TableHead><TableHead>Reasons</TableHead></TableRow></TableHeader>
        <TableBody>
            <TableRow><TableCell>What?</TableCell><TableCell>How?</TableCell><TableCell>Why?</TableCell></TableRow>
            {[...Array(23)].map((_, i) => (
                <TableRow key={i}><TableCell>{i+1}</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            ))}
        </TableBody>
    </Table>
</CardContent>
</Card>);
const Section28 = () => (<Card><CardHeader><CardTitle>Certificate Substantial Summary</CardTitle></CardHeader><CardContent>...</CardContent></Card>);
const Section29 = () => (<Card><CardHeader><CardTitle>Other Provisions</CardTitle></CardHeader><CardContent>...</CardContent></Card>);
const Section30 = () => (<Card><CardHeader><CardTitle>Consent of Surety</CardTitle></CardHeader>
<CardContent className="space-y-8">
     <div className="border p-4 rounded-lg">
        <h3 className="text-xl font-bold text-center">CONSENT OF SURETY TO REDUCTION IN OR PARTIAL RELEASE OF RETAINAGE</h3>
         <div className="grid grid-cols-2 gap-4 my-4">
            <FormField label="Project" value="" />
            <FormField label="Architects Project No" value="" />
            <FormField label="Contract For" value="" />
            <FormField label="Contract Date" value="" />
        </div>
        <p>To: (Owner)</p>
        <p>In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the (here insert named and address of Surety as it appears in the bond).</p>
        <div className="h-10 border-b my-2"></div>
        <p>, SURETY,</p>
        <p>On bond of (here insert named and address of Contractor as it appears in the bond).</p>
        <div className="h-10 border-b my-2"></div>
        <p>, CONTRACTOR,</p>
        <p>Hereby approves the reduction in or partial release of retainage to the Contractor as follows:</p>
        <div className="h-20 border-b my-2"></div>
        <p>The Surety agrees that such reduction in or partial release of retainage to the Contractor shall not relieve the Surety of any of its obligations to (here insert named and address of Owner).</p>
        <div className="h-10 border-b my-2"></div>
        <p>, OWNER,</p>
        <p>As set forth in the said Surety's bond.</p>
        <p className="mt-4">In Witness Whereof, The Surety has hereunto set its hand this day of 20______</p>
         <div className="flex justify-between mt-8">
            <div><p>Attest: (Seal):</p></div>
            <div>
                <p>Surety:</p>
                <p>Signature of Authorized Representative:</p>
                <p>Title:</p>
            </div>
        </div>
    </div>
    <div className="border p-4 rounded-lg">
        <h3 className="text-xl font-bold text-center">CONSENT OF SURETY COMPANY TO FINAL PAYMENT</h3>
        <div className="grid grid-cols-2 gap-4 my-4">
            <FormField label="Project" value="" />
            <FormField label="Architects Project No" value="" />
            <FormField label="Contract For" value="" />
            <FormField label="Contract Date" value="" />
        </div>
        <p>To: (Owner)</p>
        <p>In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the (here insert named and address of Surety Company).</p>
        <div className="h-10 border-b my-2"></div>
        <p>, SURETY COMPANY,</p>
        <p>On bond of (here insert named and address of Contractor).</p>
        <div className="h-10 border-b my-2"></div>
        <p>, CONTRACTOR,</p>
        <p>Hereby approves the final payment to the Contractor, and agrees that final payment to the Contractor shall not relieve the Surety Company of any of its obligations to (here insert named and address of Owner):</p>
        <div className="h-10 border-b my-2"></div>
        <p>, OWNER,</p>
        <p>As set forth in the said Surety's bond.</p>
        <p className="mt-4">In Witness Whereof, The Surety has hereunto set its hand this day of 20______</p>
         <div className="flex justify-between mt-8">
            <div><p>Attest: (Seal):</p></div>
            <div>
                <p>Surety Company:</p>
                <p>Signature of Authorized Representative:</p>
                <p>Title:</p>
            </div>
        </div>
    </div>
</CardContent>
</Card>);
const Section31 = () => (<Card><CardHeader><CardTitle>Total Package of Project</CardTitle></CardHeader><CardContent>...</CardContent></Card>);
const Section32 = () => (<Card><CardHeader><CardTitle>Architects Supplemental Instructions</CardTitle></CardHeader>
<CardContent>
    <div className="flex justify-between">
        <FormField label="Project" value="" />
        <FormField label="Architect's Supplemental Instruction No." value="" />
    </div>
     <div className="flex justify-between">
        <FormField label="(Name, Address)" value="" />
        <FormField label="Date of Issuance" value="" />
    </div>
    <div className="flex justify-between">
        <FormField label="Contract For" value="" />
         <FormField label="Architects" value="" />
    </div>
     <div className="flex justify-between">
        <FormField label="Owner" value="" />
        <FormField label="Architects Project No" value="" />
    </div>
    <FormField label="To: (Contractor)" value="" />
    <p className="my-4">The Work shall be carried out in accordance with the following supplemental instructions issued in accordance with the contract Documents without change in Contract Sum or Contract Time. Prior to proceeding in accordance with these instructions, indicate you acceptance of these instructions for minor change to the Work as consistent with the Contract Documents and return a copy to the Architect.</p>
    <FormField label="Description" as="textarea" value="" />
    <FormField label="Attachments (Here insert listing of documents that support description.)" as="textarea" value="" />
    <div className="flex justify-between mt-8">
        <div><p>Issued:</p><p>By: _______________</p><p>Architect</p></div>
        <div><p>Accepted:</p><p>By: _______________</p><p>Contractor Date</p></div>
    </div>
</CardContent>
</Card>);
const Section33 = () => (<Card><CardHeader><CardTitle>Construction Change Director</CardTitle></CardHeader>
<CardContent>
    <div className="flex justify-between">
        <FormField label="Project" value="" />
        <FormField label="Directive No." value="" />
    </div>
     <div className="flex justify-between">
        <FormField label="(Name, Address)" value="" />
        <FormField label="Date" value="" />
    </div>
    <div className="flex justify-between">
        <FormField label="To Contractor" value="" />
         <FormField label="Architects Project No" value="" />
    </div>
     <div className="flex justify-between">
        <FormField label="(Name, Address)" value="" />
        <FormField label="Contract For" value="" />
    </div>
     <div className="flex justify-between">
        <FormField label="" value="" />
        <FormField label="Contract Date" value="" />
    </div>
    <p>You are hereby directed to make the following change(s) in this Contract:</p>
    <div className="h-32 border my-2"></div>
    <p className="font-bold my-4">Proposed Adjustments</p>
    <p>1. The proposed basis of adjustment to the Contract Sum or Guaranteed Maximum Price is:</p>
    <ul className="list-disc pl-5">
        <li>Lum Sum (increase) (decrease) of Rs. _________________________.</li>
        <li>Unit Price of Rs. ________________________ per __________________.</li>
        <li>as follows:</li>
    </ul>
     <p className="mt-4">2. The Contract Time is proposed to (be adjusted) (remain unchanged). The proposed adjustment, if any, is (an increase of ________________ days) (a decrease of ___________ days).</p>
    <p className="my-4">When signed by the Owner and Architect and received by the Contractor, this document becomes effective IMMEDIATELY as a Construction Change Directive (CCD) , and the Contractor shall proceed with the change(s) described above.</p>
    <p className="text-sm">Signature by the Contractor indicates the Contractor's agreement with the proposed adjustments in Contract Sum and Contract Time set forth in this Construction Change Directive.</p>
    <div className="flex justify-between mt-8">
        <div><p>Architect</p><p>Address</p><div className="mt-8">By</div></div>
        <div><p>Contractor</p><p>Address</p><div className="mt-8">By</div></div>
        <div><p>Owner</p><p>Address</p><div className="mt-8">By</div></div>
      </div>
</CardContent>
</Card>);


const SectionContent = ({ sectionId }: { sectionId: string }) => {
    switch (sectionId) {
        case 'section-1': return <Section1 />;
        case 'section-2': return <Section2 />;
        case 'section-3': return <Section3 />;
        case 'section-4': return <Section4 />;
        case 'section-5': return <Section5 />;
        case 'section-6': return <Section6 />;
        case 'section-7': return <Section7 />;
        case 'section-8': return <Section8 />;
        case 'section-9': return <Section9 />;
        case 'section-10': return <Section10 />;
        case 'section-11': return <Section11 />;
        case 'section-12': return <Section12 />;
        case 'section-13': return <Section13 />;
        case 'section-14': return <Section14 />;
        case 'section-15': return <Section15 />;
        case 'section-16': return <Section16 />;
        case 'section-17': return <Section17 />;
        case 'section-18': return <Section18 />;
        case 'section-19': return <Section19 />;
        case 'section-20': return <Section20 />;
        case 'section-21': return <Section21 />;
        case 'section-22': return <Section22 />;
        case 'section-23': return <Section23 />;
        case 'section-24': return <Section24 />;
        case 'section-25': return <Section25 />;
        case 'section-26': return <Section26 />;
        case 'section-27': return <Section27 />;
        case 'section-28': return <Section28 />;
        case 'section-29': return <Section29 />;
        case 'section-30': return <Section30 />;
        case 'section-31': return <Section31 />;
        case 'section-32': return <Section32 />;
        case 'section-33': return <Section33 />;
        default: return <Card><CardHeader><CardTitle>Select a section</CardTitle></CardHeader><CardContent>Select a section from the index to view its content.</CardContent></Card>;
    }
}

export default function BankBranchesPage() {
    const [activeSection, setActiveSection] = useState('section-1');

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6 no-print">
                <Button variant="outline" asChild>
                    <Link href="/"><ArrowLeft /> Back to Dashboard</Link>
                </Button>
                <h1 className="text-2xl font-bold">File Index</h1>
                <Button onClick={() => window.print()} variant="outline">
                    Download / Print
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <Card className="md:col-span-1 no-print">
                    <CardHeader>
                        <CardTitle>Index</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className='max-h-[calc(100vh-200px)]'>
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
                <div className="md:col-span-3 printable-card">
                   <SectionContent sectionId={activeSection} />
                </div>
            </div>
        </main>
    );
}