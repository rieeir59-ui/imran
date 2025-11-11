
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
import { useAuth, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const DEFAULT_PROJECT_ID = "main-project-information";

// Helper component for form rows
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
  const [isEditing, setIsEditing] = useState(true);
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
        // Always start in editing mode, regardless of whether data exists.
        setIsEditing(true);
      })
      .catch((error) => {
        console.error("Error fetching project data:", error);
        toast({
          variant: "destructive",
          title: "Load Failed",
          description: "Could not load project data.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectDocRef, toast]);

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
    setDocumentNonBlocking(projectDocRef, formData, { merge: true });
    
    // Use a short delay to allow the user to see the saving state, then exit editing mode.
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast({
        title: "Project Saved",
        description: "Your project information has been saved.",
      });
    }, 500);
  };

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

  const renderInput = (name: string, placeholder = "") => (
    <Input
      name={name}
      value={formData[name] || ''}
      onChange={handleInputChange}
      disabled={!isEditing}
      placeholder={placeholder}
    />
  );
  
  const renderTextarea = (name: string, placeholder = "") => (
      <Textarea
        name={name}
        value={formData[name] || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
        placeholder={placeholder}
      />
  );

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
            <div className="flex items-center gap-1">{renderCheckbox(`consultant_${slug}_basic`)} {renderInput(`consultant_${slug}_basic_text`)}</div>
            <div className="flex items-center gap-1">{renderCheckbox(`consultant_${slug}_additional`)} {renderInput(`consultant_${slug}_additional_text`)}</div>
            <div className="flex items-center gap-1">{renderCheckbox(`consultant_${slug}_architect`)} {renderInput(`consultant_${slug}_architect_text`)}</div>
            <div className="flex items-center gap-1">{renderCheckbox(`consultant_${slug}_owner`)} {renderInput(`consultant_${slug}_owner_text`)}</div>
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
              <Button onClick={() => window.print()} variant="outline"><Download /> Download</Button>
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
                <FormRow label="Program:">{renderCheckbox("provided_program", "")}</FormRow>
                <FormRow label="Suggested Schedule:">{renderCheckbox("provided_schedule", "")}</FormRow>
                <FormRow label="Legal Site Description & Other Concerned Documents:">{renderCheckbox("provided_legal", "")}</FormRow>
                <FormRow label="Land Survey Report:">{renderCheckbox("provided_survey", "")}</FormRow>
                <FormRow label="Geo-Technical, Tests and Other Site Information:">{renderCheckbox("provided_geo", "")}</FormRow>
                <FormRow label="Existing Structure's Drawings:">{renderCheckbox("provided_drawings", "")}</FormRow>

                <SectionTitle>Compensation</SectionTitle>
                <FormRow label="Initial Payment:">{renderInput("comp_initial_payment")}</FormRow>
                <FormRow label="Basic Services (% of Cost of Construction):">{renderInput("comp_basic_services_pct")}</FormRow>
                <div className="pl-4">
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
                <Textarea name="misc_notes" value={formData.misc_notes || ''} onChange={handleInputChange} disabled={!isEditing} rows={5}/>

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
