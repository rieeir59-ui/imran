

'use client';

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Printer, Edit, Save, Loader2, Terminal, Download, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn, exportChecklistToPdf, exportServicesToPdf } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const PROJECT_CHECKLIST_DOC_ID = "project-checklist";
const PROJECT_DATA_DOC_ID = "main-project-data";
const PROJECT_AGREEMENT_DOC_ID = "project-agreement";
const PROJECT_APP_SUMMARY_DOC_ID = 'project-application-summary';
const PROJECT_SERVICES_DOC_ID = "project-services-checklist";
const CONTINUATION_SHEET_DOC_ID = 'continuation-sheet';
const CONSTRUCTION_SCHEDULE_DOC_ID = 'construction-activity-schedule';
const RATE_ANALYSIS_DOC_ID = 'rate-analysis';
const CHANGE_ORDER_DOC_ID = 'change-order';
const SITE_SURVEY_DOC_ID = 'site-survey';
const PROPOSAL_REQUEST_DOC_ID = 'proposal-request';
const DRAWING_SCHEDULE_DOC_ID = 'drawing-schedule';
const SHOP_DRAWING_RECORD_DOC_ID = 'shop-drawing-record';
const FIELD_REPORT_DOC_ID = 'field-report';
const TRANSMITTAL_LETTER_DOC_ID = 'transmittal-letter';
const MINUTES_OF_MEETING_DOC_ID = 'minutes-of-meeting';
const SUB_CONSULTANT_LIST_DOC_ID = 'sub-consultant-list';
const CONTRACTOR_LIST_DOC_ID = 'contractor-list';
const VENDOR_LIST_DOC_ID = 'vendor-list';


const fileIndexItems = [
    { no: 1, id: 'section-1', title: 'Project Checklist', component: 'Section1' },
    { no: 2, id: 'section-2', title: 'Project Information', component: 'Section2' },
    { no: 3, id: 'section-3', title: 'Predesign general assessment', component: 'Section3' },
    { no: 4, id: 'section-4', title: 'Project Data', component: 'Section4' },
    { no: 5, id: 'section-5', title: 'Project Agreement', component: 'Section5' },
    { no: 6, id: 'section-6', title: 'List of Services', component: 'Section6' },
    { no: 7, id: 'section-7', title: 'Requirement Performa (for Residential and Commercial Project)', component: 'Section7' },
    { no: 8, id: 'section-8', title: 'Site Survey', component: 'Section8' },
    { no: 9, id: 'section-9', title: 'Project Bylaws', component: 'Section9' },
    { no: 10, id: 'section-10', title: 'Proposal request', component: 'Section10' },
    { no: 11, id: 'section-11', title: 'Drawings (architectural/interior/submission)', component: 'Section11' },
    { no: 12, id: 'section-12', title: 'Shop Drawings Sample Record', component: 'Section12' },
    { no: 13, id: 'section-13', title: 'Project Chart (Studio)', component: 'Section13' },
    { no: 14, id: 'section-14', title: 'Architect field report/Transmittal letter/minutes of the meeting', component: 'Section14' },
    { no: 15, id: 'section-15', title: 'List Of Sub consultants', component: 'Section15' },
    { no: 16, id: 'section-16', title: 'List of Contractors', component: 'Section16' },
    { no: 17, id: 'section-17', title: 'List of approve vendors', component: 'Section17' },
    { no: 18, id: 'section-18', title: 'Time line Schedule', component: 'Section18' },
    { no: 19, id: 'section-19', title: 'Project Application Summary', component: 'Section19' },
    { no: 20, id: 'section-20', title: 'Continuation Sheet', component: 'Section20' },
    { no: 21, id: 'section-21', title: 'Construction Activity schedule', component: 'Section21' },
    { no: 22, id: 'section-22', title: 'Preliminary Project Budget', component: 'Section22' },
    { no: 23, id: 'section-23', title: 'Bill Of Quantity', component: 'Section23' },
    { no: 24, id: 'section-24', title: 'Rate Analysis', component: 'Section24' },
    { no: 25, id: 'section-25', title: 'Change Order', component: 'Section25' },
    { no: 26, id: 'section-26', title: 'Application and Certificate for Payment', component: 'Section26' },
    { no: 27, id: 'section-27', title: 'Instruction Sheet', component: 'Section27' },
    { no: 28, id: 'section-28', title: 'Certificate Substantial Summary', component: 'Section28' },
    { no: 29, id: 'section-29', title: 'Other Provisions', component: 'Section29' },
    { no: 30, id: 'section-30', title: 'Consent of Surety', component: 'Section30' },
    { no: 31, id: 'section-31', title: 'Total Package of Project', component: 'Section31' },
    { no: 32, id: 'section-32', title: 'Architects Supplemental Instructions', component: 'Section32' },
    { no: 33, id: 'section-33', title: 'Construction Change Director', component: 'Section33' },
];


const SectionTitle = ({ children, isEditing, checked, onCheckedChange, id }: { children: React.ReactNode, isEditing?: boolean, checked?: boolean, onCheckedChange?: (checked: boolean | 'indeterminate') => void, id?: string }) => (
    <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold mt-8 mb-4 pt-4 flex-grow">{children}</h2>
        {isEditing && id && (
            <div className="flex items-center gap-2 pt-4">
                <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
                <Label htmlFor={id}>Mark as Complete</Label>
            </div>
        )}
    </div>
);

const Subtitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
);

const FormField = ({ label, value, as, children, isEditing, onChange, name }: { label: string, value?: string, as?: 'textarea', children?: React.ReactNode, isEditing?: boolean, onChange?: (e: any) => void, name?: string }) => (
    <div className="flex flex-col space-y-1">
        <span className="font-semibold text-sm">{label}:</span>
        {isEditing ? (
            as === 'textarea' ? <Textarea name={name} value={value || ''} onChange={onChange} /> : <Input name={name} value={value || ''} onChange={onChange} />
        ) : children ? children : (
             <div className="border-b min-h-[24px] py-1">{value || ''}</div>
        )}
    </div>
);

