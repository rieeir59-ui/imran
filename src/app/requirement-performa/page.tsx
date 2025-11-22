

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Edit, Save, Loader2, Download, ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const REQUIREMENT_PERFORMA_DOC_ID = 'requirement-performa';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <>
      <h3 className="text-lg font-semibold mt-6 mb-3">{children}</h3>
      <Separator className="mb-4" />
    </>
  );

const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
<div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
    <Label className="md:text-right">{label}</Label>
    <div className="md:col-span-2">{children}</div>
</div>
);

const RequirementPerformaPage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/requirementPerformas/${REQUIREMENT_PERFORMA_DOC_ID}`);
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
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
      if (typeof checked === 'boolean') {
          setFormData((prev: any) => ({ ...prev, [name]: checked }));
      }
    };
    
    const handleSave = () => {
        if (!docRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Requirement Performa saved.' });
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
    
        doc.setFontSize(16);
        doc.text("Requirement Performa", 105, y, { align: 'center' });
        y += 10;
    
        const addSection = (title: string, data: (string|string[])[][]) => {
            if (y > 250) {
                doc.addPage();
                y = 15;
            }
            autoTable(doc, {
                startY: y,
                head: [[title]],
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                body: data,
                theme: 'grid',
                columnStyles: { 0: { fontStyle: 'bold' } },
            });
            y = (doc as any).lastAutoTable.finalY + 10;
        }

        const projectDetails = [
            ["Project", formData.project_name || ''],
            ["Address", formData.project_address || ''],
            ["Project No", formData.project_no || ''],
            ["Prepared By", formData.prepared_by || ''],
            ["Prepared Date", formData.prepared_date || ''],
        ];
        addSection("Project Details", projectDetails);

        const ownerDetails = [
            ["Full Name", formData.owner_name || ''],
            ["Address (Office)", formData.owner_office_address || ''],
            ["Address (Res.)", formData.owner_res_address || ''],
            ["Phone (Office)", formData.owner_office_phone || ''],
            ["Phone (Res.)", formData.owner_res_phone || ''],
            ["Owner's Project Representative Name", formData.owner_rep_name || ''],
            ["Address (Office)", formData.owner_rep_office_address || ''],
            ["Address (Res.)", formData.owner_rep_res_address || ''],
            ["Phone (Office)", formData.owner_rep_office_phone || ''],
            ["Phone (Res.)", formData.owner_rep_res_phone || ''],
        ];
        addSection("About Owner", ownerDetails);
        
        const aboutProjectDetails = [
            ["Address", formData.project_about_address || ''],
            ["Project Reqt.", [
                `[${formData.req_architectural ? '✓' : ' '}] Architectural Designing`,
                `[${formData.req_interior ? '✓' : ' '}] Interior Decoration`,
                `[${formData.req_landscaping ? '✓' : ' '}] Landscaping`,
                `[${formData.req_turnkey ? '✓' : ' '}] Turnkey`,
                `[${formData.req_other ? '✓' : ' '}] Other`
            ].join('  ')],
            ["Project Type", `[${formData.type_commercial ? '✓' : ' '}] Commercial  [${formData.type_residential ? '✓' : ' '}] Residential`],
            ["Project Status", [
                `[${formData.status_new ? '✓' : ' '}] New`,
                `[${formData.status_addition ? '✓' : ' '}] Addition`,
                `[${formData.status_rehab ? '✓' : ' '}] Rehabilitation/Renovation`
            ].join('  ')],
            ["Project Area", formData.project_area || ''],
            ["Special Requirements of Project", formData.project_special_reqs || ''],
            ["Project's Cost", [
                `[${formData.cost_architectural ? '✓' : ' '}] Architectural Designing`,
                `[${formData.cost_interior ? '✓' : ' '}] Interior Decoration`,
                `[${formData.cost_landscaping ? '✓' : ' '}] Landscaping`,
                `[${formData.cost_construction ? '✓' : ' '}] Construction`,
                `[${formData.cost_turnkey ? '✓' : ' '}] Turnkey`,
                `[${formData.cost_other ? '✓' : ' '}] Other`,
            ].join('  ')],
            ["First Information about Project", formData.date_first_info || ''],
            ["First Meeting", formData.date_first_meeting || ''],
            ["First Working on Project", formData.date_first_working || ''],
            ["First Proposal", `Start: ${formData.date_proposal1_start || ''}  Completion: ${formData.date_proposal1_completion || ''}`],
            ["Second Proposal", `Start: ${formData.date_proposal2_start || ''}  Completion: ${formData.date_proposal2_completion || ''}`],
            ["Working on Finalized Proposal", formData.date_final_proposal || ''],
            ["Revised Presentation", formData.date_revised_presentation || ''],
            ["Quotation", formData.date_quotation || ''],
            ["Drawings", `Start: ${formData.date_drawings_start || ''}  Completion: ${formData.date_drawings_completion || ''}`],
            ["Other Major Projects Milestone Dates", formData.date_other_milestones || ''],
        ];
        addSection("About Project", aboutProjectDetails);

        const providedByOwnerDetails = [
            [`[${formData.provided_program ? '✓' : ' '}] Program`, ''],
            [`[${formData.provided_schedule ? '✓' : ' '}] Suggested Schedule`, ''],
            [`[${formData.provided_legal ? '✓' : ' '}] Legal Site Description & Other Concerned Documents`, ''],
            [`[${formData.provided_survey ? '✓' : ' '}] Land Survey Report`, ''],
            [`[${formData.provided_geo ? '✓' : ' '}] Geo-Technical, Tests and Other Site Information`, ''],
            [`[${formData.provided_drawings ? '✓' : ' '}] Existing Structure's Drawings`, ''],
        ];
        addSection("Provided by Owner", providedByOwnerDetails);

        const compensationDetails = [
            ["Initial Payment", formData.comp_initial_payment || ''],
            ["Basic Services (% of Cost of Construction)", formData.comp_basic_services_pct || ''],
            [{content: "Breakdown by Phase:", styles: {fontStyle: 'bold', halign: 'center', fillColor: '#f8f9fa'}} , ''],
            ["Schematic Design %", formData.comp_schematic_pct || ''],
            ["Design Development %", formData.comp_dev_pct || ''],
            ["Construction Doc's %", formData.comp_docs_pct || ''],
            ["Bidding / Negotiation %", formData.comp_bidding_pct || ''],
            ["Construction Contract Admin %", formData.comp_admin_pct || ''],
            ["Additional Services (Multiple of Times Direct Cost to Architect)", formData.comp_additional_services || ''],
            ["Reimbursable Expenses", formData.comp_reimbursable || ''],
            ["Other", formData.comp_other || ''],
            ["Special Confidential Requirements", formData.comp_confidential || ''],
        ];
        addSection("Compensation", compensationDetails);

        addSection("Miscellaneous Notes", [[formData.misc_notes || '']]);

        doc.save("requirement-performa.pdf");
        toast({ title: 'Download Started', description: 'PDF is being generated.' });
    };

    const renderInput = (name: string, placeholder = "") => {
        if (isEditing) {
            return <Input name={name} value={formData[name] || ''} onChange={handleInputChange} placeholder={placeholder} />;
        }
        return <div className="border-b min-h-[24px] py-1">{formData[name] || ''}</div>;
    };
     const renderTextarea = (name: string, placeholder = "") => {
        if (isEditing) {
          return <Textarea name={name} value={formData[name] || ''} onChange={handleInputChange} placeholder={placeholder} />;
        }
        return <p className="border-b min-h-[24px] py-1 whitespace-pre-wrap">{formData[name] || ''}</p>
    };

    const renderCheckbox = (name: string, label: string) => (
        <div className="flex items-center gap-2">
            <Checkbox id={name} name={name} checked={formData[name] || false} onCheckedChange={(checked) => handleCheckboxChange(name, checked)} disabled={!isEditing} />
            <label htmlFor={name}>{label}</label>
        </div>
    );
    const renderConsultantRow = (type: string) => {
        const slug = type.toLowerCase().replace(/ /g, '_').replace(/\//g, '_');
        return (
            <div key={`${slug}`} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                <p>{type}</p>
                <div className="flex items-center justify-center">{renderInput(`consultant_${slug}_basic`)}</div>
                <div className="flex items-center justify-center">{renderInput(`consultant_${slug}_additional`)}</div>
                <div className="flex items-center justify-center">{renderInput(`consultant_${slug}_architect`)}</div>
                <div className="flex items-center justify-center">{renderInput(`consultant_${slug}_owner`)}</div>
            </div>
        )
    }

    const consultantTypes = ["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Solar", "Construction Cost", "Other", " ", "  ", "   ", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"];

    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }


    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Requirement Performa</CardTitle>
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
                <CardContent className="space-y-4">
                     <div className="space-y-4 printable-content">
                        <FormRow label="Project:">{renderInput("project_name")}</FormRow>
                        <FormRow label="Address:">{renderInput("project_address")}</FormRow>
                        <FormRow label="Project No:">{renderInput("project_no")}</FormRow>
                        <FormRow label="Prepared By:">{renderInput("prepared_by")}</FormRow>
                        <FormRow label="Prepared Date:">{renderInput("prepared_date", "YYYY-MM-DD")}</FormRow>

                        <SectionTitle>About Owner</SectionTitle>
                        <FormRow label="Full Name:">{renderInput("owner_name")}</FormRow>
                        <FormRow label="Address (Office):">{renderInput("owner_office_address")}</FormRow>
                        <FormRow label="Address (Res.):">{renderInput("owner_res_address")}</FormRow>
                        <FormRow label="Phone (Office):">{renderInput("owner_office_phone")}</FormRow>
                        <FormRow label="Phone (Res.):">{renderInput("owner_res_phone")}</FormRow>
                        <FormRow label="Owner's Project Representative Name:">{renderInput("owner_rep_name")}</FormRow>
                        <FormRow label="Address (Office):">{renderInput("owner_rep_office_address")}</FormRow>
                        <FormRow label="Address (Res.):">{renderInput("owner_rep_res_address")}</FormRow>
                        <FormRow label="Phone (Office):">{renderInput("owner_rep_office_phone")}</FormRow>
                        <FormRow label="Phone (Res.):">{renderInput("owner_rep_res_phone")}</FormRow>

                        <SectionTitle>About Project</SectionTitle>
                        <FormRow label="Address:">{renderInput("project_about_address")}</FormRow>
                        <FormRow label="Project Reqt.">
                            <div className="space-y-2">
                                {renderCheckbox("req_architectural", "Architectural Designing")}
                                {renderCheckbox("req_interior", "Interior Decoration")}
                                {renderCheckbox("req_landscaping", "Landscaping")}
                                {renderCheckbox("req_turnkey", "Turnkey")}
                                {renderCheckbox("req_other", "Other")}
                            </div>
                        </FormRow>
                        <FormRow label="Project Type:">
                            <div className="space-y-2">
                                {renderCheckbox("type_commercial", "Commercial")}
                                {renderCheckbox("type_residential", "Residential")}
                            </div>
                        </FormRow>
                        <FormRow label="Project Status:">
                            <div className="space-y-2">
                                {renderCheckbox("status_new", "New")}
                                {renderCheckbox("status_addition", "Addition")}
                                {renderCheckbox("status_rehab", "Rehabilitation/Renovation")}
                            </div>
                        </FormRow>
                        <FormRow label="Project Area:">{renderInput("project_area")}</FormRow>
                        <FormRow label="Special Requirments of Project:">{renderTextarea("project_special_reqs")}</FormRow>
                        <FormRow label="Project's Cost:">
                            <div className="space-y-2">
                                {renderCheckbox("cost_architectural", "Architectural Designing")}
                                {renderCheckbox("cost_interior", "Interior Decoration")}
                                {renderCheckbox("cost_landscaping", "Landscaping")}
                                {renderCheckbox("cost_construction", "Construction")}
                                {renderCheckbox("cost_turnkey", "Turnkey")}
                                {renderCheckbox("cost_other", "Other")}
                            </div>
                        </FormRow>
                        <FormRow label="First Information about Project:">{renderInput("date_first_info", "YYYY-MM-DD")}</FormRow>
                        <FormRow label="First Meeting:">{renderInput("date_first_meeting", "YYYY-MM-DD")}</FormRow>
                        <FormRow label="First Working on Project:">{renderInput("date_first_working", "YYYY-MM-DD")}</FormRow>
                        <FormRow label="First Proposal:">
                            <div className="flex gap-4">
                                <div className="w-1/2">{renderInput("date_proposal1_start", "Start Date")}</div>
                                <div className="w-1/2">{renderInput("date_proposal1_completion", "Completion Date")}</div>
                            </div>
                        </FormRow>
                        <FormRow label="Second Proposal:">
                            <div className="flex gap-4">
                                <div className="w-1/2">{renderInput("date_proposal2_start", "Start Date")}</div>
                                <div className="w-1/2">{renderInput("date_proposal2_completion", "Completion Date")}</div>
                            </div>
                        </FormRow>
                        <FormRow label="Working on Finalized Proposal:">{renderInput("date_final_proposal", "YYYY-MM-DD")}</FormRow>
                        <FormRow label="Revised Presentation:">{renderInput("date_revised_presentation", "YYYY-MM-DD")}</FormRow>
                        <FormRow label="Quotation:">{renderInput("date_quotation", "YYYY-MM-DD")}</FormRow>
                        <FormRow label="Drawings:">
                            <div className="flex gap-4">
                                <div className="w-1/2">{renderInput("date_drawings_start", "Start Date")}</div>
                                <div className="w-1/2">{renderInput("date_drawings_completion", "Completion Date")}</div>
                            </div>
                        </FormRow>
                        <FormRow label="Other Major Projects Milestone Dates:">{renderTextarea("date_other_milestones")}</FormRow>

                        <SectionTitle>Provided by Owner</SectionTitle>
                        <FormRow label="">{renderCheckbox("provided_program", "Program:")}</FormRow>
                        <FormRow label="">{renderCheckbox("provided_schedule", "Suggested Schedule:")}</FormRow>
                        <FormRow label="">{renderCheckbox("provided_legal", "Legal Site Description & Other Concerned Documents:")}</FormRow>
                        <FormRow label="">{renderCheckbox("provided_survey", "Land Survey Report:")}</FormRow>
                        <FormRow label="">{renderCheckbox("provided_geo", "Geo-Technical, Tests and Other Site Information:")}</FormRow>
                        <FormRow label="">{renderCheckbox("provided_drawings", "Existing Structure's Drawings:")}</FormRow>

                        <SectionTitle>Compensation</SectionTitle>
                        <FormRow label="Initial Payment:">{renderInput("comp_initial_payment")}</FormRow>
                        <FormRow label="Basic Services (% of Cost of Construction):">{renderInput("comp_basic_services_pct")}</FormRow>
                        <div className="pl-4 md:pl-8">
                            <p className="font-medium mb-2">Breakdown by Phase:</p>
                            <FormRow label="Schematic Design %:">{renderInput("comp_schematic_pct")}</FormRow>
                            <FormRow label="Design Development %:">{renderInput("comp_dev_pct")}</FormRow>
                            <FormRow label="Construction Doc's %:">{renderInput("comp_docs_pct")}</FormRow>
                            <FormRow label="Bidding / Negotiation %:">{renderInput("comp_bidding_pct")}</FormRow>
                            <FormRow label="Construction Contract Admin %:">{renderInput("comp_admin_pct")}</FormRow>
                        </div>
                        <FormRow label="Additional Services (Multiple of Times Direct Cost to Architect):">{renderInput("comp_additional_services")}</FormRow>
                        <FormRow label="Reimbursable Expenses:">{renderInput("comp_reimbursable")}</FormRow>
                        <FormRow label="Other:">{renderInput("comp_other")}</FormRow>
                        <FormRow label="Special Confidential Requirements:">{renderTextarea("comp_confidential")}</FormRow>

                        <SectionTitle>Miscellaneous Notes</SectionTitle>
                        {isEditing ? <Textarea name="misc_notes" value={formData.misc_notes || ''} onChange={handleInputChange} disabled={!isEditing} rows={5}/> : <div className="form-value min-h-[120px] p-2 border-b whitespace-pre-wrap" data-value={formData.misc_notes}>{formData.misc_notes}</div>}
                        

                        <SectionTitle>Consultants</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 font-semibold">
                            <p>Type</p>
                            <p className="text-center">Within Basic Fee</p>
                            <p className="text-center">Additional Fee</p>
                            <p className="text-center">Architect</p>
                            <p className="text-center">Owner</p>
                        </div>
                        <Separator/>
                        {consultantTypes.map(renderConsultantRow)}

                        <SectionTitle>Requirements</SectionTitle>
                        <FormRow label="Residence Nos:">{renderInput("req_residence_nos")}</FormRow>
                        <FormRow label="Size of plot:">{renderInput("req_plot_size")}</FormRow>
                        <FormRow label="Number of Bedrooms:">{renderInput("req_bedrooms")}</FormRow>
                        <FormRow label="Specifications:">{renderInput("req_specifications")}</FormRow>
                        <FormRow label="Number of Dressing Rooms:">{renderInput("req_dressing_rooms")}</FormRow>
                        <FormRow label="Number of Bath Rooms:">{renderInput("req_bathrooms")}</FormRow>
                        <FormRow label="Living Rooms:">{renderInput("req_living_rooms")}</FormRow>
                        <FormRow label="Breakfast:">{renderInput("req_breakfast")}</FormRow>
                        <FormRow label="Dinning:">{renderInput("req_dinning")}</FormRow>
                        <FormRow label="Servant Kitchen:">{renderInput("req_servant_kitchen")}</FormRow>
                        <FormRow label="Self Kitchenett:">{renderInput("req_kitchenette")}</FormRow>
                        <FormRow label="Garage:">{renderInput("req_garage")}</FormRow>
                        <FormRow label="Servant Quarters:">{renderInput("req_servant_quarters")}</FormRow>
                        <FormRow label="Guard Room:">{renderInput("req_guard_room")}</FormRow>
                        <FormRow label="Study Room:">{renderInput("req_study_room")}</FormRow>
                        <FormRow label="Stores:">{renderInput("req_stores")}</FormRow>
                        <FormRow label="Entertainment Area:">{renderInput("req_entertainment")}</FormRow>
                        <FormRow label="Patio:">{renderInput("req_patio")}</FormRow>
                        <FormRow label="Atrium:">{renderInput("req_atrium")}</FormRow>
                        <FormRow label="Remarks:">{renderTextarea("req_remarks")}</FormRow>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
};

export default RequirementPerformaPage;

