
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  Save,
  Loader2,
  Download,
  ArrowLeft,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  useFirestore,
  useUser,
  useMemoFirebase,
  FirestorePermissionError,
  errorEmitter,
  useStorage,
} from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';

const SITE_SURVEY_DOC_ID = 'site-survey';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <>
    <h3 className="text-lg font-semibold mt-6 mb-3">{children}</h3>
    <Separator className="mb-4" />
  </>
);

const FormRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2 md:gap-4 py-2">
    <Label className="md:text-right font-semibold pt-1">{label}</Label>
    <div className="md:col-span-2">{children}</div>
  </div>
);

const ChecklistItem = ({
  name,
  label,
  formData,
  handleCheckboxChange,
  isEditing,
}: {
  name: string;
  label: string;
  formData: any;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  isEditing: boolean;
}) => (
  <div className="flex items-center gap-2">
    <Checkbox
      id={name}
      checked={formData[name] || false}
      onCheckedChange={(checked) =>
        handleCheckboxChange(name, checked as boolean)
      }
      disabled={!isEditing}
    />
    <Label htmlFor={name} className="font-normal">
      {label}
    </Label>
  </div>
);


const SiteSurveyPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();

  const docRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/siteSurveys/${SITE_SURVEY_DOC_ID}`);
  }, [user, firestore]);

  useEffect(() => {
    if (!docRef) {
        setIsLoading(false);
        return
    };
    setIsLoading(true);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsLoading(false));
  }, [docRef]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
  };
    const handleRadioChange = (name: string, value: string) => {
        if (!isEditing) return;
        setFormData({...formData, [name]: value});
    }

  const handleSave = () => {
    if (!docRef) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not authenticated.',
      });
      return;
    }
    setIsSaving(true);
    setDoc(docRef, formData, { merge: true })
      .then(() => {
        toast({ title: 'Success', description: 'Site survey data saved.' });
        setIsEditing(false);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: formData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSaving(false));
  };
  
    const handleDownload = async () => {
        const doc = new jsPDF();
        let y = 15;

        // --- PDF Header ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("SITE SURVEY", 105, y, { align: 'center' });
        y += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("ARCHITECTURAL - ENGINEERING - CONSTRUCTIONS", 105, y, { align: 'center' });
        y += 5;
        doc.text("PREMISES REVIEW FOR PROPOSED BRANCH/OFFICE", 105, y, { align: 'center' });
        y += 8;

        const addSection = (title: string, data: (string | [string, string])[][]) => {
            if (y > 250) {
                doc.addPage();
                y = 15;
            }
            autoTable(doc, {
                startY: y,
                head: [[{ content: title, styles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } }]],
                body: data,
                theme: 'grid',
                columnStyles: { 0: { fontStyle: 'bold' } },
                didDrawPage: (data) => { y = data.cursor?.y || 0; }
            });
            y = (doc as any).lastAutoTable.finalY + 5;
        }
        
        const getYesNo = (fieldName: string) => formData[fieldName] ? 'Yes' : 'No';

        // --- Location ---
        addSection("Location", [
            ["Purpose", formData.purpose || ''],
            ["City", formData.city || ''],
            ["Region", formData.region || ''],
            ["Address", formData.address || ''],
        ]);

        // --- Legal File ---
        addSection("Legal File", [
            ["Name of Owner", formData.owner_name || ''],
            ["Completion Certificate", getYesNo('completion_cert')],
            ["Is Leased", `${getYesNo('is_leased')} (As informed by Owner Representative)`],
        ]);

        // --- Area ---
        addSection("Area (Attach as-built plan(s))", [
            ["Maximum Frontage (ft)", formData.frontage || ''],
            ["Maximum Depth (ft)", formData.depth || ''],
            ["Total Area (Sqft)", formData.total_area || ''],
            ["Minimum Clear Height (ft)", formData.clear_height || ''],
            ["Building Plot Size", formData.plot_size || ''],
            ["Covered Area (Basement)", formData.covered_basement || ''],
            ["Covered Area (Ground Floor)", formData.covered_ground || ''],
            ["No. of Stories/Floors", formData.stories || ''],
        ]);
        
        // --- Building Overview ---
        const buildingOverviewData = [
            ["Independent Premises", formData.independent_premises || ''],
            ["Status", formData.status || ''],
            ["Type of Premises", formData.premises_type || ''],
            ["Age of Premises", formData.premises_age || ''],
            ["Interior of Premises", formData.premises_interior || ''],
            ["Type of Construction", formData.construction_type || ''],
            ["Independent Entrance", getYesNo('independent_entrance')],
            ["Staff Staircase", getYesNo('staff_staircase')],
            ["Emergency Exit", `${getYesNo('emergency_exit')} (Can provide if not available: ${getYesNo('can_provide_exit')})`],
            ["Ramp Available", `${getYesNo('ramp_available')} (Can provide if not available: ${getYesNo('can_provide_ramp')})`],
            ["Seepage", `${getYesNo('seepage')} (Area: ${formData.seepage_area || 'N/A'}, Cause: ${formData.seepage_cause || 'N/A'})`],
            ["Generator Space", getYesNo('generator_space')],
            ["Property Utilization", [
                formData.pu_res && "Fully residential",
                formData.pu_com && "Fully Commercial",
                formData.pu_dual && "Dual use",
                formData.pu_ind && "Industrial"
            ].filter(Boolean).join(', ')],
            ["Building plinth level from road", formData.plinth_level || ''],
            ["Flooding Risk", getYesNo('flooding_risk')],
            ["Disable Access", getYesNo('disable_access')],
            ["Condition of roof waterproofing", formData.roof_waterproofing || ''],
            ["Parking Available", `${getYesNo('parking_available')} (On Main Road)`],
            ["Road Approachable", getYesNo('road_approachable')],
            ["Hazard in Vicinity (300m)", getYesNo('hazard_vicinity')],
            ["Wall Masonry Material", formData.wall_masonry_material || ''],
            ["Signage Space", getYesNo('signage_space')],
            ["Major Retainable Elements", [
                formData.mrb_wt && "Water Tank",
                formData.mrb_v && "Vault",
                formData.mrb_sf && "Subflooring",
                formData.mrb_sc && "Staircase",
                formData.mrb_o && "Others"
            ].filter(Boolean).join(', ')],
            ["In case of Plot, existing level from road", formData.plot_levels || ''],
        ];
        addSection("Building Overview", buildingOverviewData);


        // --- Utilities ---
        addSection("Utilities", [
            ["Sanctioned Electrical Load", formData.electrical_load || ''],
            ["Type of electrical load", [
                formData.el_com && "Commercial",
                formData.el_ind && "Industrial",
                formData.el_res && "Residential"
            ].filter(Boolean).join(', ')],
            ["Electrical Meter", formData.electrical_meter || ''],
            ["Piped Water", getYesNo('piped_water')],
            ["Underground Tank", getYesNo('underground_tank')],
            ["Overhead Tank", `${getYesNo('overhead_tank')} (Type: ${formData.overhead_tank_type || 'N/A'})`],
            ["Type of Water", formData.water_type || ''],
            ["Gas Connection", getYesNo('gas_connection')],
            ["Sewerage Line", getYesNo('sewerage_line')],
        ]);
        
        // --- Bounded As ---
        addSection("Bounded As", [
            ["Front", formData.bound_front || ''],
            ["Back", formData.bound_back || ''],
            ["Right", formData.bound_right || ''],
            ["Left", formData.bound_left || ''],
        ]);
        
        // --- Rental Detail ---
        addSection("Rental Detail", [
            ["Acquisition", formData.acquisition || ''],
            ["Expected Rental/month", formData.expected_rental || ''],
            ["Expected Advance (# of months)", formData.expected_advance || ''],
            ["Expected period of lease", formData.lease_period || ''],
            ["Annual increase in rental", formData.rental_increase || ''],
        ]);
        
        // --- Survey Conducted By ---
        addSection("Survey Conducted By", [
            ["Name", formData.surveyor_name || ''],
            ["Designation", formData.surveyor_designation || ''],
            ["Contact", formData.surveyor_contact || ''],
            ["Cell", formData.surveyor_cell || ''],
            ["Landline", formData.surveyor_landline || ''],
            ["Email", formData.surveyor_email || ''],
            ["Date", formData.survey_date || ''],
        ]);


        // --- Footer ---
        const footerY = doc.internal.pageSize.height - 15;
        doc.setLineWidth(0.2);
        doc.line(14, footerY, 196, footerY);
        y += 4;
        doc.setFontSize(7);
        const footerText = "Y-101 (Com), Phase-III, DHA Lahore Cantt | 0321-6995378, 042-35692522 | info@isbahhassan.com | www.isbahhassan.com";
        doc.text(footerText, 105, footerY + 4, { align: 'center'});

        doc.save('site-survey-proforma.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

  const renderInput = (name: string, placeholder?: string) => {
      if (isEditing) {
          return <Input name={name} value={formData[name] || ''} onChange={handleInputChange} placeholder={placeholder} />
      }
      return <p className="border-b min-h-[24px] py-1">{formData[name] || ''}</p>
  }
  
  const renderTextarea = (name: string) => {
      if(isEditing) {
          return <Textarea name={name} value={formData[name] || ''} onChange={handleInputChange} rows={3} />
      }
      return <p className="border-b min-h-[72px] py-1 whitespace-pre-wrap">{formData[name] || ''}</p>
  }
    const renderRadioGroup = (name: string, items: string[]) => {
        return <RadioGroup name={name} value={formData[name]} onValueChange={(v) => handleRadioChange(name, v)} className="flex gap-4 mt-2" disabled={!isEditing}>
            {items.map(item => <div key={item} className="flex items-center space-x-2"><RadioGroupItem value={item.toLowerCase()} id={`${name}-${item.toLowerCase()}`} /><Label htmlFor={`${name}-${item.toLowerCase()}`}>{item}</Label></div>)}
        </RadioGroup>
    }

    const renderRadioGroupWithNote = (name: string, items: string[], note?: string) => {
        const title = name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return <div className="flex items-center gap-2 flex-wrap">
            <Label>{title}?</Label>
            <RadioGroup className="flex gap-4" value={formData[name]} onValueChange={(v) => handleRadioChange(name, v)} disabled={!isEditing}>
              {items.map(item => <div key={item} className="flex items-center space-x-2"><RadioGroupItem value={item.toLowerCase()} /><Label>{item}</Label></div>)}
            </RadioGroup>
            {note && <Label className="text-sm text-muted-foreground">{note}</Label>}
        </div>
    }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-center text-center">
            <CardTitle className="text-2xl">SITE SURVEY</CardTitle>
            <p className="text-sm text-muted-foreground">ARCHITECTURAL - ENGINEERING - CONSTRUCTIONS</p>
            <p className="font-semibold">PREMISES REVIEW FOR PROPOSED BRANCH/OFFICE</p>
            <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleDownload}><Download className="mr-2"/>PDF</Button>
                {isEditing ? (
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Save
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}><Edit className="mr-2" /> Edit</Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SectionTitle>Location</SectionTitle>
            <FormRow label="Purpose (Branch/ATM/etc.):">{renderInput("purpose")}</FormRow>
            <FormRow label="City:">{renderInput("city")}</FormRow>
            <FormRow label="Region:">{renderInput("region")}</FormRow>
            <FormRow label="Address:">{renderTextarea("address")}</FormRow>
            
            <SectionTitle>Legal File</SectionTitle>
            <FormRow label="Name of Owner(s) of the Premises:">{renderInput("owner_name")}</FormRow>
            <FormRow label="Completion Certificate:">{renderRadioGroupWithNote('completion_cert', ['Yes', 'No'])}</FormRow>
            <FormRow label="Is Leased:">{renderRadioGroupWithNote('is_leased', ['Yes', 'No'], '(As informed by Owner Representative)')}</FormRow>

            <SectionTitle>Area</SectionTitle>
            <p className="text-sm text-muted-foreground -mt-2 mb-2">Attach as-built plan(s)</p>
            <div className="grid grid-cols-2 gap-4">
                <FormRow label="Maximum Frontage (ft):">{renderInput("frontage")}</FormRow>
                <FormRow label="Maximum Depth (ft):">{renderInput("depth")}</FormRow>
                <FormRow label="Total Area (Sqft):">{renderInput("total_area")}</FormRow>
                <FormRow label="Minimum Clear Height (ft):">{renderInput("clear_height")}</FormRow>
                <FormRow label="Building Plot Size:">{renderInput("plot_size")}</FormRow>
                <FormRow label="Covered Area (Basement):">{renderInput("covered_basement")}</FormRow>
                <FormRow label="Covered Area (Ground Floor):">{renderInput("covered_ground")}</FormRow>
                <FormRow label="No. of Stories/Floors:">{renderInput("stories")}</FormRow>
            </div>
            
            <SectionTitle>Building Overview</SectionTitle>
            <FormRow label="Independent Premises:">{renderInput("independent_premises")}</FormRow>
            <FormRow label="Status:">{renderRadioGroup('status', ['Shell', 'Semi Finished', 'Finished'])}</FormRow>
            <FormRow label="Type of Premises:">{renderRadioGroup('premises_type', ['Single Story', 'Multi Story'])}</FormRow>
            <FormRow label="Age of Premises:">{renderInput("premises_age")}</FormRow>
            <FormRow label="Interior of Premises:">{renderRadioGroup('premises_interior', ['Furnished', 'Un-Furnished'])}</FormRow>
            <FormRow label="Type of Construction:">{renderInput("construction_type")}</FormRow>
            <FormRow label="Is Independent Entrance Provided:">{renderRadioGroupWithNote('independent_entrance', ['Yes', 'No'])}</FormRow>
            <FormRow label="Is Staircase for Staff movement available:">{renderRadioGroupWithNote('staff_staircase', ['Yes', 'No'])}</FormRow>
            <FormRow label="Emergency Exit:">{renderRadioGroupWithNote('emergency_exit', ['Yes', 'No'], "Can provide if not available?")} {isEditing && <Checkbox id="can_provide_exit" checked={formData.can_provide_exit || false} onCheckedChange={(c) => handleCheckboxChange('can_provide_exit', c as boolean)} />}</FormRow>
            <FormRow label="Ramp Available for disabled persons:">{renderRadioGroupWithNote('ramp_available', ['Yes', 'No'], "Can provide if not available?")} {isEditing && <Checkbox id="can_provide_ramp" checked={formData.can_provide_ramp || false} onCheckedChange={(c) => handleCheckboxChange('can_provide_ramp', c as boolean)} />}</FormRow>
            <FormRow label="Seepage in Building:">{renderRadioGroupWithNote('seepage', ['Yes', 'No'])}</FormRow>
            {formData.seepage && <>
                <FormRow label="Area of Seepage:">{renderInput("seepage_area")}</FormRow>
                <FormRow label="Possible cause of Seepage:">{renderInput("seepage_cause")}</FormRow>
            </>}
            <FormRow label="Space available for Generator:">{renderRadioGroupWithNote('generator_space', ['Yes', 'No'])}</FormRow>
            <FormRow label="Property Utilization:">
                <div className="flex gap-4 flex-wrap">
                    <ChecklistItem name="pu_res" label="Fully residential" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="pu_com" label="Fully Commercial" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="pu_dual" label="Dual use" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="pu_ind" label="Industrial" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                </div>
            </FormRow>
            <FormRow label="Building plinth level from road:">{renderInput("plinth_level")}</FormRow>
            <FormRow label="Is the area prone to flooding:">{renderRadioGroupWithNote('flooding_risk', ['Yes', 'No'])}</FormRow>
            <FormRow label="Is disable access as per SBP/local by laws:">{renderRadioGroupWithNote('disable_access', ['Yes', 'No'])}</FormRow>
            <FormRow label="Condition of roof waterproofing:">{renderInput("roof_waterproofing")}</FormRow>
            <FormRow label="Parking Available:">{renderRadioGroupWithNote('parking_available', ['Yes', 'No'], '(On Main Road)')}</FormRow>
            <FormRow label="Road Approachable for Fire Tender & Bowser:">{renderRadioGroupWithNote('road_approachable', ['Yes', 'No'])}</FormRow>
            <FormRow label="Any hazard in the vicinity (radius of 300m):">{renderRadioGroupWithNote('hazard_vicinity', ['Yes', 'No'])}</FormRow>
            <FormRow label="Material of Wall Masonry:">{renderInput("wall_masonry_material")}</FormRow>
            <FormRow label="Adequate Space for Signage:">{renderRadioGroupWithNote('signage_space', ['Yes', 'No'])}</FormRow>
            <FormRow label="Major Retainable Building Elements:">
                 <div className="flex gap-4 flex-wrap">
                    <ChecklistItem name="mrb_wt" label="Water Tank" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="mrb_v" label="Vault" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="mrb_sf" label="Subflooring" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="mrb_sc" label="Staircase" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="mrb_o" label="Others" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                </div>
            </FormRow>
            <FormRow label="In case of Plot, existing level from road:">{renderInput("plot_levels")}</FormRow>

            <SectionTitle>Utilities</SectionTitle>
            <FormRow label="Sanctioned Electrical Load:">{renderInput("electrical_load")}</FormRow>
            <FormRow label="Type of electrical load:">
                 <div className="flex gap-4 flex-wrap">
                    <ChecklistItem name="el_com" label="Commercial" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="el_ind" label="Industrial" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                    <ChecklistItem name="el_res" label="Residential" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                </div>
            </FormRow>
            <FormRow label="Electrical Meter:">{renderRadioGroup('electrical_meter', ['Single Phase', '3-Phase'])}</FormRow>
            <FormRow label="Piped Water available:">{renderRadioGroupWithNote('piped_water', ['Yes', 'No'])}</FormRow>
            <FormRow label="Underground Water Tank available:">{renderRadioGroupWithNote('underground_tank', ['Yes', 'No'])}</FormRow>
            <FormRow label="Overhead Water Tank available:">{renderRadioGroupWithNote('overhead_tank', ['Yes', 'No'])}</FormRow>
            {formData.overhead_tank && <FormRow label="Type of Overhead Tank:">{renderInput("overhead_tank_type")}</FormRow>}
            <FormRow label="Type of Water:">{renderRadioGroup('water_type', ['Sweet', 'Brackish'])}</FormRow>
            <FormRow label="Gas Connection available:">{renderRadioGroupWithNote('gas_connection', ['Yes', 'No'])}</FormRow>
            <FormRow label="Sewerage Line available:">{renderRadioGroupWithNote('sewerage_line', ['Yes', 'No'])}</FormRow>
            
            <SectionTitle>Bounded As</SectionTitle>
            <FormRow label="Front:">{renderInput("bound_front")}</FormRow>
            <FormRow label="Back:">{renderInput("bound_back")}</FormRow>
            <FormRow label="Right:">{renderInput("bound_right")}</FormRow>
            <FormRow label="Left:">{renderInput("bound_left")}</FormRow>
            
            <SectionTitle>Rental Detail</SectionTitle>
            <FormRow label="Acquisition:">{renderRadioGroup('acquisition', ['Rental', 'Purchase'])}</FormRow>
            <FormRow label="Expected Rental/month (PKR):">{renderInput("expected_rental")}</FormRow>
            <FormRow label="Expected Advance (# of months):">{renderInput("expected_advance")}</FormRow>
            <FormRow label="Expected period of lease:">{renderInput("lease_period")}</FormRow>
            <FormRow label="Annual increase in rental %:">{renderInput("rental_increase")}</FormRow>
            
            <SectionTitle>Survey Conducted By</SectionTitle>
            <FormRow label="Name:">{renderInput("surveyor_name")}</FormRow>
            <FormRow label="Designation:">{renderInput("surveyor_designation")}</FormRow>
            <FormRow label="Contact:">{renderInput("surveyor_contact")}</FormRow>
            <FormRow label="Cell:">{renderInput("surveyor_cell")}</FormRow>
            <FormRow label="Landline:">{renderInput("surveyor_landline")}</FormRow>
            <FormRow label="Email:">{renderInput("surveyor_email")}</FormRow>
            <FormRow label="Date:">{renderInput("survey_date")}</FormRow>

          </div>
        </CardContent>
         <CardFooter className="flex-col items-center justify-center pt-6 border-t">
            <Separator className="mb-4"/>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><MapPin size={12}/> Y-101 (Com), Phase-III, DHA Lahore Cantt</div>
                <div className="flex items-center gap-1"><Phone size={12}/> 0321-6995378, 042-35692522</div>
                <div className="flex items-center gap-1"><Mail size={12}/> info@isbahhassan.com</div>
                <div className="flex items-center gap-1"><Globe size={12}/> www.isbahhassan.com</div>
            </div>
        </CardFooter>
      </Card>
    </main>
  );
};

export default SiteSurveyPage;

    