const DrawingsList = React.memo(() => {
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
            <FormField label="Project" value="" />
            <div className="grid grid-cols-2 gap-4">
                <FormField label="(Name, Address)" value="" />
                <FormField label="Architects Project No" value="" />
                <FormField label="Date" value="" />
                <FormField label="Contract Date" value="" />
            </div>
            <FormField label="Project Incharge" value="" />

            <Table>
                <TableHeader><TableRow><TableHead>Serial No.</TableHead><TableHead>Drawings Title</TableHead><TableHead>Starting Date</TableHead><TableHead>Completion Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                <TableBody>
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Architectural Drawings</TableCell></TableRow>
                    {architecturalDrawings.map((item, i) => <TableRow key={`arch-${i}`}><TableCell>{i+1}</TableCell><TableCell>{item}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Details</TableCell></TableRow>
                    {details.map((item, i) => <TableRow key={`detail-${i}`}><TableCell>{i+17}</TableCell><TableCell>{item}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Structure Drawings</TableCell></TableRow>
                    {structureDrawings.map((item, i) => <TableRow key={`struct-${i}`}><TableCell>{i+22}</TableCell><TableCell>{item}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Plumbing Drawings</TableCell></TableRow>
                    {plumbingDrawings.map((item, i) => <TableRow key={`plumb-${i}`}><TableCell>{i+32}</TableCell><TableCell>{item}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Electrification Drawings</TableCell></TableRow>
                    {electrificationDrawings.map((item, i) => <TableRow key={`elec-${i}`}><TableCell>{i+40}</TableCell><TableCell>{item}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                </TableBody>
            </Table>

            <Separator className="my-8" />
            
            <div>
                <h3 className="text-xl font-bold mb-4 text-center">SAMPLE LIST</h3>
                 <div className='flex justify-between items-center'>
                    <p className="mb-2 text-center"><strong>List of drawings</strong></p>
                    <p className="mb-2 text-center"><strong>Working Drawings</strong></p>
                    <p className="mb-2"><strong>Draftsman Name:</strong> Mr. Adeel</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                    <Table>
                        <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Introduction (AR-01-AR-10)</TableCell></TableRow>
                            {sampleList1.slice(0,10).map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                            <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Working Layout Drawings (AR-11-AR-20)</TableCell></TableRow>
                            {sampleList1.slice(10,20).map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                             <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Elevation & Section Drawings (AR-21-AR-40)</TableCell></TableRow>
                            {sampleList1.slice(20).map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                    <Table>
                         <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Doors & Windows Drawings (AR-41-AR-80)</TableCell></TableRow>
                            {sampleList2.map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                    <Table>
                        <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                        <TableBody>
                             <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Stair, Step & Ramp Drawings (AR-81-AR-100)</TableCell></TableRow>
                            {sampleList3.slice(0,20).map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                            <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Bathroom Drawings (AR-101-AR-140)</TableCell></TableRow>
                            {sampleList3.slice(20).map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                     <Table>
                        <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Kitchen Drawings (AR-141-AR-160)</TableCell></TableRow>
                            {sampleList4.slice(0,20).map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                            <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Floor Pattern Drawings (AR-161-AR-180)</TableCell></TableRow>
                            {sampleList4.slice(20).map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                     <Table>
                        <TableHeader><TableRow><TableHead>Sr. no.</TableHead><TableHead>Description</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                        <TableBody>
                             <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Other Item Drawings (AR-181-AR-250)</TableCell></TableRow>
                            {sampleList5.map(item => <TableRow key={item.code}><TableCell>{item.code}</TableCell><TableCell>{item.desc}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
});
DrawingsList.displayName = 'DrawingsList';


const Section1 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Project Checklist</CardTitle></CardHeader>
        <CardContent>
             <p>This form can be filled out on the <Link href="/project-checklist" className="text-primary underline">Project Checklist page</Link>.</p>
        </CardContent>
    </Card>
));
Section1.displayName = 'Section1';

const Section2 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
        <CardContent>
             <p>This form can be filled out on the <Link href="/projects" className="text-primary underline">Project Information page</Link>.</p>
        </CardContent>
    </Card>
));
Section2.displayName = 'Section2';

const Section3 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Predesign general assessment</CardTitle></CardHeader>
        <CardContent>
             <p>This form can be filled out on the <Link href="/predesign-assessment" className="text-primary underline">Predesign Assessment page</Link>.</p>
        </CardContent>
    </Card>
));
Section3.displayName = 'Section3';

const Section4 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Project Data</CardTitle></CardHeader>
        <CardContent>
             <p>This form can be filled out on the <Link href="/project-data" className="text-primary underline">Project Data page</Link>.</p>
        </CardContent>
    </Card>
));
Section4.displayName = 'Section4';


const Section5 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Project Agreement</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/project-agreement" className="text-primary underline">Project Agreement page</Link>.</p>
        </CardContent>
    </Card>
));
Section5.displayName = 'Section5';

const Section6 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>List of Services</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/list-of-services" className="text-primary underline">List of Services page</Link>.</p>
        </CardContent>
    </Card>
));
Section6.displayName = 'Section6';

const Section7 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Requirement Performa</CardTitle></CardHeader>
        <CardContent>
             <p>This form can be filled out on the <Link href="/requirement-performa" className="text-primary underline">Requirement Performa page</Link>.</p>
        </CardContent>
    </Card>
));
Section7.displayName = 'Section7';

const Section8 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Site Survey</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/site-survey" className="text-primary underline">Site Survey page</Link>.</p>
        </CardContent>
    </Card>
));
Section8.displayName = 'Section8';


const Section9 = React.memo(() => (<Card><CardHeader><CardTitle>Project Bylaws</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section9.displayName = 'Section9';

const Section10 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/proposalRequests/${PROPOSAL_REQUEST_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSave = () => {
        if (!docRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Proposal Request saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'write',
                requestResourceData: formData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        let y = 15;

        const addField = (label: string, value: string, x: number, yPos: number, width: number) => {
            doc.text(`${label}: ${value || ''}`, x, yPos);
            doc.line(x + doc.getTextWidth(label) + 2, yPos + 1, x + width, yPos + 1);
        };

        const addTitle = (title: string) => {
            if (y > 260) { doc.addPage(); y = 15; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(30, 41, 59);
            doc.rect(14, y - 5, 182, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(title, 105, y, { align: 'center'});
            y += 8;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
        };
        
        addTitle("Proposal Request");
        y += 5;
    
        doc.setFontSize(10);
        addField('Project', formData.project || '', 14, y, 90);
        addField('Proposal Request No.', formData.proposal_no || '', 105, y, 90);
        y += 7;
    
        addField('(Name, Address)', formData.name_address || '', 14, y, 90);
        addField('Date', formData.date || '', 105, y, 90);
        y += 7;
    
        addField('Architects Project No', formData.architect_project_no || '', 14, y, 90);
        addField('Contract For', formData.contract_for || '', 105, y, 90);
        y += 7;
    
        addField('Owner', formData.owner || '', 14, y, 90);
        addField('Contract Date', formData.contract_date || '', 105, y, 90);
        y += 10;
    
        doc.rect(14, y, 182, 20);
        doc.text(`To: (Contractor) ${formData.to_contractor || ''}`, 16, y + 5);
        y += 25;
    
        doc.text('Description: (Written description of the Work)', 14, y);
        y += 5;
        const descText = doc.splitTextToSize(formData.description || '', 182);
        doc.rect(14, y, 182, 30);
        doc.text(descText, 16, y + 5);
        y += 35;
    
        doc.text('Attachments: (List attached documents that support description)', 14, y);
        y += 5;
        const attachText = doc.splitTextToSize(formData.attachments || '', 182);
        doc.rect(14, y, 182, 20);
        doc.text(attachText, 16, y + 5);
        y += 25;
    
        doc.text('Please submit an itemized quotation for changes in the Contract Sum and/or Time incidental to proposed modifications to the Contract Documents described herein.', 14, y);
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('THIS IS NOT A CHANGE ORDER NOR A DIRECTION TO PROCEED WITH THE WORK DESCRIBED HEREIN.', 105, y, { align: 'center' });
        y += 15;
    
        doc.setFont('helvetica', 'normal');
        doc.text(`Architect: ${formData.architect || ''}`, 14, y);
        y += 7;
        doc.text('By:', 14, y);
        y += 15;
    
        doc.text('Owner', 14, y);
        doc.text('Architect', 54, y);
        doc.text('Contractor', 94, y);
        doc.text('Field', 134, y);
        doc.text('Other', 174, y);

        doc.save("proposal-request.pdf");
        toast({ title: "Download Started", description: "PDF generation is in progress." });
    };

    const renderFormField = (name: string, placeholder?: string, as?: 'textarea') => {
        const value = formData[name] || '';
        if (isEditing) {
            return as === 'textarea' ?
                <Textarea name={name} value={value} onChange={handleInputChange} /> :
                <Input name={name} value={value} onChange={handleInputChange} />;
        }
        return <div className="border-b min-h-[24px] py-1">{value}</div>;
    };

    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Proposal Request</CardTitle>
            <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                {isEditing ? (
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <div><Label>Project</Label>{renderFormField('project')}</div>
                    <div><Label>Proposal Request No.</Label>{renderFormField('proposal_no')}</div>
                </div>
                 <div className="flex justify-between">
                    <div><Label>(Name, Address)</Label>{renderFormField('name_address')}</div>
                    <div><Label>Date</Label>{renderFormField('date')}</div>
                </div>
                 <div className="flex justify-between">
                    <div><Label>Architects Project No</Label>{renderFormField('architect_project_no')}</div>
                    <div><Label>Contract For</Label>{renderFormField('contract_for')}</div>
                </div>
                 <div className="flex justify-between">
                    <div><Label>Owner</Label>{renderFormField('owner')}</div>
                    <div><Label>Contract Date</Label>{renderFormField('contract_date')}</div>
                </div>

                <div className="border rounded-md p-4 space-y-2">
                    <div>To: (Contractor)</div>
                    {renderFormField('to_contractor')}
                </div>

                <div><Label>Description: (Written description of the Work)</Label>{renderFormField('description', '', 'textarea')}</div>
                <div><Label>Attachments: (List attached documents that support description)</Label>{renderFormField('attachments', '', 'textarea')}</div>
                
                <p>Please submit an itemized quotation for changes in the Contract Sum and/or Time incidental to proposed modifications to the Contract Documents described herein.</p>
                <p className="font-bold text-center">THIS IS NOT A CHANGE ORDER NOT A DIRECTION TO PROCEED WITH THE WORK DESCRIBED HEREIN.</p>
                
                <div className="flex justify-between items-end pt-8">
                    <div>
                        <p>Architect:</p>
                        {renderFormField('architect')}
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
});
Section10.displayName = 'Section10';

const Section11 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/drawingSchedules/${DRAWING_SCHEDULE_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Drawing schedule saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Drawings (Architectural / Interiors / submission)", 105, 15, { align: 'center' });
        
        autoTable(doc, {
          startY: 25,
          html: '#drawings-table',
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59] }
        })

        doc.save("drawings.pdf");
        toast({ title: "Download Started", description: "PDF generation is in progress." });
    };

    const renderField = (name: string) => isEditing ? <Input name={name} value={formData[name] || ''} onChange={handleInputChange} /> : <div className="border-b min-h-[24px] py-1">{formData[name] || ''}</div>;

    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Drawings (Architectural / Interiors / submission)</CardTitle>
             <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                {isEditing ? (
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <div id="drawings-table">
                <DrawingsList />
            </div>
        </CardContent>
    </Card>
    );
});
Section11.displayName = 'Section11';

const Section12 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ records: Array(12).fill({}).map((_, i) => ({ id: i + 1 })) });
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/shopDrawingRecords/${SHOP_DRAWING_RECORD_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const { name, value } = e.target;
        if(index !== undefined) {
            const newRecords = [...formData.records];
            newRecords[index] = {...newRecords[index], [name]: value};
            setFormData(prev => ({...prev, records: newRecords}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };

     const handleCheckboxChange = (index: number, name: string, checked: boolean | 'indeterminate') => {
        if (!isEditing || typeof checked !== 'boolean') return;
        const newRecords = [...formData.records];
        newRecords[index] = {...newRecords[index], [name]: checked};
        setFormData(prev => ({...prev, records: newRecords}));
    };

    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Shop Drawings Record saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("SHOP DRAWINGS & SAMPLE RECORD", 105, 15, { align: 'center'});
        
        autoTable(doc, {
            startY: 25,
            html: '#shop-drawings-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] },
        })

        doc.save("shop-drawings-record.pdf");
        toast({ title: "Download Started", description: "PDF generation is in progress." });
    };

    const renderField = (name: string, index?: number) => {
        const value = index !== undefined ? formData.records[index]?.[name] : formData[name];
        return isEditing ? <Input name={name} value={value || ''} onChange={(e) => handleInputChange(e, index)} /> : <div className="border-b min-h-[24px] py-1">{value || ''}</div>
    }

    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-center font-bold text-2xl">
                SHOP DRAWINGS<br />&<br />SAMPLE RECORD
            </CardTitle>
             <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                {isEditing ? (
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4" id="shop-drawings-table">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                    <FormField label="Project:">{renderField('project')}</FormField>
                    <FormField label="Architect's Project No:">{renderField('architectProjectNo')}</FormField>
                    <FormField label="Contractor:">{renderField('contractor')}</FormField>
                    <FormField label="Date:">{renderField('date')}</FormField>
                </div>
                <div className="border-t border-b py-2 my-2">
                    <FormField label="Spec. Section No.:">{renderField('specSectionNo')}</FormField>
                    <FormField label="Shop Drawing or Sample Drawing No.:">{renderField('drawingNo')}</FormField>
                </div>
                <div className="grid grid-cols-3 gap-x-8 gap-y-2 mb-4">
                    <FormField label="Contractor:">{renderField('contractor2')}</FormField>
                    <FormField label="Subcontractor:">{renderField('subcontractor')}</FormField>
                    <FormField label="Trade:">{renderField('trade')}</FormField>
                </div>
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
                        {formData.records.map((record: any, i: number) => (
                            <TableRow key={record.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{renderField('recordDate', i)}</TableCell>
                                <TableCell>{renderField('referredTo', i)}</TableCell>
                                <TableCell>{renderField('dateSent', i)}</TableCell>
                                <TableCell>{renderField('numCopies', i)}</TableCell>
                                <TableCell>{renderField('dateRetd', i)}</TableCell>
                                <TableCell className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1"><Checkbox id={`a${i}`} checked={record.approved} onCheckedChange={(c) => handleCheckboxChange(i, 'approved', c)} disabled={!isEditing}/> Approved</div>
                                    <div className="flex items-center gap-1"><Checkbox id={`an${i}`} checked={record.approvedAsNoted} onCheckedChange={(c) => handleCheckboxChange(i, 'approvedAsNoted', c)} disabled={!isEditing}/> App'd as Noted</div>
                                    <div className="flex items-center gap-1"><Checkbox id={`rr${i}`} checked={record.reviseResubmit} onCheckedChange={(c) => handleCheckboxChange(i, 'reviseResubmit', c)} disabled={!isEditing}/> Revise & Resubmit</div>
                                    <div className="flex items-center gap-1"><Checkbox id={`na${i}`} checked={record.notApproved} onCheckedChange={(c) => handleCheckboxChange(i, 'notApproved', c)} disabled={!isEditing}/> Not Approved</div>
                                </TableCell>
                                <TableCell className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1"><Checkbox id={`co${i}`} checked={record.copyContractor} onCheckedChange={(c) => handleCheckboxChange(i, 'copyContractor', c)} disabled={!isEditing}/> Contractor</div>
                                    <div className="flex items-center gap-1"><Checkbox id={`ow${i}`} checked={record.copyOwner} onCheckedChange={(c) => handleCheckboxChange(i, 'copyOwner', c)} disabled={!isEditing}/> Owner</div>
                                    <div className="flex items-center gap-1"><Checkbox id={`fi${i}`} checked={record.copyField} onCheckedChange={(c) => handleCheckboxChange(i, 'copyField', c)} disabled={!isEditing}/> Field</div>
                                    <div className="flex items-center gap-1"><Checkbox id={`f${i}`} checked={record.copyFile} onCheckedChange={(c) => handleCheckboxChange(i, 'copyFile', c)} disabled={!isEditing}/> File</div>
                                </TableCell>
                                <TableCell>{renderField('title', i)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
    )
});
Section12.displayName = 'Section12';

const Section13 = React.memo(() => (<Card><CardHeader><CardTitle>Project Chart (Studio)</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section13.displayName = 'Section13';

const Section14 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Architects Field Report / Transmittal Letter / Minutes of Meetings</CardTitle></CardHeader>
        <CardContent>
            <Accordion type="single" collapsible>
                <AccordionItem value="field-report">
                    <AccordionTrigger>Architect Field Report</AccordionTrigger>
                    <AccordionContent><FieldReportForm /></AccordionContent>
                </AccordionItem>
                <AccordionItem value="transmittal-letter">
                    <AccordionTrigger>Transmittal Letter</AccordionTrigger>
                    <AccordionContent><TransmittalLetterForm /></AccordionContent>
                </AccordionItem>
                <AccordionItem value="minutes-of-meeting">
                    <AccordionTrigger>Minutes of the Meeting</AccordionTrigger>
                    <AccordionContent><MinutesOfMeetingForm /></AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
));
Section14.displayName = 'Section14';


const FieldReportForm = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ items: Array(10).fill({}).map((_, i) => ({ id: i + 1 })) });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/fieldReports/${FIELD_REPORT_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormData(docSnap.data());
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const { name, value } = e.target;
        if (index !== undefined) {
            const newItems = [...formData.items];
            newItems[index] = { ...newItems[index], [name]: value };
            setFormData(prev => ({ ...prev, items: newItems }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Field Report saved." });
                setIsEditing(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Architect Field Report", 105, 15, { align: 'center'});
        autoTable(doc, {
          startY: 25,
          html: '#field-report-table',
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59] }
        })
        doc.save("architect-field-report.pdf");
        toast({ title: 'Download Started' });
    }
    
    const renderField = (name: string, placeholder?: string, index?: number) => {
        const value = index !== undefined ? formData.items[index]?.[name] : formData[name];
        return isEditing ? <Input name={name} value={value || ''} onChange={(e) => handleInputChange(e, index)} placeholder={placeholder} /> : <div className="p-1 border-b min-h-[24px]">{value}</div>;
    }
    
    if (isLoading || isUserLoading) return <div className="p-4"><Loader2 className="animate-spin"/></div>
    
    return (
        <div className="p-4 border rounded-md">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">Architect Field Report</h4>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                    {isEditing ? <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                </div>
            </div>
            <div id="field-report-table">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Project">{renderField('project')}</FormField>
                    <FormField label="Architect Project No.">{renderField('architectProjectNo')}</FormField>
                    <FormField label="Date">{renderField('date')}</FormField>
                    <FormField label="Weather">{renderField('weather')}</FormField>
                    <FormField label="Present at Site">{renderField('presentAtSite')}</FormField>
                    <FormField label="Report No.">{renderField('reportNo')}</FormField>
                </div>
                <Table className="mt-4">
                    <TableHeader><TableRow><TableHead>Item No.</TableHead><TableHead>Observations</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {formData.items.map((item: any, i: number) => <TableRow key={i}>
                            <TableCell className="w-24">{renderField('itemNo', 'Item No.', i)}</TableCell>
                            <TableCell>{renderField('observations', 'Observations', i)}</TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
});
FieldReportForm.displayName = 'FieldReportForm';

const TransmittalLetterForm = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/transmittalLetters/${TRANSMITTAL_LETTER_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormData(docSnap.data());
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}));

    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Transmittal Letter saved." });
                setIsEditing(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsSaving(false));
    };

     const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Transmittal Letter", 105, 15, { align: 'center'});
        autoTable(doc, {
            startY: 25,
            html: '#transmittal-letter-table',
            theme: 'plain',
        });
        doc.save("transmittal-letter.pdf");
        toast({ title: 'Download Started' });
    }

    const renderField = (name: string, placeholder?: string, as?: 'textarea') => {
        const value = formData[name] || '';
        if (isEditing) {
            if (as === 'textarea') {
                return <Textarea name={name} value={value} onChange={handleInputChange} placeholder={placeholder}/>
            }
            return <Input name={name} value={value} onChange={handleInputChange} placeholder={placeholder}/>
        }
        return <div className="p-1 border-b min-h-[24px] whitespace-pre-wrap">{value}</div>
    }

    if(isLoading || isUserLoading) return <div className="p-4"><Loader2 className="animate-spin"/></div>

    return (
        <div className="p-4 border rounded-md">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">Transmittal Letter</h4>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                    {isEditing ? <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                </div>
            </div>
            <div className="space-y-4" id="transmittal-letter-table">
                <FormField label="To">{renderField('to', 'Recipient Name and Address')}</FormField>
                <FormField label="Date">{renderField('date')}</FormField>
                <FormField label="Architects Project No.">{renderField('architectProjectNo')}</FormField>
                <FormField label="Re:">{renderField('re', 'Project Name and Address')}</FormField>
                <div>{renderField('body', 'Letter body...', 'textarea')}</div>
                <FormField label="Sincerely,">{renderField('sincerely')}</FormField>
                <FormField label="By">{renderField('by')}</FormField>
            </div>
        </div>
    );
});
TransmittalLetterForm.displayName = 'TransmittalLetterForm';

const MinutesOfMeetingForm = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ items: Array(5).fill({}).map((_, i) => ({ id: i + 1, no: '', description: '' })) });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/minutesOfMeetings/${MINUTES_OF_MEETING_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormData(docSnap.data());
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const { name, value } = e.target;
        if (index !== undefined) {
            const newItems = [...formData.items];
            newItems[index] = { ...newItems[index], [name]: value };
            setFormData(prev => ({ ...prev, items: newItems }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Minutes of meeting saved." });
                setIsEditing(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Minutes of the Meeting", 105, 15, { align: 'center'});
        autoTable(doc, {
            startY: 25,
            html: '#minutes-of-meeting-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        })
        doc.save("minutes-of-meeting.pdf");
        toast({ title: 'Download Started' });
    }

    const renderField = (name: string, placeholder?: string, index?: number) => {
        const value = index !== undefined ? formData.items[index]?.[name] : formData[name];
        return isEditing ? <Input name={name} value={value || ''} onChange={(e) => handleInputChange(e, index)} placeholder={placeholder} /> : <div className="p-1 border-b min-h-[24px]">{value}</div>;
    }
    
    if (isLoading || isUserLoading) return <div className="p-4"><Loader2 className="animate-spin"/></div>
    
    return (
        <div className="p-4 border rounded-md">
             <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">Minutes of the Meeting</h4>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                    {isEditing ? <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                </div>
            </div>
            <div id="minutes-of-meeting-table">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Project">{renderField('project')}</FormField>
                    <FormField label="Architects Project No.">{renderField('architectProjectNo')}</FormField>
                    <FormField label="Date">{renderField('date')}</FormField>
                    <FormField label="Time">{renderField('time')}</FormField>
                    <FormField label="Meeting No.">{renderField('meetingNo')}</FormField>
                    <FormField label="Present">{renderField('present')}</FormField>
                </div>
                <Table className="mt-4">
                    <TableHeader><TableRow><TableHead>Item No.</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {formData.items.map((item: any, i: number) => <TableRow key={i}>
                            <TableCell className="w-24">{renderField('no', '', i)}</TableCell>
                            <TableCell>{renderField('description', '', i)}</TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
});
MinutesOfMeetingForm.displayName = 'MinutesOfMeetingForm';

const Section15 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ rows: Array(15).fill({}).map((_, i) => ({ id: i })) });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/subConsultantList/${SUB_CONSULTANT_LIST_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormData(docSnap.data());
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const { name, value } = e.target;
        if (index !== undefined) {
            const newRows = [...formData.rows];
            newRows[index] = { ...newRows[index], [name]: value };
            setFormData(prev => ({ ...prev, rows: newRows }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Sub-consultant list saved." });
                setIsEditing(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsSaving(false));
    };
    
    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("List Of Sub consultants", 105, 15, {align: 'center'});
        autoTable(doc, {
            startY: 25,
            html: '#subconsultants-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        })
        doc.save("sub-consultant-list.pdf");
        toast({ title: 'Download Started' });
    }

    const renderCell = (name: string, index: number) => {
        const value = formData.rows[index]?.[name] || '';
        return isEditing ? <Input name={name} value={value} onChange={e => handleInputChange(e, index)} /> : <p className="p-1">{value}</p>;
    };

    const renderHeaderField = (name: string) => {
        return isEditing ? <Input name={name} value={formData[name] || ''} onChange={handleInputChange} /> : <div className="p-1 border-b min-h-[24px]">{formData[name]}</div>;
    }

    if (isLoading || isUserLoading) return <CardContent><Loader2 className="animate-spin"/></CardContent>

    return(
    <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>List Of Sub consultants</CardTitle>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                {isEditing ? <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
            </div>
        </CardHeader>
        <CardContent id="subconsultants-table">
             <FormField label="Project">{renderHeaderField('project')}</FormField>
            <FormField label="Architect">{renderHeaderField('architect')}</FormField>
            <FormField label="Architects Project No">{renderHeaderField('architectsProjectNo')}</FormField>
            <FormField label="Date">{renderHeaderField('date')}</FormField>
            <div className="border p-2 rounded mt-4">To: (Consultant) {renderHeaderField('toConsultant')}</div>
            <p className="my-4">List Sub-Consultants and others proposed to be employed on the above Project as required by the bidding documents. (To be filled out by the Contractor and returned to the Architect.)</p>
            <Table>
                <TableHeader><TableRow><TableHead>Work</TableHead><TableHead>Firm</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead>Representative</TableHead></TableRow></TableHeader>
                <TableBody>{formData.rows.map((row: any, i:number)=><TableRow key={row.id}>
                    <TableCell>{renderCell('work', i)}</TableCell>
                    <TableCell>{renderCell('firm', i)}</TableCell>
                    <TableCell>{renderCell('address', i)}</TableCell>
                    <TableCell>{renderCell('phone', i)}</TableCell>
                    <TableCell>{renderCell('representative', i)}</TableCell>
                </TableRow>)}</TableBody>
            </Table>
        </CardContent>
    </Card>
)});
Section15.displayName = 'Section15';

const Section16 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ rows: Array(15).fill({}).map((_, i) => ({ id: i })) });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/contractorList/${CONTRACTOR_LIST_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormData(docSnap.data());
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const { name, value } = e.target;
        if (index !== undefined) {
            const newRows = [...formData.rows];
            newRows[index] = { ...newRows[index], [name]: value };
            setFormData(prev => ({ ...prev, rows: newRows }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Contractor list saved." });
                setIsEditing(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("List of Contractors", 105, 15, {align: 'center'});
        autoTable(doc, {
            startY: 25,
            html: '#contractors-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        })
        doc.save("contractor-list.pdf");
        toast({ title: 'Download Started' });
    }

    const renderCell = (name: string, index: number) => {
        const value = formData.rows[index]?.[name] || '';
        return isEditing ? <Input name={name} value={value} onChange={e => handleInputChange(e, index)} /> : <p className="p-1">{value}</p>;
    };

    const renderHeaderField = (name: string) => {
        return isEditing ? <Input name={name} value={formData[name] || ''} onChange={handleInputChange} /> : <div className="p-1 border-b min-h-[24px]">{formData[name]}</div>;
    }

    if (isLoading || isUserLoading) return <CardContent><Loader2 className="animate-spin"/></CardContent>

    return (
     <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>List of Contractors</CardTitle>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                {isEditing ? <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
            </div>
        </CardHeader>
        <CardContent id="contractors-table">
            <FormField label="Project">{renderHeaderField('project')}</FormField>
            <FormField label="Architect">{renderHeaderField('architect')}</FormField>
            <FormField label="Architects Project No">{renderHeaderField('architectsProjectNo')}</FormField>
            <FormField label="Date">{renderHeaderField('date')}</FormField>
            <div className="border p-2 rounded mt-4">To: (Contractor) {renderHeaderField('toContractor')}</div>
            <p className="my-4">List Subcontractors and others proposed to be employed on the above Project as required by the bidding documents. (To be filled out by the Contractor and returned to the Architect.)</p>
            <Table>
                <TableHeader><TableRow><TableHead>Work</TableHead><TableHead>Firm</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead>Representative</TableHead></TableRow></TableHeader>
                <TableBody>{formData.rows.map((row: any, i: number)=><TableRow key={row.id}>
                    <TableCell>{renderCell('work', i)}</TableCell>
                    <TableCell>{renderCell('firm', i)}</TableCell>
                    <TableCell>{renderCell('address', i)}</TableCell>
                    <TableCell>{renderCell('phone', i)}</TableCell>
                    <TableCell>{renderCell('representative', i)}</TableCell>
                </TableRow>)}</TableBody>
            </Table>
        </CardContent>
    </Card>
)});
Section16.displayName = 'Section16';

const Section17 = React.memo(() => {
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
            {"Sr No.": 1, "Vendor's Name": "Shalimar Steel", "Contact Person": "", "Products": "Metal Support System", "Address": "40-A Pecco Road,Badami Bagh,Lahore", "Contact": "042-7283342,7284313"},
            {"Sr No.": 2, "Vendor's Name": "Izhar Steel", "Contact Person": "", "Products": "Metal Support System", "Address": "35-Tipu Block,New Garden Town Main Ferozepur Road", "Contact": "35888000-9"},
            {"Sr No.": 3, "Vendor's Name": "Pak Steel", "Contact Person": "", "Products": "Metal Support System", "Address": "Pakistan Steel Bin Qasim Karachi 75000", "Contact": "021-99264222,021-3750271"},
            {"Sr No.": 4, "Vendor's Name": "FF Steel", "Contact Person": "", "Products": "Metal Support System", "Address": "307/J, Block Commerical Area Near Bank of Punjab DHA Phase 12 EME Multan Road Lahore.", "Contact": "0334-4888999"},
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
            {"Sr No": 3, "Company Name": "Al-Fatah Toughened Glass Industries(pvt) Ltd", "Contact Person": "Tanveer Saeed", "Products": "Double Glazed Glass,Tempered Glass,Float Glass", "Address": "Office#411, 4th Floor,Alqadeer Heights,1-Babar Block New Garden Town,Lahore", "Contact": "0300/0302-8459142"},
            {"Sr No": 4, "Company Name": "Guardian Glass", "Contact Person": "", "Products": "Double Glazed Glass,Tempered Glass,Float Glass", "Address": "PLANT 13 KM SHEIKHUPURA ROAD, LAHORE, PAKISTAN", "Contact": ""},
            {"Sr No": 5, "Company Name": "Pilkington glass", "Contact Person": "", "Products": "Double Glazed Glass,Tempered Glass,Float Glass", "Address": "9 ROYAL PARK, NEAR HAMID CENTRE LAHORE-PAKISTAN", "Contact": ""}
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
            {"SR #": 1, "COMPANY": "ICEBERG INDUSTRIES(LG)", "ADDRESS": "14,R-1 BLOCK M.A. JOHAR TOWN, LAHore", "CONTACT #": "042-35275637, 042-35275639", "CONTACT PERSON": "RAQIB SHAHZAD(HVAC ENGR.)", "EMAIL ID": "raqib-shahzad@icebergindutries.net"},
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
            {"Sr No.": 9, "Vendor's Name": "Tera Generation Solutions Pvt. Ltd.", "Contact Person": "", "Products": "Home Automation", "Address": "7-A, P Block Block P Gulberg 2, Lahore, Punjab", "Contact": "(042) 111 847 111"},
        ],
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>List of Approved Vendors</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {Object.entries(vendors).map(([category, vendorList]) => (
                        <AccordionItem value={category} key={category}>
                            <AccordionTrigger>{category}</AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.keys(vendorList[0] || {}).map(header => <TableHead key={header}>{header}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vendorList.map((vendor, index) => (
                                            <TableRow key={index}>
                                                {Object.values(vendor).map((value, i) => <TableCell key={i}>{value as React.ReactNode}</TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
});
Section17.displayName = 'Section17';

const Section18 = React.memo(() => (<Card><CardHeader><CardTitle>Time line Schedule</CardTitle></CardHeader><CardContent>This form can be filled out on the <Link href="/project-timeline" className="text-primary underline">Project Timeline page</Link>.</CardContent></Card>));
Section18.displayName = 'Section18';

const Section19 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const appSummaryDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectData/${PROJECT_APP_SUMMARY_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!appSummaryDocRef) return;
        setIsLoading(true);
        getDoc(appSummaryDocRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
        }).finally(() => setIsLoading(false));
    }, [appSummaryDocRef, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!appSummaryDocRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(appSummaryDocRef, formData, { merge: true }).then(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast({ title: 'Success', description: 'Project Application Summary saved.' });
        }).catch(err => {
            console.error(err);
            setIsSaving(false);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
        });
    };

    const handleDownload = () => {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("PROJECT APPLICATION SUMMARY", 105, 15, { align: 'center'});
      let y = 30;
      
      const tableBody = [
          ["Application Number", formData.applicationNumber || ''],
          ["Application Date", formData.applicationDate || ''],
          ["Period From", formData.periodFrom || ''],
          ["To", formData.periodTo || ''],
          ["Architect's Project No", formData.architectsProjectNo || ''],
      ];

      autoTable(doc, {
          startY: y,
          body: tableBody,
          theme: 'plain',
      });
      
      y = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.text("In tabulations below, amounts are stated to the nearest rupee.", 14, y);
      y+= 5;

      const summaryBody = [
            ['A', 'Original Contract Sum', formData.originalContractSum || ''],
            ['B', 'Net Change Orders to Date', formData.netChangeOrders || ''],
            ['C', 'Contract Sum to Date', formData.contractSumToDate || ''],
            ['D', 'Work In Place to Date', formData.workInPlaceToDate || ''],
            ['E', 'Stored Materials (Not in D or I)', formData.storedMaterials || ''],
            ['F', 'Total Completed & Stored to Date (D+E)', formData.totalCompletedAndStored || ''],
            ['G', 'Retainage Percentage', formData.retainagePercentage || ''],
            ['H', 'Retainage Amount', formData.retainageAmount || ''],
            ['I', 'Previous Payments', formData.previousPayments || ''],
            ['J', 'Current Payment Due (F-H-I)', formData.currentPaymentDue || ''],
            ['K', 'Balance to Finish (C-E)', formData.balanceToFinish || ''],
            ['L', 'Percent Complete (F÷C)', formData.percentComplete || ''],
      ];

      autoTable(doc, {
        startY: y,
        head: [['', 'Item', 'Amount']],
        body: summaryBody,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        columnStyles: { 0: { fontStyle: 'bold' } }
      });
      doc.save("project-application-summary.pdf");
    };

    const renderField = (label: string, name: keyof typeof formData) => (
        <div className="flex justify-between items-center py-1">
            <Label htmlFor={name} className={cn(name.length === 1 && "font-bold")}>{label}</Label>
            {isEditing ? (
                <Input id={name} name={name} value={formData[name] || ''} onChange={handleInputChange} className="w-1/2" />
            ) : (
                <span className="w-1/2 text-right">{formData[name]}</span>
            )}
        </div>
    );
    
    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Application Summary</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                    {isEditing ? (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {renderField("Application Number:", "applicationNumber")}
                    {renderField("Application Date:", "applicationDate")}
                    {renderField("Period From:", "periodFrom")}
                    {renderField("To:", "periodTo")}
                    {renderField("Architect's Project No:", "architectsProjectNo")}
                    
                    <p className="text-sm text-muted-foreground pt-4">In tabulations below, amounts are stated to the nearest rupee.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 pt-4">
                        <div className="font-semibold">{renderField("Contractor Name", "contractorName")}</div>
                        <div className="font-semibold">{renderField("Totals this Page or all Pages", "totalsPage")}</div>
                        <div className="font-semibold">{renderField("Portion of Work", "portionOfWork")}</div>
                    </div>
                    
                    <Separator className="my-4"/>

                    {renderField("A. Original Contract Sum", "originalContractSum")}
                    {renderField("B. Net Change Orders to Date", "netChangeOrders")}
                    {renderField("C. Contract Sum to Date", "contractSumToDate")}
                    {renderField("D. Work In Place to Date", "workInPlaceToDate")}
                    {renderField("E. Stored Materials (Not in D or I)", "storedMaterials")}
                    {renderField("F. Total Completed & Stored to Date (D+E)", "totalCompletedAndStored")}
                    {renderField("G. Retainage Percentage", "retainagePercentage")}
                    {renderField("H. Retainage Amount", "retainageAmount")}
                    {renderField("I. Previous Payments", "previousPayments")}
                    {renderField("J. Current Payment Due (F-H-I)", "currentPaymentDue")}
                    {renderField("K. Balance to Finish (C-E)", "balanceToFinish")}
                    {renderField("L. Percent Complete (F÷C)", "percentComplete")}
                </div>
            </CardContent>
        </Card>
    );
});
Section19.displayName = 'Section19';

const Section20 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ rows: [] });

    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const continuationSheetDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectData/${CONTINUATION_SHEET_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!continuationSheetDocRef) return;
        setIsLoading(true);
        getDoc(continuationSheetDocRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data() || { rows: [] });
            } else {
                setFormData({ rows: [{ id: 1, itemNo: '', description: '', scheduledValue: '', workCompletedPrev: '', workCompletedThis: '', materialsStored: '', totalCompleted: '', percentage: '', balance: '', retainage: '' }] });
            }
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load continuation sheet data.' });
        }).finally(() => setIsLoading(false));
    }, [continuationSheetDocRef, toast]);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRowChange = (index: number, name: string, value: string) => {
        const newRows = [...formData.rows];
        newRows[index][name] = value;
        setFormData(prev => ({...prev, rows: newRows}));
    };
    
    const addRow = () => {
        const newId = formData.rows.length > 0 ? Math.max(...formData.rows.map((r: any) => r.id)) + 1 : 1;
        setFormData(prev => ({ ...prev, rows: [...prev.rows, { id: newId, itemNo: '', description: '', scheduledValue: '', workCompletedPrev: '', workCompletedThis: '', materialsStored: '', totalCompleted: '', percentage: '', balance: '', retainage: '' }] }));
    };

    const removeRow = (id: number) => {
        setFormData(prev => ({...prev, rows: prev.rows.filter((row: any) => row.id !== id)}));
    }

    const handleSave = () => {
        if (!continuationSheetDocRef) return;
        setIsSaving(true);
        setDoc(continuationSheetDocRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Continuation Sheet saved.' });
            setIsEditing(false);
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save sheet.' });
        }).finally(() => setIsSaving(false));
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Continuation Sheet", 14, 15);
        
        let y = 25;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Application Number: ${formData.applicationNumber || ''}`, 14, y);
        doc.text(`Application Date: ${formData.applicationDate || ''}`, 150, y);
        y+=7;
        doc.text(`Period To: ${formData.periodTo || ''}`, 14, y);
        doc.text(`Architect's Project No: ${formData.architectsProjectNo || ''}`, 150, y);
        y+=10;

        autoTable(doc, {
            startY: y,
            head: [['Item No.', 'Description of Work', 'Scheduled Value', 'Work Completed Prev', 'Work Completed This', 'Materials Stored', 'Total Completed', '%', 'Balance', 'Retainage']],
            body: formData.rows.map((row: any) => [row.itemNo, row.description, row.scheduledValue, row.workCompletedPrev, row.workCompletedThis, row.materialsStored, row.totalCompleted, row.percentage, row.balance, row.retainage]),
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1 },
            headStyles: { fillColor: [30, 41, 59] }
        });

        doc.save("continuation-sheet.pdf");
    };
    
    const renderCell = (rowIndex: number, fieldName: string) => {
      if (isEditing) {
        return <Input value={formData.rows[rowIndex][fieldName] || ''} onChange={(e) => handleRowChange(rowIndex, fieldName, e.target.value)} className="h-8" />;
      }
      return formData.rows[rowIndex][fieldName];
    }
    
    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Continuation Sheet</CardTitle>
                 <div className="flex gap-2">
                    <Button onClick={handleDownloadPdf} variant="outline"><Download /> PDF</Button>
                    {isEditing ? (
                        <>
                        <Button onClick={addRow} variant="outline"><PlusCircle/> Add Row</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                        </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <FormField label="Application Number:" name="applicationNumber" value={formData.applicationNumber} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Application Date:" name="applicationDate" value={formData.applicationDate} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Period To:" name="periodTo" value={formData.periodTo} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Architect's Project No:" name="architectsProjectNo" value={formData.architectsProjectNo} isEditing={isEditing} onChange={handleHeaderChange} />
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[80px]">Item No.</TableHead>
                                <TableHead className="min-w-[200px]">Description of Work</TableHead>
                                <TableHead className="min-w-[120px]">Scheduled Value</TableHead>
                                <TableHead className="min-w-[120px]">Work Completed Prev</TableHead>
                                <TableHead className="min-w-[120px]">Work Completed This</TableHead>
                                <TableHead className="min-w-[120px]">Materials Stored</TableHead>
                                <TableHead className="min-w-[120px]">Total Completed</TableHead>
                                <TableHead className="min-w-[60px]">%</TableHead>
                                <TableHead className="min-w-[120px]">Balance</TableHead>
                                <TableHead className="min-w-[120px]">Retainage</TableHead>
                                {isEditing && <TableHead></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.rows.map((row: any, index: number) => (
                                <TableRow key={row.id}>
                                    <TableCell>{renderCell(index, 'itemNo')}</TableCell>
                                    <TableCell>{renderCell(index, 'description')}</TableCell>
                                    <TableCell>{renderCell(index, 'scheduledValue')}</TableCell>
                                    <TableCell>{renderCell(index, 'workCompletedPrev')}</TableCell>
                                    <TableCell>{renderCell(index, 'workCompletedThis')}</TableCell>
                                    <TableCell>{renderCell(index, 'materialsStored')}</TableCell>
                                    <TableCell>{renderCell(index, 'totalCompleted')}</TableCell>
                                    <TableCell>{renderCell(index, 'percentage')}</TableCell>
                                    <TableCell>{renderCell(index, 'balance')}</TableCell>
                                    <TableCell>{renderCell(index, 'retainage')}</TableCell>
                                    {isEditing && <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
});
Section20.displayName = 'Section20';

const Section21 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ tasks: [] });

    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const scheduleDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectData/${CONSTRUCTION_SCHEDULE_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!scheduleDocRef) return;
        setIsLoading(true);
        getDoc(scheduleDocRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            } else {
                 setFormData({ tasks: [{ id: 1, code: '', task: '', duration: '', planStart: '', planFinish: '', actualStart: '', actualFinish: '', progress: '', variance: '', remarks: '' }] });
            }
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load schedule data.' });
        }).finally(() => setIsLoading(false));
    }, [scheduleDocRef, toast]);
    
    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTaskChange = (index: number, name: string, value: string) => {
        const newTasks = [...formData.tasks];
        newTasks[index][name] = value;
        setFormData(prev => ({...prev, tasks: newTasks}));
    };
    
    const addTask = () => {
        const newId = formData.tasks.length > 0 ? Math.max(...formData.tasks.map((t: any) => t.id)) + 1 : 1;
        setFormData(prev => ({ ...prev, tasks: [...prev.tasks, { id: newId, code: '', task: '', duration: '', planStart: '', planFinish: '', actualStart: '', actualFinish: '', progress: '', variance: '', remarks: '' }] }));
    };

    const removeTask = (id: number) => {
        setFormData(prev => ({...prev, tasks: prev.tasks.filter((task: any) => task.id !== id)}));
    }

    const handleSave = () => {
        if (!scheduleDocRef) return;
        setIsSaving(true);
        setDoc(scheduleDocRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Construction schedule saved.' });
            setIsEditing(false);
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save schedule.' });
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Construction Time Line", 14, 15);
        let y = 25;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Client: ${formData.client || ''}`, 14, y);
        doc.text(`Project: ${formData.project || ''}`, 80, y);
        doc.text(`Covered Area: ${formData.coveredArea || ''}`, 150, y);
        doc.text(`Location: ${formData.location || ''}`, 220, y);
        y+=7;
        doc.text(`Title: ${formData.title || ''}`, 14, y);
        doc.text(`Type: ${formData.type || ''}`, 80, y);
        doc.text(`Project Number: ${formData.projectNumber || ''}`, 150, y);
        doc.text(`Date: ${formData.date || ''}`, 220, y);
        y+=10;
        
        autoTable(doc, {
            startY: y,
            head: [['Sr.No/Code', 'Task', 'Duration', 'Plan Start', 'Plan Finish', 'Actual Start', 'Actual Finish', 'Progress', 'Variance Plan', 'Variance Actual', 'Remarks']],
            body: formData.tasks.map((task: any) => [task.code, task.task, task.duration, task.planStart, task.planFinish, task.actualStart, task.actualFinish, task.progress, task.variancePlan, task.varianceActual, task.remarks]),
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [30, 41, 59] }
        });

        doc.save("construction-activity-schedule.pdf");
    };
    
    const renderCell = (rowIndex: number, fieldName: string) => {
      if (isEditing) {
        return <Input value={formData.tasks[rowIndex][fieldName]} onChange={(e) => handleTaskChange(rowIndex, fieldName, e.target.value)} className="h-8" />;
      }
      return formData.tasks[rowIndex][fieldName];
    }
    
    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Construction Activity Schedule</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                    {isEditing ? (
                        <>
                        <Button onClick={addTask} variant="outline"><PlusCircle/> Add Task</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                        </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <h3 className="text-lg font-bold text-center">Construction Time Line</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                    <FormField label="Client" name="client" value={formData.client} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Title" name="title" value={formData.title} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Project" name="project" value={formData.project} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Type" name="type" value={formData.type} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Covered Area" name="coveredArea" value={formData.coveredArea} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Location" name="location" value={formData.location} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Project Number" name="projectNumber" value={formData.projectNumber} isEditing={isEditing} onChange={handleHeaderChange} />
                    <FormField label="Date" name="date" value={formData.date} isEditing={isEditing} onChange={handleHeaderChange} />
                </div>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sr.No/Code</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Plan Start</TableHead>
                            <TableHead>Plan Finish</TableHead>
                            <TableHead>Actual Start</TableHead>
                            <TableHead>Actual Finish</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Variance Plan</TableHead>
                            <TableHead>Variance Actual</TableHead>
                            <TableHead>Remarks</TableHead>
                            {isEditing && <TableHead></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {formData.tasks.map((task: any, index: number) => (
                            <TableRow key={task.id}>
                                <TableCell>{renderCell(index, 'code')}</TableCell>
                                <TableCell>{renderCell(index, 'task')}</TableCell>
                                <TableCell>{renderCell(index, 'duration')}</TableCell>
                                <TableCell>{renderCell(index, 'planStart')}</TableCell>
                                <TableCell>{renderCell(index, 'planFinish')}</TableCell>
                                <TableCell>{renderCell(index, 'actualStart')}</TableCell>
                                <TableCell>{renderCell(index, 'actualFinish')}</TableCell>
                                <TableCell>{renderCell(index, 'progress')}</TableCell>
                                <TableCell>{renderCell(index, 'variancePlan')}</TableCell>
                                <TableCell>{renderCell(index, 'varianceActual')}</TableCell>
                                <TableCell>{renderCell(index, 'remarks')}</TableCell>
                                {isEditing && <TableCell><Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
});
Section21.displayName = 'Section21';

const Section22 = React.memo(() => (<Card><CardHeader><CardTitle>Preliminary Project Budget</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section22.displayName = 'Section22';

const Section23 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Bill Of Quantity</CardTitle></CardHeader>
        <CardContent>
            <p>This form can now be filled out on the <Link href="/bill-of-quantity" className="text-primary underline">Bill of Quantity page</Link>.</p>
        </CardContent>
    </Card>
));
Section23.displayName = 'Section23';


const Section24 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({
        material: Array(5).fill({ description: '', amount: 0 }),
        labour: Array(4).fill({ description: '', amount: 0 }),
        materialProfitPercent: 0,
        materialTaxPercent: 0,
        labourProfitPercent: 0,
        labourTaxPercent: 7.5,
    });

    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/rateAnalysis/${RATE_ANALYSIS_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (section: 'material' | 'labour', index: number, field: 'description' | 'amount', value: any) => {
        if (!isEditing) return;
        const newSectionData = [...formData[section]];
        newSectionData[index] = { ...newSectionData[index], [field]: value };
        setFormData(prev => ({ ...prev, [section]: newSectionData }));
    };

    const handleOtherChange = (field: string, value: any) => {
        if(!isEditing) return;
        setFormData(prev => ({...prev, [field]: value}));
    }

    const calculateTotal = (section: 'material' | 'labour') => formData[section].reduce((acc: number, item: any) => acc + (parseFloat(item.amount) || 0), 0);

    const materialTotal = calculateTotal('material');
    const materialProfit = materialTotal * (parseFloat(formData.materialProfitPercent) / 100 || 0);
    const materialTax = (materialTotal + materialProfit) * (parseFloat(formData.materialTaxPercent) / 100 || 0);
    const materialGrandTotal = materialTotal + materialProfit + materialTax;

    const labourTotal = calculateTotal('labour');
    const labourProfit = labourTotal * (parseFloat(formData.labourProfitPercent) / 100 || 0);
    const labourTax = (labourTotal + labourProfit) * (parseFloat(formData.labourTaxPercent) / 100 || 0);
    const labourGrandTotal = labourTotal + labourProfit + labourTax;

    const handleSave = () => {
        if (!docRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Rate Analysis saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'write',
                requestResourceData: formData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Rate Analysis", 105, 15, { align: 'center'});
        
        autoTable(doc, {
            startY: 25,
            html: '#rate-analysis-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        })

        doc.save("rate-analysis.pdf");
    };

    const renderField = (value: any, onChange: (val: any) => void) => {
        return isEditing ? <Input value={value} onChange={e => onChange(e.target.value)} className="h-8" /> : <span>{value}</span>;
    }
    
    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Rate Analysis</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                    {isEditing ? (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
              <div id="rate-analysis-table">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div><Label>DESCRIPTION OF ITEM:</Label>{renderField(formData.description, (val: string) => handleOtherChange('description', val))}</div>
                    <div><Label>Item No.</Label>{renderField(formData.itemNo, (val: string) => handleOtherChange('itemNo', val))}</div>
                    <div><Label>Qty</Label>{renderField(formData.qty, (val: string) => handleOtherChange('qty', val))}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-lg mb-2">MATERIAL</h4>
                        {formData.material.map((item: any, index: number) => (
                            <div key={index} className="flex gap-2 mb-1">
                                {renderField(item.description, (val: string) => handleInputChange('material', index, 'description', val))}
                                {renderField(item.amount, (val: string) => handleInputChange('material', index, 'amount', val))}
                            </div>
                        ))}
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold"><span>Total</span><span>{materialTotal.toFixed(2)}</span></div>
                        <div className="flex items-center gap-2 mt-2">
                            <span>Contractor's Profit, & Overheads</span>
                            {isEditing ? <Input type="number" value={formData.materialProfitPercent} onChange={e => handleOtherChange('materialProfitPercent', e.target.value)} className="w-20 h-8" /> : <span>{formData.materialProfitPercent}%</span>}
                            <span>{materialProfit.toFixed(2)}</span>
                        </div>
                         <div className="flex items-center gap-2 mt-2">
                            <span>Tax</span>
                            {isEditing ? <Input type="number" value={formData.materialTaxPercent} onChange={e => handleOtherChange('materialTaxPercent', e.target.value)} className="w-20 h-8" /> : <span>{formData.materialTaxPercent}%</span>}
                            <span>{materialTax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold"><span>Total</span><span>{materialGrandTotal.toFixed(2)}</span></div>
                    </div>
                     <div>
                        <h4 className="font-bold text-lg mb-2">LABOUR</h4>
                        {formData.labour.map((item: any, index: number) => (
                            <div key={index} className="flex gap-2 mb-1">
                                {renderField(item.description, (val: string) => handleInputChange('labour', index, 'description', val))}
                                {renderField(item.amount, (val: string) => handleInputChange('labour', index, 'amount', val))}
                            </div>
                        ))}
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold"><span>Total</span><span>{labourTotal.toFixed(2)}</span></div>
                        <div className="flex items-center gap-2 mt-2">
                            <span>Contractor's Profit, & Overheads</span>
                            {isEditing ? <Input type="number" value={formData.labourProfitPercent} onChange={e => handleOtherChange('labourProfitPercent', e.target.value)} className="w-20 h-8" /> : <span>{formData.labourProfitPercent}%</span>}
                            <span>{labourProfit.toFixed(2)}</span>
                        </div>
                         <div className="flex items-center gap-2 mt-2">
                            <span>Income Tax</span>
                            {isEditing ? <Input type="number" value={formData.labourTaxPercent} onChange={e => handleOtherChange('labourTaxPercent', e.target.value)} className="w-20 h-8" /> : <span>{formData.labourTaxPercent}%</span>}
                            <span>{labourTax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold"><span>Total</span><span>{labourGrandTotal.toFixed(2)}</span></div>
                    </div>
                </div>
                 <div className="mt-8 border-t pt-4">
                    <h4 className="font-bold text-lg mb-2">ITEM RATES</h4>
                    <div className="space-y-2">
                       <div className="flex justify-between"><span>Labour rate per 100 Cft / Sft</span>{renderField(formData.labourRate, (val: string) => handleOtherChange('labourRate', val))}</div>
                       <div className="flex justify-between"><span>Composite rate per 100 Cft / Sft</span>{renderField(formData.compositeRate, (val: string) => handleOtherChange('compositeRate', val))}</div>
                       <div className="flex justify-between"><span>Composite rate per Cum / Sq.m</span>{renderField(formData.compositeRateM, (val: string) => handleOtherChange('compositeRateM', val))}</div>
                    </div>
                </div>
                <div className="mt-8 border-t pt-4">
                    <h4 className="font-bold text-lg mb-2">Specification of Item</h4>
                     {renderField(formData.specification, (val: string) => handleOtherChange('specification', val))}
                </div>
              </div>
            </CardContent>
        </Card>
    );
});
Section24.displayName = 'Section24';

const Section25 = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/changeOrders/${CHANGE_ORDER_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!docRef) {
             toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Change Order saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'write',
                requestResourceData: formData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("CHANGE ORDER", 105, 15, { align: 'center'});
        
        autoTable(doc, {
            startY: 25,
            html: '#change-order-table',
            theme: 'plain',
        });

        doc.save("change-order.pdf");
    };

    const renderField = (name: string, placeholder?: string, as?: 'textarea') => {
        const value = formData[name] || '';
        if (isEditing) {
            if (as === 'textarea') {
                return <Textarea name={name} value={value} onChange={handleInputChange} placeholder={placeholder} />;
            }
            return <Input name={name} value={value} onChange={handleInputChange} placeholder={placeholder} />;
        }
        return <div className="p-2 border-b min-h-[36px]">{value}</div>;
    };
    
    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Change Order</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                    {isEditing ? (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4" id="change-order-table">
                 <div className="grid grid-cols-2 gap-4">
                    <div><Label>Project:</Label>{renderField('project_name_address', '(Name, Address)')}</div>
                    <div><Label>Field Report No.:</Label>{renderField('field_report_no')}</div>
                    <div><Label>Architects Project No:</Label>{renderField('architect_project_no')}</div>
                    <div><Label>Date:</Label>{renderField('date')}</div>
                    <div><Label>To (Contractor):</Label>{renderField('to_contractor')}</div>
                    <div><Label>Contract For:</Label>{renderField('contract_for')}</div>
                    <div><Label>Contract Date:</Label>{renderField('contract_date')}</div>
                </div>

                <div>
                    <Label>This Contract is changed as follows:</Label>
                    {renderField('change_description', '', 'textarea')}
                </div>

                <div className="font-bold text-center">Not Valid until signed by the Owner, Architect and Contractor.</div>
                
                 <div className="space-y-2">
                    <div className="flex items-center gap-2"><div>The original (Contract Sum) (Guaranteed Maximum Price) was</div> {renderField('original_contract_sum', 'Rs.')}</div>
                    <div className="flex items-center gap-2"><div>Net change by previously authorized Change Orders</div> {renderField('net_change_orders', 'Rs.')}</div>
                    <div className="flex items-center gap-2"><div>The (Contract Sum) (Guaranteed Maximum Price) prior to this Change Order was</div> {renderField('contract_sum_prior', 'Rs.')}</div>
                    <div className="flex items-center gap-2"><div>The (Contract Sum) (Guaranteed Maximum Price) will be (increased) (decreased) (changed) by this Change Order in the amount of</div> {renderField('change_order_amount', 'Rs.')}</div>
                    <div className="flex items-center gap-2"><div>The new (Contract Sum) (Guaranteed Maximum Price) including this Change Order will be</div> {renderField('new_contract_sum', 'Rs.')}</div>
                    <div className="flex items-center gap-2"><div>The Contract Time will be (increased) (decreased) by</div> {renderField('contract_time_change', '(_______) days')}</div>
                    <div className="flex items-center gap-2"><div>the date of Substantial Completion as the date of this Change Order therefore is:</div> {renderField('substantial_completion_date')}</div>
                </div>
                
                <div className="text-xs text-center">NOTE: This summary does not reflect changes in the Contract Sum, Contract Time or Guaranteed Maximum Price which have been authorized by Contraction Change Directive.</div>
                
                <div className="grid grid-cols-3 gap-8 pt-8">
                    <div><Label>Architect</Label>{renderField('architect_signature_address', 'Address')}{renderField('architect_by', 'By')}{renderField('architect_date', 'Date')}</div>
                    <div><Label>Contractor</Label>{renderField('contractor_signature_address', 'Address')}{renderField('contractor_by', 'By')}{renderField('contractor_date', 'Date')}</div>
                    <div><Label>Owner</Label>{renderField('owner_signature_address', 'Address')}{renderField('owner_by', 'By')}{renderField('owner_date', 'Date')}</div>
                </div>
                <div className="flex justify-end gap-4 text-xs pt-4">
                    <span>Owner</span><span>Architect</span><span>Contractor</span><span>Field</span><span>Other</span>
                </div>
            </CardContent>
        </Card>
    );
});
Section25.displayName = 'Section25';

const Section26 = React.memo(() => (<Card><CardHeader><CardTitle>Application and Certificate for Payment</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section26.displayName = 'Section26';

const Section27 = React.memo(() => (<Card><CardHeader><CardTitle>Instruction Sheet</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section27.displayName = 'Section27';

const Section28 = React.memo(() => (<Card><CardHeader><CardTitle>Certificate Substantial Summary</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section28.displayName = 'Section28';

const Section29 = React.memo(() => (<Card><CardHeader><CardTitle>Other Provisions</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section29.displayName = 'Section29';

const Section30 = React.memo(() => (<Card><CardHeader><CardTitle>Consent of Surety</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section30.displayName = 'Section30';

const Section31 = React.memo(() => (<Card><CardHeader><CardTitle>Total Package of Project</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section31.displayName = 'Section31';

const Section32 = React.memo(() => (<Card><CardHeader><CardTitle>Architects Supplemental Instructions</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section32.displayName = 'Section32';

const Section33 = React.memo(() => (<Card><CardHeader><CardTitle>Construction Change Director</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section33.displayName = 'Section33';



const components: { [key: string]: React.FC } = {
  Section1, Section2, Section3, Section4, Section5, Section6, Section7, Section8, Section9, Section10, Section11, Section12, Section13, Section14, Section15, Section16, Section17, Section18, Section19, Section20, Section21, Section22, Section23, Section24, Section25, Section26, Section27, Section28, Section29, Section30, Section31, Section32, Section33
};

export default function BankPage() {
    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>File Index</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {fileIndexItems.map(item => (
                                    <li key={item.id}>
                                        <a href={`#${item.id}`} className="hover:text-primary transition-colors">
                                            {item.no}. {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-12 lg:col-span-9 space-y-8">
                    {fileIndexItems.map(item => {
                        const Component = components[item.component];
                        return (
                            <section id={item.id} key={item.id}>
                                {Component ? <Component /> : <Card><CardHeader><CardTitle>{item.title}</CardTitle></CardHeader><CardContent>...</CardContent></Card>}
                            </section>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
