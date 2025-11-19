
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Save, Loader2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const DEFAULT_PROJECT_ID = "main-project-information";

const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
    <Label className="md:text-right">{label}</Label>
    <div className="md:col-span-2">{children}</div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <>
    <h3 className="text-lg font-semibold mt-6 mb-3">{children}</h3>
    <Separator className="mb-4" />
  </>
);

export default function ProjectsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const projectDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/projectInformation/${DEFAULT_PROJECT_ID}`);
  }, [user, firestore]);

  useEffect(() => {
    if (!projectDocRef) return;

    setIsLoading(true);
    getDoc(projectDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setFormData(docSnap.data() || {});
        }
      })
      .catch(async (serverError) => {
        console.error("Error fetching project data:", serverError);
        const permissionError = new FirestorePermissionError({
          path: projectDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectDocRef]);

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
    if (!projectDocRef) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "User not authenticated.",
      });
      return;
    }

    setIsSaving(true);
    setDoc(projectDocRef, formData, { merge: true })
      .then(() => {
        setIsSaving(false);
        setIsEditing(false);
        toast({
          title: "Project Saved",
          description: "Your project information has been saved.",
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: projectDocRef.path,
          operation: 'write',
          requestResourceData: formData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
      });
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    let y = 15;
    const x = 14;
    const x2 = 105;
    const pageHeight = doc.internal.pageSize.height;
    const bottomMargin = 20;

    const checkPageBreak = () => {
        if (y > pageHeight - bottomMargin) {
            doc.addPage();
            y = 15;
        }
    };

    const addTitle = (title: string) => {
        checkPageBreak();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, x, y);
        y += 7;
        doc.setLineWidth(0.5);
        doc.line(x, y-2, 195, y-2);
        y += 2;
        doc.setFont('helvetica', 'normal');
    };

    const addField = (label: string, value: string | undefined, isTextarea = false) => {
        checkPageBreak();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, x, y);
        doc.setFont('helvetica', 'normal');
        
        const valueX = x + 60;
        const fieldWidth = 195 - valueX;

        if (value) {
          const splitText = doc.splitTextToSize(value, fieldWidth);
          const textHeight = doc.getTextDimensions(splitText).h;
          if (y + textHeight > pageHeight - bottomMargin) {
            doc.addPage();
            y = 15;
          }
          doc.text(splitText, valueX, y);
          y += textHeight + 2;
        } else {
            y += 7;
        }
    };
    
     const addCheckboxRow = (label: string, fields: {name: string, label: string}[]) => {
        checkPageBreak();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, x, y);
        doc.setFont('helvetica', 'normal');

        let currentX = x + 60;
        fields.forEach(field => {
            const checkboxText = `${formData[field.name] ? '[X]' : '[ ]'} ${field.label}`;
            const textWidth = doc.getTextWidth(checkboxText);
            if (currentX + textWidth > 195) {
                y += 7;
                currentX = x + 60;
                checkPageBreak();
            }
            doc.text(checkboxText, currentX, y);
            currentX += textWidth + 5;
        });
        y += 7;
    };
    
    doc.setFontSize(16);
    doc.text("Project Information", 105, y, { align: 'center' });
    y += 10;
    
    addField("Project", formData.project_name);
    addField("Address", formData.project_address);
    addField("Project No", formData.project_no);
    addField("Prepared By", formData.prepared_by);
    addField("Prepared Date", formData.prepared_date);

    addTitle("About Owner");
    addField("Full Name", formData.owner_name);
    addField("Address (Office)", formData.owner_office_address);
    addField("Address (Res.)", formData.owner_res_address);
    addField("Phone (Office)", formData.owner_office_phone);
    addField("Phone (Res.)", formData.owner_res_phone);
    addField("Owner's Project Representative Name", formData.owner_rep_name);
    addField("Address (Office)", formData.owner_rep_office_address);
    addField("Address (Res.)", formData.owner_rep_res_address);
    addField("Phone (Office)", formData.owner_rep_office_phone);
    addField("Phone (Res.)", formData.owner_rep_res_phone);

    addTitle("About Project");
    addField("Address", formData.project_about_address);
    addCheckboxRow("Project Reqt.", [
      { name: "req_architectural", label: "Architectural Designing" },
      { name: "req_interior", label: "Interior Decoration" },
      { name: "req_landscaping", label: "Landscaping" },
      { name: "req_turnkey", label: "Turnkey" },
      { name: "req_other", label: "Other" }
    ]);
    addCheckboxRow("Project Type", [
        { name: "type_commercial", label: "Commercial" },
        { name: "type_residential", label: "Residential" },
    ]);
    addCheckboxRow("Project Status", [
        { name: "status_new", label: "New" },
        { name: "status_addition", label: "Addition" },
        { name: "status_rehab", label: "Rehabilitation/Renovation" },
    ]);
    addField("Project Area", formData.project_area);
    addField("Special Requirements of Project", formData.project_special_reqs, true);
    addCheckboxRow("Project's Cost", [
        { name: "cost_architectural", label: "Architectural Designing" },
        { name: "cost_interior", label: "Interior Decoration" },
        { name: "cost_landscaping", label: "Landscaping" },
        { name: "cost_construction", label: "Construction" },
        { name: "cost_turnkey", label: "Turnkey" },
        { name: "cost_other", label: "Other" }
    ]);
    addField("First Information about Project", formData.date_first_info);
    addField("First Meeting", formData.date_first_meeting);
    addField("First Working on Project", formData.date_first_working);
    addField("First Proposal", `Start: ${formData.date_proposal1_start || ''}  Completion: ${formData.date_proposal1_completion || ''}`);
    addField("Second Proposal", `Start: ${formData.date_proposal2_start || ''}  Completion: ${formData.date_proposal2_completion || ''}`);
    addField("Working on Finalized Proposal", formData.date_final_proposal);
    addField("Revised Presentation", formData.date_revised_presentation);
    addField("Quotation", formData.date_quotation);
    addField("Drawings", `Start: ${formData.date_drawings_start || ''}  Completion: ${formData.date_drawings_completion || ''}`);
    addField("Other Major Projects Milestone Dates", formData.date_other_milestones, true);

    addTitle("Provided by Owner");
    doc.text(`${formData.provided_program ? '[X]' : '[ ]'} Program`, x, y); y+=6;
    doc.text(`${formData.provided_schedule ? '[X]' : '[ ]'} Suggested Schedule`, x, y); y+=6;
    doc.text(`${formData.provided_legal ? '[X]' : '[ ]'} Legal Site Description & Other Concerned Documents`, x, y); y+=6;
    doc.text(`${formData.provided_survey ? '[X]' : '[ ]'} Land Survey Report`, x, y); y+=6;
    doc.text(`${formData.provided_geo ? '[X]' : '[ ]'} Geo-Technical, Tests and Other Site Information`, x, y); y+=6;
    doc.text(`${formData.provided_drawings ? '[X]' : '[ ]'} Existing Structure's Drawings`, x, y); y+=10;

    addTitle("Compensation");
    addField("Initial Payment", formData.comp_initial_payment);
    addField("Basic Services (% of Cost of Construction)", formData.comp_basic_services_pct);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Breakdown by Phase:", x + 5, y); y+=6;
    doc.setFont('helvetica', 'normal');
    addField("Schematic Design %", formData.comp_schematic_pct);
    addField("Design Development %", formData.comp_dev_pct);
    addField("Construction Doc's %", formData.comp_docs_pct);
    addField("Bidding / Negotiation %", formData.comp_bidding_pct);
    addField("Construction Contract Admin %", formData.comp_admin_pct);

    addField("Additional Services (Multiple of Times Direct Cost to Architect)", formData.comp_additional_services);
    addField("Reimbursable Expenses", formData.comp_reimbursable);
    addField("Other", formData.comp_other);
    addField("Special Confidential Requirements", formData.comp_confidential, true);

    addTitle("Miscellaneous Notes");
    addField("", formData.misc_notes, true);

    addTitle("Consultants");
    const consultantTypes = ["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Solar", "Construction Cost", "Other 1", "Other 2", "Other 3", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"];
    const consultantHead = [['Type', 'Basic', 'Add.', 'Arch', 'Owner']];
    const consultantBody = consultantTypes.map(type => {
        const slug = type.toLowerCase().replace(/ /g, '_').replace(/\//g, '_');
        return [
            type,
            formData[`consultant_${slug}_basic`] || '',
            formData[`consultant_${slug}_additional`] || '',
            formData[`consultant_${slug}_architect`] || '',
            formData[`consultant_${slug}_owner`] || ''
        ]
    });
    autoTable(doc, {
        startY: y,
        head: consultantHead,
        body: consultantBody,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [22, 163, 74], fontStyle: 'bold' }
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    
    addTitle("Requirements");
    addField("Residence Nos", formData.req_residence_nos);
    addField("Size of plot", formData.req_plot_size);
    addField("Number of Bedrooms", formData.req_bedrooms);
    addField("Specifications", formData.req_specifications);
    addField("Number of Dressing Rooms", formData.req_dressing_rooms);
    addField("Number of Bath Rooms", formData.req_bathrooms);
    addField("Living Rooms", formData.req_living_rooms);
    addField("Breakfast", formData.req_breakfast);
    addField("Dinning", formData.req_dinning);
    addField("Servant Kitchen", formData.req_servant_kitchen);
    addField("Self Kitchenette", formData.req_kitchenette);
    addField("Garage", formData.req_garage);
    addField("Servant Quarters", formData.req_servant_quarters);
    addField("Guard Room", formData.req_guard_room);
    addField("Study Room", formData.req_study_room);
    addField("Stores", formData.req_stores);
    addField("Entertainment Area", formData.req_entertainment);
    addField("Patio", formData.req_patio);
    addField("Atrium", formData.req_atrium);
    addField("Remarks", formData.req_remarks, true);

    doc.save("project-information.pdf");
  }


  if (isUserLoading || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading Project...</p>
      </div>
    );
  }

  if (!user && !isUserLoading) {
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

  const renderInput = (name: string, placeholder = "") => {
    const value = formData[name] || '';
    if (isEditing) {
      return (
        <Input
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      );
    }
    return <div className="form-value min-h-[2.5rem] p-2 border-b" data-value={value}>{value}</div>;
  };
  
  const renderTextarea = (name: string, placeholder = "") => {
    const value = formData[name] || '';
    if (isEditing) {
      return (
        <Textarea
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      );
    }
    return <div className="form-value min-h-[80px] p-2 border-b" data-value={value}>{value}</div>;
  };

  const renderCheckbox = (name: string, label?: string) => (
      <div className="flex items-center gap-2">
          <Checkbox 
              id={name} 
              name={name}
              checked={formData[name] || false} 
              onCheckedChange={(checked) => handleCheckboxChange(name, checked)}
              disabled={!isEditing}
          />
          {label && <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
          </label>}
      </div>
  );
  
  const renderConsultantRow = (type: string) => {
    const slug = type.toLowerCase().replace(/ /g, '_').replace(/\//g, '_');
    return (
        <div key={slug} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            <p>{type}</p>
            <div className="flex items-center justify-center">{renderInput(`consultant_${slug}_basic`)}</div>
            <div className="flex items-center justify-center">{renderInput(`consultant_${slug}_additional`)}</div>
            <div className="flex items-center justify-center">{renderInput(`consultant_${slug}_architect`)}</div>
            <div className="flex items-center justify-center">{renderInput(`consultant_${slug}_owner`)}</div>
        </div>
    )
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card className="printable-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 no-print">
              <Button variant="outline" asChild>
                <Link href="/"><ArrowLeft />Back</Link>
              </Button>
            </div>
            <CardTitle>PROJECT INFORMATION</CardTitle>
            <div className="flex items-center gap-2 no-print">
              <Button onClick={handleDownloadPdf} variant="outline"><Download /> Download PDF</Button>
              {isEditing ? (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
              )}
            </div>
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
                {isEditing ? <Textarea name="misc_notes" value={formData.misc_notes || ''} onChange={handleInputChange} disabled={!isEditing} rows={5}/> : <div className="form-value min-h-[120px] p-2 border-b" data-value={formData.misc_notes}>{formData.misc_notes}</div>}
                

                <SectionTitle>Consultants</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 font-semibold">
                    <p>Type</p>
                    <p className="text-center">Within Basic Fee</p>
                    <p className="text-center">Additional Fee</p>
                    <p className="text-center">Architect</p>
                    <p className="text-center">Owner</p>
                </div>
                <Separator/>
                {["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Solar", "Construction Cost", "Other 1", "Other 2", "Other 3", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"].map(renderConsultantRow)}

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
}
