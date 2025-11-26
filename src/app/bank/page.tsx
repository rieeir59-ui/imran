

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

const Section10 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Proposal Request</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/proposal-request" className="text-primary underline">Proposal Request page</Link>.</p>
        </CardContent>
    </Card>
));
Section10.displayName = 'Section10';

const Section11 = React.memo(() => {
    return (
    <Card>
        <CardHeader>
            <CardTitle>Drawings (Architectural / Interiors / submission)</CardTitle>
        </CardHeader>
        <CardContent>
             <p>This form can be filled out on the <Link href="/drawings" className="text-primary underline">Drawings page</Link>.</p>
        </CardContent>
    </Card>
    );
});
Section11.displayName = 'Section11';

const Section12 = React.memo(() => {
    return (
    <Card>
        <CardHeader>
            <CardTitle>Shop Drawings Sample Record</CardTitle>
        </CardHeader>
        <CardContent>
             <p>This form can be filled out on the <Link href="/shop-drawings-record" className="text-primary underline">Shop Drawings Sample Record page</Link>.</p>
        </CardContent>
    </Card>
    );
});
Section12.displayName = 'Section12';

const Section13 = React.memo(() => (<Card><CardHeader><CardTitle>Project Chart (Studio)</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section13.displayName = 'Section13';

const Section14 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Architects Field Report / Transmittal Letter / Minutes of Meetings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p>Please use the links below to access the respective forms:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><Link href="/field-report" className="text-primary underline">Architect Field Report</Link></li>
                <li><Link href="/transmittal-letter" className="text-primary underline">Transmittal Letter</Link></li>
                <li><Link href="/minutes-of-meeting" className="text-primary underline">Minutes of the Meeting</Link></li>
            </ul>
        </CardContent>
    </Card>
));
Section14.displayName = 'Section14';

const Section15 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>List Of Sub consultants</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/sub-consultant-list" className="text-primary underline">List of Sub-consultants page</Link>.</p>
        </CardContent>
    </Card>
));
Section15.displayName = 'Section15';

const Section16 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>List of Contractors</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/contractor-list" className="text-primary underline">List of Contractors page</Link>.</p>
        </CardContent>
    </Card>
));
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

const Section19 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Project Application Summary</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/project-application-summary" className="text-primary underline">Project Application Summary page</Link>.</p>
        </CardContent>
    </Card>
));
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

const Section22 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Preliminary Project Budget</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/preliminary-project-budget" className="text-primary underline">Preliminary Project Budget page</Link>.</p>
        </CardContent>
    </Card>
));
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

  