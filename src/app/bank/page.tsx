
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

const Section17 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>List of Approved Vendors</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/vendor-list" className="text-primary underline">List of Approved Vendors page</Link>.</p>
        </CardContent>
    </Card>
));
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

const Section20 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Continuation Sheet</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/continuation-sheet" className="text-primary underline">Continuation Sheet page</Link>.</p>
        </CardContent>
    </Card>
));
Section20.displayName = 'Section20';

const Section21 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Construction Activity Schedule</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/construction-activity-schedule" className="text-primary underline">Construction Activity Schedule page</Link>.</p>
        </CardContent>
    </Card>
));
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


const Section24 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Rate Analysis</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/rate-analysis" className="text-primary underline">Rate Analysis page</Link>.</p>
        </CardContent>
    </Card>
));
Section24.displayName = 'Section24';

const Section25 = React.memo(() => {
    return (
        <Card>
            <CardHeader><CardTitle>Change Order</CardTitle></CardHeader>
            <CardContent>
                <p>This form can be filled out on the <Link href="/change-order" className="text-primary underline">Change Order page</Link>.</p>
            </CardContent>
        </Card>
    );
});
Section25.displayName = 'Section25';

const Section26 = React.memo(() => (
<Card>
    <CardHeader><CardTitle>Application and Certificate for Payment</CardTitle></CardHeader>
    <CardContent>
        <p>This form can be filled out on the <Link href="/application-for-payment" className="text-primary underline">Application for Payment page</Link>.</p>
    </CardContent>
</Card>));
Section26.displayName = 'Section26';

const Section27 = React.memo(() => (<Card><CardHeader><CardTitle>Instruction Sheet</CardTitle></CardHeader><CardContent><p>This form can be filled out on the <Link href="/instruction-sheet" className="text-primary underline">Instruction Sheet page</Link>.</p></CardContent></Card>));
Section27.displayName = 'Section27';

const Section28 = React.memo(() => (<Card><CardHeader><CardTitle>Certificate Substantial Summary</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section28.displayName = 'Section28';

const Section29 = React.memo(() => (<Card><CardHeader><CardTitle>Other Provisions</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section29.displayName = 'Section29';

const Section30 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Consent of Surety</CardTitle></CardHeader>
        <CardContent className="space-y-2">
            <p>This form can be filled out on the <Link href="/consent-of-surety" className="text-primary underline">Consent of Surety page</Link>.</p>
            <p>For final payment, see the <Link href="/consent-of-surety-final" className="text-primary underline">Consent of Surety to Final Payment page</Link>.</p>
        </CardContent>
    </Card>
));
Section30.displayName = 'Section30';

const Section31 = React.memo(() => (<Card><CardHeader><CardTitle>Total Package of Project</CardTitle></CardHeader><CardContent>...</CardContent></Card>));
Section31.displayName = 'Section31';

const Section32 = React.memo(() => (
    <Card>
        <CardHeader><CardTitle>Architects Supplemental Instructions</CardTitle></CardHeader>
        <CardContent>
            <p>This form can be filled out on the <Link href="/architects-supplemental-instructions" className="text-primary underline">Architects Supplemental Instructions page</Link>.</p>
        </CardContent>
    </Card>
));
Section32.displayName = 'Section32';

const Section33 = React.memo(() => (<Card><CardHeader><CardTitle>Construction Change Director</CardTitle></CardHeader><CardContent><p>This form can be filled out on the <Link href="/construction-change-directive" className="text-primary underline">Construction Change Directive page</Link>.</p></CardContent></Card>));
Section33.displayName = 'Section33';



const components: { [key: string]: React.FC } = {
  Section1, Section2, Section3, Section4, Section5, Section6, Section7, Section8, Section9, Section10, Section11, Section12, Section13, Section14, Section15, Section16, Section17, Section18, Section19, Section20, Section21, Section22, Section23, Section24, Section25, Section26, Section27, Section28, Section29, Section30, Section31, Section32, Section33
};

export default function BankPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    
    useEffect(() => {
        if (!isUserLoading && !user && auth) {
          initiateAnonymousSignIn(auth);
        }
    }, [isUserLoading, user, auth]);

    if(isUserLoading) {
        return <div className="p-8 text-center"><Loader2 className="animate-spin" /></div>
    }

    if(!user && !isUserLoading) {
         return (
       <main className="p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Unable to Authenticate</AlertTitle>
              <AlertDescription>We could not sign you in. Please refresh the page to try again.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
     )
    }

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
